// Seven-day week strip with live slot availability indicators and legend.

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatColumnDay, isToday, toDateKey } from '../../../../shared/lib/appointmentDate';
import { cn } from '@/shared/lib/utils';
import { WEEKDAY_SHORT } from './dateSelectorUtils';

interface DateSelectorWeekStripProps {
  visibleDays: Date[];
  value: string;
  todayKey: string;
  maxKey: string;
  counts: Record<string, number | null>;
  loadingFlags: boolean[];
  canPrevWeek: boolean;
  canNextWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelect: (key: string) => void;
}

export function DateSelectorWeekStrip({
  visibleDays,
  value,
  todayKey,
  maxKey,
  counts,
  loadingFlags,
  canPrevWeek,
  canNextWeek,
  onPrevWeek,
  onNextWeek,
  onSelect,
}: DateSelectorWeekStripProps) {
  return (
    <>
      <div className="mt-3 flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={onPrevWeek}
          disabled={!canPrevWeek}
          aria-label="Previous week"
          className="flex w-7 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="grid flex-1 grid-cols-7 gap-1.5">
          {visibleDays.map((day, i) => {
            const key = toDateKey(day);
            const active = key === value;
            const disabled = key < todayKey || key > maxKey;
            const count = counts[key];
            const loading = loadingFlags[i];
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(key)}
                aria-pressed={active}
                title={
                  count == null
                    ? formatColumnDay(day)
                    : `${formatColumnDay(day)} – ${count === 0 ? 'fully booked' : `${count} free slots`}`
                }
                className={cn(
                  'flex min-w-0 flex-col items-center rounded-xl border px-0.5 py-2 transition-all',
                  active
                    ? 'border-[#F26F21] bg-[#F26F21] text-white shadow-md shadow-orange-200'
                    : 'border-[#e5e7eb] bg-white text-[#555f6f] hover:border-orange-300 hover:bg-orange-50/40',
                  disabled && 'cursor-not-allowed opacity-35 hover:border-[#e5e7eb] hover:bg-white',
                  !active && isToday(day) && 'border-orange-400 ring-1 ring-orange-200',
                )}
              >
                <span
                  className={cn(
                    'text-[10px] font-semibold uppercase',
                    active ? 'text-white/85' : weekend ? 'text-[#c2570b]' : 'text-[#98a2b3]',
                  )}
                >
                  {WEEKDAY_SHORT[day.getDay()]}
                </span>
                <span className={cn('mt-0.5 text-base font-bold leading-none', active ? 'text-white' : 'text-[#151c27]')}>
                  {day.getDate()}
                </span>
                <span
                  className={cn(
                    'mt-1.5 flex h-3.5 items-center text-[9px] font-bold leading-none',
                    active ? 'text-white/90' : isToday(day) ? 'text-[#F26F21]' : 'text-[#98a2b3]',
                  )}
                >
                  {disabled ? (
                    '—'
                  ) : isToday(day) && (count == null || count === 0) && !active ? (
                    'Today'
                  ) : loading || count == null ? (
                    <span className="inline-block size-1 animate-pulse rounded-full bg-gray-300" />
                  ) : count === 0 ? (
                    <span className={cn(active ? 'text-white/70' : 'text-[#c4cad4]')}>Full</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={cn(
                          'inline-block size-1.5 rounded-full',
                          count <= 2 ? 'bg-amber-400' : 'bg-emerald-500',
                          active && 'bg-white',
                        )}
                      />
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNextWeek}
          disabled={!canNextWeek}
          aria-label="Next week"
          className="flex w-7 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-[#98a2b3]">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-1.5 rounded-full bg-emerald-500" /> Plenty
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-1.5 rounded-full bg-amber-400" /> Few left (≤ 2)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-1.5 rounded-full bg-gray-300" /> Full
        </span>
      </div>
    </>
  );
}
