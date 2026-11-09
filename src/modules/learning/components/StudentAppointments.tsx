// Student / Appointments: my appointments (upcoming and history) with cancel and reschedule dialogs.

import { useState } from 'react';
import { CalendarDays, Clock, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '@/shared/components/ui/Modal';
import { formatIsoDay, formatIsoTime, toDateKey } from '../../../shared/lib/appointmentDate';
import { BookingStatusBadge } from '../../appointment/components/AppointmentBits';
import { DateSelector } from '../../appointment/components/DateSelector';
import { StudentAppointmentDetailModal } from '../../appointment/components/StudentAppointmentDetailModal';
import { TimeSlotPicker } from '../../appointment/components/TimeSlotPicker';
import { useAvailableSlots } from '../../appointment/hooks/queries/useAppointmentQueries';
import {
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
} from '../../appointment/hooks/mutations/useAppointmentMutations';
import type { BookedAppointment } from '../../appointment/types/appointment';

const MAX_REASON = 500;
const isOpen = (item: BookedAppointment) => item.status === 'PENDING' || item.status === 'ACCEPTED';
const isUpcoming = (item: BookedAppointment, now: number) => isOpen(item) && new Date(item.endTime).getTime() >= now;

function Summary({ item }: { item: BookedAppointment }) {
  return (
    <div className="grid gap-2 rounded-lg bg-[#f7f8fa] p-3 text-[13px] text-[#151c27] sm:grid-cols-3">
      <span className="inline-flex items-center gap-1.5">
        <User className="size-4 text-[#98a2b3]" />
        {item.advisorName}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-4 text-[#98a2b3]" />
        {formatIsoDay(item.startTime)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-4 text-[#98a2b3]" />
        {formatIsoTime(item.startTime)} – {formatIsoTime(item.endTime)}
      </span>
    </div>
  );
}

function CancelModal({ item, onClose }: { item: BookedAppointment | null; onClose: () => void }) {
  const cancel = useCancelAppointmentMutation();
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const missing = touched && reason.trim().length === 0;

  const close = () => {
    setReason('');
    setTouched(false);
    onClose();
  };

  const submit = () => {
    setTouched(true);
    if (!item || reason.trim().length === 0) return;
    cancel.mutate({ id: item.id, reason: reason.trim() }, { onSuccess: close });
  };

  return (
    <Modal open={!!item} onClose={close} title="Cancel appointment" className="max-w-[520px]">
      <div className="border-b border-[#f1f5f9] p-5">
        <h2 className="text-lg font-semibold text-[#151c27]">Cancel appointment</h2>
        <p className="mt-1 text-[13px] text-[#555f6f]">Your advisor will be notified. Tell them why you cannot attend.</p>
      </div>
      <div className="space-y-3 p-5">
        {item && <Summary item={item} />}
        <div>
          <label htmlFor="cancel-reason" className="text-xs font-semibold text-[#555f6f]">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            rows={4}
            maxLength={MAX_REASON}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={missing}
            placeholder="I have a clash with an exam..."
            className="mt-1 w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#F26F21] aria-[invalid=true]:border-red-400"
          />
          <div className="mt-1 flex justify-between">
            <p className="text-[12px] text-red-600">{missing ? 'A reason is required.' : ''}</p>
            <p className="text-[11px] text-[#98a2b3]">
              {reason.length}/{MAX_REASON}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-[#f1f5f9] p-4">
        <button type="button" onClick={close} className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50">
          Keep appointment
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={cancel.isPending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {cancel.isPending ? 'Cancelling...' : 'Cancel appointment'}
        </button>
      </div>
    </Modal>
  );
}

function RescheduleModal({ item, onClose }: { item: BookedAppointment | null; onClose: () => void }) {
  const reschedule = useRescheduleAppointmentMutation();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [slot, setSlot] = useState<string | null>(null);
  const slots = useAvailableSlots(item ? date : null);

  const close = () => {
    setSlot(null);
    onClose();
  };

  const submit = () => {
    if (!item || !slot) return;
    reschedule.mutate({ id: item.id, startTime: slot }, { onSuccess: close });
  };

  return (
    <Modal open={!!item} onClose={close} title="Reschedule appointment" className="max-w-[640px]">
      <div className="border-b border-[#f1f5f9] p-5">
        <h2 className="text-lg font-semibold text-[#151c27]">Reschedule appointment</h2>
        <p className="mt-1 text-[13px] text-[#555f6f]">Pick a new free slot. Your advisor will be notified of the change.</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {item && (
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">Current time</p>
            <Summary item={item} />
          </div>
        )}
        <DateSelector
          value={date}
          onChange={(next) => {
            setDate(next);
            setSlot(null);
          }}
        />
        <TimeSlotPicker
          slots={slots.data ?? []}
          value={slot}
          onChange={setSlot}
          isLoading={slots.isLoading}
          isError={slots.isError}
          onRetry={() => slots.refetch()}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-[#f1f5f9] p-4">
        <button type="button" onClick={close} className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50">
          Close
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!slot || reschedule.isPending}
          className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {reschedule.isPending ? 'Saving...' : slot ? `Move to ${formatIsoTime(slot)}` : 'Choose a slot'}
        </button>
      </div>
    </Modal>
  );
}

export function StudentAppointments({
  appointments,
  isLoading,
  isError,
  onRetry,
}: {
  appointments: BookedAppointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<BookedAppointment | null>(null);
  const [rescheduling, setRescheduling] = useState<BookedAppointment | null>(null);

  const now = Date.now();
  const all = [...(appointments ?? [])];
  const upcoming = all.filter((item) => isUpcoming(item, now)).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const history = all.filter((item) => !isUpcoming(item, now)).sort((a, b) => b.startTime.localeCompare(a.startTime));
  const visible = tab === 'upcoming' ? upcoming : history;

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#151c27]">My Appointments</h2>
          <p className="mt-0.5 text-[13px] text-[#555f6f]">Track, reschedule or cancel your sessions with your advisor.</p>
        </div>
        <div className="inline-flex rounded-lg bg-[#f1f5f9] p-0.5" role="tablist" aria-label="Appointment list">
          {(
            [
              ['upcoming', `Upcoming (${upcoming.length})`],
              ['history', `History (${history.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors',
                tab === key ? 'bg-white text-[#F26F21] shadow-sm' : 'text-[#555f6f] hover:text-[#151c27]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[#151c27]">Unable to load your appointments</p>
          <button type="button" onClick={onRetry} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50">
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#555f6f]">
          {tab === 'upcoming' ? 'No upcoming appointments. Book one above.' : 'No past appointments yet.'}
        </p>
      ) : (
        <ul className="divide-y divide-[#f1f5f9]">
          {visible.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#151c27]">
                    {formatIsoDay(item.startTime)} · {formatIsoTime(item.startTime)} – {formatIsoTime(item.endTime)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#555f6f]">{item.advisorName}</p>
                  {item.reason && <p className="mt-1 line-clamp-2 text-[13px] text-[#555f6f]">{item.reason}</p>}
                </div>
                <BookingStatusBadge status={item.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] font-semibold">
                <button type="button" className="text-[#F26F21] hover:underline" onClick={() => setDetailId(item.id)}>
                  View details
                </button>
                {isOpen(item) && (
                  <>
                    <button type="button" className="text-[#555f6f] hover:underline" onClick={() => setRescheduling(item)}>
                      Reschedule
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => setCancelling(item)}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <StudentAppointmentDetailModal id={detailId} onClose={() => setDetailId(null)} />
      <CancelModal item={cancelling} onClose={() => setCancelling(null)} />
      <RescheduleModal item={rescheduling} onClose={() => setRescheduling(null)} />
    </section>
  );
}
