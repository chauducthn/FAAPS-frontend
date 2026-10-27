// src/pages/learning/BookAppointment.tsx
import { useState } from 'react';
import { CalendarClock, CalendarDays, Clock, Send } from 'lucide-react';
import { DateSelector } from '../../appointment/components/DateSelector';
import { TimeSlotPicker } from '../../appointment/components/TimeSlotPicker';
import { useAvailableSlots } from '../../appointment/hooks/queries/useAppointmentQueries';
import { useBookAppointmentMutation } from '../../appointment/hooks/mutations/useAppointmentMutations';
import { formatColumnDay, formatIsoTime, toDateKey } from '../../../shared/lib/appointmentDate';
import { useAuth } from '../../auth/stores/useAuth';
import { useQuery } from '@tanstack/react-query';
import { appointmentService } from '../../appointment/services/appointmentService';
import { toast } from 'sonner';
import { StudentAppointmentDetailModal } from '../../appointment/components/StudentAppointmentDetailModal';

const MAX_REASON = 500;

export default function BookAppointment() {
  const user = useAuth((s) => s.user);
  const today = new Date();
  const [date, setDate] = useState(toDateKey(today));
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const slotsQuery = useAvailableSlots(date);
  const bookMutation = useBookAppointmentMutation();
  const appointments = useQuery({ queryKey: ['appointments', 'student'], queryFn: appointmentService.getStudentAppointments });

  const reasonMissing = touched && reason.trim().length === 0;
  const canSubmit = !!slot && reason.trim().length > 0 && !bookMutation.isPending;

  const handleDateChange = (next: string) => {
    setDate(next);
    setSlot(null); // the chosen time belongs to the previous day
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!slot || reason.trim().length === 0) return;

    bookMutation.mutate(
      { startTime: slot, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          setSlot(null);
          setTouched(false);
        },
      },
    );
  };

  const selectedSlot = slotsQuery.data?.find((s) => s.startTime === slot);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Appointments / Book a session</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Book an Advisor Appointment</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Pick a date and a free slot, then tell your advisor what you would like to discuss.
        </p>
        {user?.fullName && (
          <p className="mt-1 text-[13px] font-medium text-[#98a2b3]">Booking as {user.fullName}</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <DateSelector value={date} onChange={handleDateChange} />
          <TimeSlotPicker
            slots={slotsQuery.data ?? []}
            value={slot}
            onChange={setSlot}
            isLoading={slotsQuery.isLoading}
            isError={slotsQuery.isError}
            onRetry={() => slotsQuery.refetch()}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#151c27]">Booking details</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
              <CalendarDays className="size-4 shrink-0 text-[#555f6f]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Date</p>
                <p className="truncate text-[13px] font-semibold text-[#151c27]">
                  {formatColumnDay(new Date(`${date}T00:00:00`))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
              <Clock className="size-4 shrink-0 text-[#555f6f]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Time</p>
                <p className="truncate text-[13px] font-semibold text-[#151c27]">
                  {slot ? `${formatIsoTime(slot)}${selectedSlot ? ` – ${formatIsoTime(selectedSlot.endTime)}` : ''}` : 'Not selected'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-reason" className="text-xs font-semibold text-[#555f6f]">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="appointment-reason"
              rows={6}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={MAX_REASON}
              required
              placeholder="Describe the topic you want to discuss with your advisor..."
              className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]"
            />
            <div className="flex items-center justify-between">
              <p className={`text-[11px] ${reasonMissing ? 'font-semibold text-red-500' : 'text-[#98a2b3]'}`}>
                {reasonMissing ? 'A reason is required.' : 'The advisor reads this before accepting.'}
              </p>
              <p className="text-[11px] text-[#98a2b3]">
                {reason.length}/{MAX_REASON}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookMutation.isPending ? (
              <>
                <CalendarClock className="size-4 animate-pulse" />
                Sending request...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Request appointment
              </>
            )}
          </button>
        </form>
      </div>
      <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">My appointments</h2>
        {appointments.data?.length ? <div className="mt-3 space-y-2">{appointments.data.map((item) =>
          <div key={item.id} className="rounded border p-3 text-sm"><strong>{item.advisorName}</strong> · {new Date(item.startTime).toLocaleString()} · {item.status}
            <div className="mt-2 flex gap-3"><button type="button" className="text-blue-700 underline" onClick={() => setDetailId(item.id)}>View details</button>
            {!['CANCELLED', 'COMPLETED'].includes(item.status) && <>
              <button type="button" className="text-red-600 underline" onClick={async () => { const reason = window.prompt('Cancellation reason', 'Cancelled by student'); if (!reason) return; await appointmentService.cancelAppointment(item.id, reason); toast.success('Appointment cancelled'); appointments.refetch(); }}>Cancel</button>
              <button type="button" className="text-orange-700 underline" onClick={async () => { const value = window.prompt('New start time (YYYY-MM-DDTHH:mm)', item.startTime.slice(0, 16)); if (!value) return; await appointmentService.rescheduleAppointment(item.id, value); toast.success('Appointment rescheduled'); appointments.refetch(); }}>Reschedule</button>
            </>}</div>
          </div>)}</div> : <p className="mt-2 text-sm text-gray-500">No appointments yet.</p>}
      </section>
      <StudentAppointmentDetailModal id={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
