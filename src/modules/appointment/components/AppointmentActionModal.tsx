// Advisor appointment action modal: inspect details and accept, reject, cancel,
// complete, mark no-show, or edit the consultation summary.

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../shared/components/ui/Modal';
import {
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} from '../hooks/mutations/useAppointmentMutations';
import { useAdvisorAppointmentDetail } from '../hooks/queries/useAppointmentQueries';
import type { AdvisorAppointment } from '../types/appointment';
import { AppointmentModalBody } from './action-modal/AppointmentModalBody';
import { AppointmentModalFooter } from './action-modal/AppointmentModalFooter';
import { AppointmentModalHero } from './action-modal/AppointmentModalHero';
import {
  APPOINTMENT_RESULT_UPDATE_ENABLED,
  type ActionMode,
  type AppointmentActionModalProps,
} from './action-modal/types';

export function AppointmentActionModal({ appointment, onClose }: AppointmentActionModalProps) {
  const [mode, setMode] = useState<ActionMode>('idle');
  const [reason, setReason] = useState('');
  const [summary, setSummary] = useState('');
  const [touched, setTouched] = useState(false);
  const mutation = useUpdateAppointmentStatusMutation();
  const cancelMutation = useCancelAppointmentMutation();
  const detailQuery = useAdvisorAppointmentDetail(appointment?.id ?? null);

  useEffect(() => {
    if (!appointment) return;
    setMode('idle');
    setReason('');
    setSummary('');
    setTouched(false);
  }, [appointment?.id]);

  const shown: AdvisorAppointment | null = useMemo(
    () => detailQuery.data ?? appointment,
    [detailQuery.data, appointment],
  );

  useEffect(() => {
    if (shown) setSummary(shown.consultationSummary ?? '');
  }, [shown?.id, shown?.consultationSummary]);

  if (!appointment || !shown) return null;

  const reasonMissing =
    (mode === 'reject' || mode === 'cancel' || mode === 'noShow') && touched && reason.trim().length === 0;
  const summaryMissing = (mode === 'complete' || mode === 'editSummary') && touched && summary.trim().length === 0;

  const resetForm = () => {
    setMode('idle');
    setReason('');
    setTouched(false);
  };

  const enterMode = (nextMode: ActionMode) => {
    setMode(nextMode);
    setTouched(false);
  };

  const runMutation = (body: Parameters<typeof mutation.mutate>[0]['body'], keepOpen = false) => {
    mutation.mutate(
      { id: shown.id, body },
      {
        onSuccess: () => {
          if (keepOpen) {
            setMode('idle');
            setTouched(false);
          } else {
            onClose();
          }
        },
      },
    );
  };

  const handleAccept = () => runMutation({ status: 'ACCEPTED' });
  const handleReject = () => {
    setTouched(true);
    if (reason.trim().length === 0) return;
    runMutation({ status: 'REJECTED', reason: reason.trim() });
  };

  // Cancellation uses the dedicated PUT /appointments/{id}/cancel endpoint.
  const handleCancel = () => {
    setTouched(true);
    if (reason.trim().length === 0) return;
    cancelMutation.mutate({ id: shown.id, reason: reason.trim() }, { onSuccess: onClose });
  };

  const handleNoShow = () => {
    if (!APPOINTMENT_RESULT_UPDATE_ENABLED) return;
    setTouched(true);
    if (reason.trim().length === 0) return;
    runMutation({ status: 'NO_SHOW', reason: reason.trim() });
  };

  const handleComplete = () => {
    if (!APPOINTMENT_RESULT_UPDATE_ENABLED) return;
    setTouched(true);
    if (summary.trim().length === 0) return;
    runMutation({ status: 'COMPLETED', consultationSummary: summary.trim() });
  };

  const handleSaveSummary = () => {
    if (!APPOINTMENT_RESULT_UPDATE_ENABLED) return;
    setTouched(true);
    if (summary.trim().length === 0) return;
    runMutation({ status: 'COMPLETED', consultationSummary: summary.trim() }, true);
  };

  return (
    <Modal open={!!appointment} onClose={onClose} title="Appointment details" className="max-w-2xl">
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        <AppointmentModalHero appointment={shown} />
        <AppointmentModalBody
          appointment={shown}
          mode={mode}
          reason={reason}
          onReasonChange={setReason}
          summary={summary}
          onSummaryChange={setSummary}
          onTouch={() => setTouched(true)}
          reasonMissing={reasonMissing}
          summaryMissing={summaryMissing}
        />
        <AppointmentModalFooter
          status={shown.status}
          mode={mode}
          isUpdating={mutation.isPending}
          isCancelling={cancelMutation.isPending}
          onClose={onClose}
          onBack={resetForm}
          onEnterMode={enterMode}
          onAccept={handleAccept}
          onReject={handleReject}
          onCancel={handleCancel}
          onNoShow={handleNoShow}
          onComplete={handleComplete}
          onSaveSummary={handleSaveSummary}
        />
      </div>
    </Modal>
  );
}
