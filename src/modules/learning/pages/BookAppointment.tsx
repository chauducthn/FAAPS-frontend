// Student booking page. Advisors in the student's major group come first; opened from a ticket
// (?advisingRequestId=<id>) the new appointment is linked to that ticket.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Robot as BotMessageSquare,
  CalendarDot as CalendarClock,
  LinkSimple,
  PaperPlaneTilt as Send,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { AdvisorPicker } from '../../appointment/components/AdvisorPicker';
import { DateSelector } from '../../appointment/components/DateSelector';
import { TimeSlotPicker } from '../../appointment/components/TimeSlotPicker';
import { useAvailableSlots } from '../../appointment/hooks/queries/useAppointmentQueries';
import { useBookAppointmentMutation } from '../../appointment/hooks/mutations/useAppointmentMutations';
import { formatColumnDay, formatIsoTime, toDateKey } from '../../../shared/lib/appointmentDate';
import { useAuth } from '../../auth/stores/useAuth';
import { appointmentService } from '../../appointment/services/appointmentService';
import { StudentAppointments } from '../components/StudentAppointments';
import { BookingAgendaField, draftAgenda } from '../components/BookingAgendaField';
import { BookingSummaryHeader } from '../components/BookingSummaryHeader';
import { useMyProgress } from '../hooks/queries/useStudentQueries';
import { useBookingAdvisor } from '../hooks/useBookingAdvisor';
import { advisingRequestIdFromParams } from '../../advising/utils/appointmentLink';
import { cn } from '@/shared/lib/utils';

const MAX_REASON = 500;

export default function BookAppointment() {
  const user = useAuth((s) => s.user);
  const [searchParams] = useSearchParams();
  const advisingRequestId = advisingRequestIdFromParams(searchParams);
  const [date, setDate] = useState(toDateKey(new Date()));
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const booking = useBookingAdvisor(date);
  const { advisorId } = booking;
  const progressQuery = useMyProgress();

  const slotsQuery = useAvailableSlots(date, advisorId ?? undefined);
  const bookMutation = useBookAppointmentMutation();
  const appointments = useQuery({
    queryKey: ['appointments', 'student'],
    queryFn: appointmentService.getStudentAppointments,
  });

  const reasonMissing = touched && reason.trim().length === 0;
  const canSubmit =
    !!slot && reason.trim().length > 0 && !bookMutation.isPending && (!!advisorId || booking.listUnavailable);

  const suggestAgendaWithAi = () => {
    setReason(draftAgenda(progressQuery.data).slice(0, MAX_REASON));
    setTouched(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!slot || reason.trim().length === 0) return;
    bookMutation.mutate(
      {
        ...(advisorId ? { advisorId } : {}),
        startTime: slot,
        reason: reason.trim(),
        ...(advisingRequestId ? { advisingRequestId } : {}),
      },
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
  const slotEnd = selectedSlot ? formatIsoTime(selectedSlot.endTime) : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#555f6f]">AI &amp; Advising / Book Appointment</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Book an Advisor Appointment</h1>
          <p className="mt-1 text-sm text-[#555f6f]">
            Choose your preferred advisor and an available slot, or consult AI first to prepare your questions.
          </p>
          {user?.fullName && <p className="mt-1 text-[13px] font-medium text-[#98a2b3]">Booking as {user.fullName}</p>}
        </div>
        <Link
          to="/student/ai-chat"
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/70 px-3.5',
            'text-xs font-semibold text-[#C2410C] hover:bg-orange-100/70',
          )}
        >
          <BotMessageSquare className="size-4" /> Ask AI Advisor first
        </Link>
      </div>

      {advisingRequestId && (
        <div
          role="status"
          className={cn(
            'flex items-start gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5',
            'text-[13px] font-medium text-[#9a4a12]',
          )}
        >
          <LinkSimple className="mt-0.5 size-4 shrink-0" aria-hidden />
          This appointment will be linked to your advising request, so your advisor sees the same context.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          {booking.listUnavailable ? (
            <div className="rounded-xl bg-white px-4 py-3.5 text-[13px] font-medium text-[#555f6f] shadow-sm">
              Choosing a specific advisor is unavailable right now — your request goes to your assigned advisor.
            </div>
          ) : (
            <AdvisorPicker
              advisors={booking.advisors}
              value={advisorId}
              onChange={(next) => { booking.pick(next); setSlot(null); }}
              slotCounts={booking.slotCounts}
              isLoading={booking.advisorsQuery.isLoading}
              isError={booking.advisorsQuery.isError}
              onRetry={() => void booking.advisorsQuery.refetch()}
            />
          )}

          <DateSelector
            value={date}
            onChange={(next) => {
              setDate(next);
              setSlot(null);
            }}
            advisorId={advisorId}
          />
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
          <BookingSummaryHeader
            advisorName={booking.advisorName}
            dateLabel={formatColumnDay(new Date(`${date}T00:00:00`))}
            timeLabel={slot ? `${formatIsoTime(slot)}${slotEnd ? ` – ${slotEnd}` : ''}` : 'Not selected'}
          />

          <BookingAgendaField
            value={reason}
            maxLength={MAX_REASON}
            missing={reasonMissing}
            onChange={setReason}
            onBlur={() => setTouched(true)}
            onSuggest={suggestAgendaWithAi}
          />

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white',
              'transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {bookMutation.isPending ? <CalendarClock className="size-4 animate-pulse" /> : <Send className="size-4" />}
            {bookMutation.isPending ? 'Sending request...' : 'Request appointment'}
          </button>
        </form>
      </div>

      <StudentAppointments
        appointments={appointments.data}
        isLoading={appointments.isLoading}
        isError={appointments.isError}
        onRetry={() => appointments.refetch()}
      />
    </div>
  );
}
