// src/pages/learning/BookAppointment.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Robot as BotMessageSquare, CalendarDot as CalendarClock, CalendarBlank as CalendarDays, Clock, PaperPlaneTilt as Send, Sparkle as Sparkles, User as UserRound } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { DateSelector } from '../../appointment/components/DateSelector';
import { TimeSlotPicker } from '../../appointment/components/TimeSlotPicker';
import { useAvailableSlots, useStudentAdvisors } from '../../appointment/hooks/queries/useAppointmentQueries';
import { useBookAppointmentMutation } from '../../appointment/hooks/mutations/useAppointmentMutations';
import { formatColumnDay, formatIsoTime, toDateKey } from '../../../shared/lib/appointmentDate';
import { useAuth } from '../../auth/stores/useAuth';
import { appointmentService } from '../../appointment/services/appointmentService';
import { StudentAppointments } from '../components/StudentAppointments';
import { useMyProgress } from '../hooks/queries/useStudentQueries';

const MAX_REASON = 500;

export default function BookAppointment() {
  const user = useAuth((s) => s.user);
  const [date, setDate] = useState(toDateKey(new Date()));
  const [advisorId, setAdvisorId] = useState('');
  const [slot, setSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const advisorsQuery = useStudentAdvisors();
  const progressQuery = useMyProgress();
  const advisors = advisorsQuery.data ?? [];

  useEffect(() => {
    if (!advisorId && advisors.length > 0) {
      const preferred = advisors.find((a) => a.assigned) ?? advisors[0];
      setAdvisorId(preferred.id);
    }
  }, [advisorId, advisors]);

  const slotsQuery = useAvailableSlots(date, advisorId || undefined);
  const bookMutation = useBookAppointmentMutation();
  const appointments = useQuery({
    queryKey: ['appointments', 'student'],
    queryFn: appointmentService.getStudentAppointments,
  });

  const reasonMissing = touched && reason.trim().length === 0;
  const canSubmit = !!slot && reason.trim().length > 0 && !bookMutation.isPending;

  const suggestAgendaWithAi = () => {
    const p = progressQuery.data;
    const gpaStr = p?.currentGpa != null ? p.currentGpa.toFixed(2) : 'N/A';
    const summary = p ? `Current GPA: ${gpaStr}, Credits earned: ${p.earnedCredits}` : 'Reviewing current academic progress';
    const draft = [
      `Academic consultation request (${summary}).`,
      '1. Review upcoming semester course selection & prerequisite sequence.',
      '2. Discuss strategies to stay on track for target GPA and graduation timeline.',
      '3. Clarify elective / OJT / Capstone milestones.',
    ].join('\n');
    setReason(draft.slice(0, MAX_REASON));
    setTouched(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!slot || reason.trim().length === 0) return;
    bookMutation.mutate(
      { advisorId: advisorId || undefined, startTime: slot, reason: reason.trim() },
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
  const selectedAdvisor = advisors.find((a) => a.id === advisorId);

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
        <Link to="/student/ai-chat" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/70 px-3.5 text-xs font-semibold text-[#C2410C] hover:bg-orange-100/70">
          <BotMessageSquare className="size-4" /> Ask AI Advisor first
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <label htmlFor="advisor-select" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#555f6f]">
              <UserRound className="size-3.5 text-[#F26F21]" /> Choose Advisor
            </label>
            <select
              id="advisor-select"
              value={advisorId}
              onChange={(e) => { setAdvisorId(e.target.value); setSlot(null); }}
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-[#F26F21] focus:outline-none"
            >
              {advisors.length === 0 ? (
                <option value="">Assigned advisor (default)</option>
              ) : (
                advisors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}{a.assigned ? ' (Assigned Advisor)' : ''} — {a.email}
                  </option>
                ))
              )}
            </select>
          </div>

          <DateSelector value={date} onChange={(next) => { setDate(next); setSlot(null); }} />
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
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#151c27]">Booking details</h2>
            {selectedAdvisor && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C]">
                {selectedAdvisor.fullName}
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
              <CalendarDays className="size-4 shrink-0 text-[#555f6f]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">Date</p>
                <p className="truncate text-[13px] font-semibold text-[#151c27]">{formatColumnDay(new Date(`${date}T00:00:00`))}</p>
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
            <div className="flex items-center justify-between">
              <label htmlFor="appointment-reason" className="text-xs font-semibold text-[#555f6f]">
                Consultation agenda <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={suggestAgendaWithAi} className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-[#C2410C] hover:bg-orange-100">
                <Sparkles className="size-3" /> Suggest agenda
              </button>
            </div>
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
              <p className="text-[11px] text-[#98a2b3]">{reason.length}/{MAX_REASON}</p>
            </div>
          </div>

          <button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50">
            {bookMutation.isPending ? <><CalendarClock className="size-4 animate-pulse" /> Sending request...</> : <><Send className="size-4" /> Request appointment</>}
          </button>
        </form>
      </div>

      <StudentAppointments appointments={appointments.data} isLoading={appointments.isLoading} isError={appointments.isError} onRetry={() => appointments.refetch()} />
    </div>
  );
}
