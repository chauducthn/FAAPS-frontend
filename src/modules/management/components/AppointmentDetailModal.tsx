import { useState } from 'react';
import { Briefcase, CalendarBlank as CalendarDays, CheckCircle as CheckCircle2, FileText, SpinnerGap as Loader2, MapPin, User, UserMinus as UserX, XCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { AppointmentStatusBadge, durationMinutes, formatSlot } from './AppointmentBits';
import { useAppointment, useUpdateAppointmentStatus } from '../hooks/queries/useAdminAppointments';
import type { AppointmentStatus } from '../types/admin';

interface AppointmentDetailModalProps {
  appointmentId: string | null;
  onClose: () => void;
}

const ACTIONABLE_STATUSES: AppointmentStatus[] = ['SCHEDULED', 'IN_PROGRESS'];

export function AppointmentDetailModal({ appointmentId, onClose }: AppointmentDetailModalProps) {
  const { data: a, isLoading, isError, refetch } = useAppointment(appointmentId);
  const updateStatus = useUpdateAppointmentStatus();
  const [note, setNote] = useState('');
  const minutes = a ? durationMinutes(a) : null;
  const canAct = !!a && ACTIONABLE_STATUSES.includes(a.status);

  const changeStatus = async (status: AppointmentStatus, label: string) => {
    if (!a) return;
    try {
      await updateStatus.mutateAsync({ id: a.id, status, note });
      toast.success(`Appointment marked as ${label.toLowerCase()}.`);
      setNote('');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={!!appointmentId} onClose={onClose} title="Appointment Details" className="max-w-[620px]">
      {isLoading || !a ? (
        <div className="p-8 text-center text-sm text-ink-muted">
          {isError ? (
            <>
              Could not load this appointment.{' '}
              <button type="button" onClick={() => refetch()} className="font-semibold text-brand hover:underline">
                Retry
              </button>
            </>
          ) : (
            'Loading…'
          )}
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-line-soft p-6">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink-primary">Appointment Details</h2>
              <p className="mt-0.5 break-all font-mono text-xs text-ink-subtle">{a.id}</p>
            </div>
            <AppointmentStatusBadge status={a.status} />
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            <div className="flex items-center gap-2 rounded-lg bg-surface-page px-4 py-3 text-sm font-medium text-ink-primary">
              <CalendarDays className="size-4 shrink-0 text-brand" />
              {formatSlot(a)}
              {minutes !== null && <span className="text-ink-muted">({minutes} min)</span>}
            </div>

            <div className="grid gap-4 rounded-lg border border-line/80 p-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                  <User className="size-3.5" /> Student
                </p>
                <p className="mt-1.5 text-[15px] font-semibold text-ink-primary">{a.studentName ?? '—'}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                  <Briefcase className="size-3.5" /> Advisor
                </p>
                <p className="mt-1.5 text-[15px] font-semibold text-ink-primary">{a.advisorName ?? '—'}</p>
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <MapPin className="size-3.5" /> Location
              </p>
              <p className="mt-1.5 rounded-lg bg-surface-page px-4 py-2.5 text-sm text-ink-primary">{a.location || '—'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-ink-muted">Consultation topic / agenda</p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-surface-page px-4 py-2.5 text-sm text-ink-primary">
                {a.agenda || 'No agenda provided.'}
              </p>
            </div>

            {a.consultationSummary && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <FileText className="size-3.5" /> Consultation summary
                </p>
                <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-2.5 text-sm text-ink-primary">
                  {a.consultationSummary}
                </p>
              </div>
            )}

            {a.decisionNote && (
              <div>
                <p className="text-xs font-semibold text-ink-muted">Decision / status note</p>
                <p
                  className={
                    'mt-1.5 whitespace-pre-wrap rounded-lg border border-line/80 ' +
                    'bg-surface-page px-4 py-2.5 text-sm text-ink-secondary'
                  }>
                  {a.decisionNote}
                </p>
              </div>
            )}

            {canAct && (
              <div className="rounded-lg border border-line/80 bg-surface-page/60 p-4">
                <p className="text-xs font-bold text-ink-secondary">Admin status override</p>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note (reason or outcome)…"
                  className="mt-2 h-9 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updateStatus.isPending}
                    onClick={() => void changeStatus('COMPLETED', 'Completed')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {updateStatus.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                    Mark completed
                  </button>
                  <button
                    type="button"
                    disabled={updateStatus.isPending}
                    onClick={() => void changeStatus('NO_SHOW', 'No-show')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-50 px-3 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                  >
                    <UserX className="size-3.5" /> Mark no-show
                  </button>
                  <button
                    type="button"
                    disabled={updateStatus.isPending}
                    onClick={() => void changeStatus('CANCELLED', 'Cancelled')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="size-3.5" /> Cancel session
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end border-t border-line-soft px-6 py-4">
            <button type="button" onClick={onClose} className="h-9 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-ink-secondary hover:bg-surface-hover">
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
