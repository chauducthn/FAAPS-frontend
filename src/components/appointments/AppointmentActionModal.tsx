// src/components/appointments/AppointmentActionModal.tsx
import { useEffect, useState } from 'react';
import { CalendarDays, Clock, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { BookingStatusBadge } from './AppointmentBits';
import { formatIsoDay, formatIsoTime } from '../../lib/appointmentDate';
import { useUpdateAppointmentStatusMutation } from '../../hooks/mutations/useAppointmentMutations';
import type { AdvisorAppointment } from '../../types/appointment';
import { cn } from '@/lib/utils';

interface AppointmentActionModalProps {
  appointment: AdvisorAppointment | null;
  onClose: () => void;
}

/**
 * Advisor action modal for a pending appointment: show the details, then accept or reject it.
 * Rejecting requires a short reason for the student.
 */
export function AppointmentActionModal({ appointment, onClose }: AppointmentActionModalProps) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [touched, setTouched] = useState(false);
  const mutation = useUpdateAppointmentStatusMutation();

  useEffect(() => {
    if (!appointment) return;
    setRejecting(false);
    setRejectReason('');
    setTouched(false);
  }, [appointment]);

  if (!appointment) return null;

  const isPending = appointment.status === 'PENDING';
  const reasonMissing = rejecting && touched && rejectReason.trim().length === 0;

  const handleAccept = () => {
    mutation.mutate(
      { id: appointment.id, body: { status: 'ACCEPTED' } },
      { onSuccess: onClose },
    );
  };

  const handleReject = () => {
    setTouched(true);
    if (rejectReason.trim().length === 0) return;
    mutation.mutate(
      { id: appointment.id, body: { status: 'REJECTED', reason: rejectReason.trim() } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open={!!appointment} onClose={onClose} title="Appointment request" className="max-w-[560px]">
      <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] p-6">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-[#151c27]">Appointment request</h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">Review the request before responding.</p>
        </div>
        <BookingStatusBadge status={appointment.status} />
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3">
            <User className="size-4 shrink-0 text-[#555f6f]" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Student</p>
              <p className="truncate text-sm font-semibold text-[#151c27]">{appointment.studentName}</p>
              {appointment.studentCode && (
                <p className="truncate text-[11px] text-[#555f6f]">{appointment.studentCode}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3">
            <CalendarDays className="size-4 shrink-0 text-[#555f6f]" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Date</p>
              <p className="truncate text-sm font-semibold text-[#151c27]">{formatIsoDay(appointment.startTime)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3">
          <Clock className="size-4 shrink-0 text-[#555f6f]" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Time</p>
            <p className="text-sm font-semibold text-[#151c27]">
              {formatIsoTime(appointment.startTime)} – {formatIsoTime(appointment.endTime)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#151c27]">Reason</p>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm text-[#151c27]">
            {appointment.reason || 'No reason provided.'}
          </p>
        </div>

        {appointment.decisionNote && (
          <div>
            <p className="text-sm font-semibold text-[#151c27]">Your note</p>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm text-[#555f6f]">
              {appointment.decisionNote}
            </p>
          </div>
        )}

        {isPending && rejecting && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reject-reason" className="text-xs font-semibold text-[#555f6f]">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={300}
              placeholder="Tell the student why this request cannot be accepted..."
              className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
            <p className={cn('text-[11px]', reasonMissing ? 'font-semibold text-red-500' : 'text-[#98a2b3]')}>
              {reasonMissing ? 'A reason is required to reject.' : 'The student will see this note.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-[#e5e7eb] p-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50"
        >
          Close
        </button>

        {isPending &&
          (rejecting ? (
            <>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={mutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {mutation.isPending ? 'Rejecting...' : 'Confirm rejection'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={mutation.isPending}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={mutation.isPending}
                className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-50"
              >
                {mutation.isPending ? 'Updating...' : 'Accept'}
              </button>
            </>
          ))}
      </div>
    </Modal>
  );
}
