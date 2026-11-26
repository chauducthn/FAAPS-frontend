// Cancel and reschedule modals for StudentAppointments.

import { useState } from 'react';
import { CalendarBlank as CalendarDays, Clock, User } from '@phosphor-icons/react';
import { Modal } from '@/shared/components/ui/Modal';
import { formatIsoDay, formatIsoTime, toDateKey } from '../../../shared/lib/appointmentDate';
import { DateSelector } from '../../appointment/components/DateSelector';
import { TimeSlotPicker } from '../../appointment/components/TimeSlotPicker';
import { useAvailableSlots } from '../../appointment/hooks/queries/useAppointmentQueries';
import {
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
} from '../../appointment/hooks/mutations/useAppointmentMutations';
import type { BookedAppointment } from '../../appointment/types/appointment';

const MAX_REASON = 500;

function AppointmentSummary({ item }: { item: BookedAppointment }) {
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

export function CancelAppointmentModal({
  item,
  onClose,
}: {
  item: BookedAppointment | null;
  onClose: () => void;
}) {
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
        {item && <AppointmentSummary item={item} />}
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
            <p className="text-[11px] text-[#98a2b3]">{reason.length}/{MAX_REASON}</p>
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

export function RescheduleAppointmentModal({
  item,
  onClose,
}: {
  item: BookedAppointment | null;
  onClose: () => void;
}) {
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
            <AppointmentSummary item={item} />
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
