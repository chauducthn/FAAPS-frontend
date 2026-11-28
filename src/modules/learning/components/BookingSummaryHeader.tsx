// Header of the booking form: the chosen advisor, date and time slot at a glance.

import type { ReactNode } from 'react';
import { CalendarBlank as CalendarDays, Clock, User as UserRound } from '@phosphor-icons/react';

interface BookingSummaryHeaderProps {
  advisorName: string | null;
  dateLabel: string;
  timeLabel: string;
}

function SummaryCell({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#f7f8fa] px-3 py-2.5">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">{label}</p>
        <p className="truncate text-[13px] font-semibold text-[#151c27]">{value}</p>
      </div>
    </div>
  );
}

export function BookingSummaryHeader({ advisorName, dateLabel, timeLabel }: BookingSummaryHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#151c27]">Booking details</h2>
        {advisorName && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C]">
            <UserRound className="size-3" aria-hidden /> {advisorName}
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCell icon={<CalendarDays className="size-4 shrink-0 text-[#555f6f]" />} label="Date" value={dateLabel} />
        <SummaryCell icon={<Clock className="size-4 shrink-0 text-[#555f6f]" />} label="Time" value={timeLabel} />
      </div>
    </>
  );
}
