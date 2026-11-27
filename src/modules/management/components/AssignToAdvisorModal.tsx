import { useEffect, useState } from 'react';
import { Warning as AlertTriangle, SpinnerGap, UserCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { AdvisorPickerList } from './AdvisorPickerList';
import { LoadBadge } from './LoadBadge';
import { useAssignStudents, usePreviewAssign } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignPreview, AssignmentAdvisor } from '../types/admin';
import { UserFormField } from './UserFormPrimitives';

interface AssignToAdvisorModalProps {
  open: boolean;
  onClose: () => void;
  students: { id: string; name: string }[];
  advisors: AssignmentAdvisor[];
  onDone?: () => void;
}

export function AssignToAdvisorModal({ open, onClose, students, advisors, onDone }: AssignToAdvisorModalProps) {
  const [advisorId, setAdvisorId] = useState('');
  const [preview, setPreview] = useState<AssignPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewMutation = usePreviewAssign();
  const assignMutation = useAssignStudents();

  useEffect(() => {
    if (!open) return;
    setAdvisorId('');
    setPreview(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const ids = students.map((s) => s.id);
  const nameById = new Map(students.map((s) => [s.id, s.name]));
  const advisor = advisors.find((a) => a.id === advisorId);
  const loadAfter = advisor ? advisor.activeStudents + students.length : 0;
  const overBy = advisor?.maxAdvisees != null ? Math.max(0, loadAfter - advisor.maxAdvisees) : 0;

  const choose = async (id: string) => {
    setAdvisorId(id);
    setPreview(null);
    setError(null);
    if (!id) return;
    try {
      setPreview(await previewMutation.mutateAsync({ studentIds: ids, advisorId: id }));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const confirm = async () => {
    setError(null);
    try {
      const res = await assignMutation.mutateAsync({
        studentIds: ids,
        advisorId,
        acknowledge: (preview?.appointmentCount ?? 0) > 0,
      });
      toast.success(`${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned to ${advisor?.fullName}.`);
      if (res.warning) toast.warning(`${advisor?.fullName} is now ${res.overLimitBy} over the advisory limit.`);
      onDone?.();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const cancelling = preview?.appointmentCount ?? 0;
  const subtitle = `${students.length} student${students.length === 1 ? '' : 's'} selected${students.length <= 3 ? `: ${students.map((s) => s.name).join(', ')}` : ''}`;

  return (
    <Modal open={open} onClose={assignMutation.isPending ? () => {} : onClose} title="Assign to Advisor" className="max-w-lg">
      <ModalHeader
        title="Assign to Advisor"
        description={subtitle}
        icon={<UserCheck />}
        tone="brand"
        onClose={onClose}
        closeDisabled={assignMutation.isPending}
      />

      <ModalBody className="flex flex-col gap-4">
        <UserFormField label="Advisor" required>
          {advisors.length === 0 ? (
            <InlineAlert tone="info">
              <span className="text-xs leading-relaxed">
                No advisor is assigned to this cohort yet (or selected students belong to different cohorts). Assign an advisor to the cohort first.
              </span>
            </InlineAlert>
          ) : (
            <AdvisorPickerList advisors={advisors} selectedId={advisorId} onSelect={choose} />
          )}
        </UserFormField>

        {advisor && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-page px-3.5 py-2.5 ring-1 ring-inset ring-line-soft">
            <span className="text-xs text-ink-muted">
              After change · <strong className="font-semibold text-ink-primary">{advisor.fullName}</strong>
            </span>
            <LoadBadge count={loadAfter} limit={advisor.maxAdvisees} />
          </div>
        )}

        {overBy > 0 && (
          <InlineAlert tone="info">
            This is {overBy} over the advisory limit of {advisor?.maxAdvisees}. The limit is a warning, not a block.
          </InlineAlert>
        )}

        {previewMutation.isPending && (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <SpinnerGap className="size-3.5 animate-spin" aria-hidden />
            Checking upcoming appointments…
          </p>
        )}

        {cancelling > 0 && preview && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              {cancelling} future appointment{cancelling === 1 ? '' : 's'} will be cancelled
            </p>
            <ul className="mt-1.5 flex max-h-36 flex-col gap-1 overflow-y-auto">
              {preview.scheduledAppointments.map((a) => (
                <li key={a.appointmentId}>
                  {nameById.get(a.studentId) ?? 'Student'} · {new Date(a.scheduledAt).toLocaleString('en-US', {
                    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-red-700">The students are notified and need to book again with the new advisor.</p>
          </div>
        )}

        {error && (
          <InlineAlert tone="error" role="alert">
            {error}
          </InlineAlert>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={assignMutation.isPending} onClick={onClose} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!advisorId || !preview || assignMutation.isPending || students.length === 0}
          onClick={confirm}
          className={modalButtonClass('primary')}
        >
          {assignMutation.isPending && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
          {cancelling > 0 ? `Assign and cancel ${cancelling}` : 'Assign'}
        </button>
      </ModalFooter>
    </Modal>
  );
}
