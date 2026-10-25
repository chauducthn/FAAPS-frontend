// src/components/appointments/DateSelector.tsx
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, formatColumnDay, isToday, toDateKey } from '../../lib/appointmentDate';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  /** "yyyy-MM-dd" */
  value: string;
  onChange: (value: string) => void;
  /** How many days are offered from the first one. */
  days?: number;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * A lightweight horizontal date strip: the next N days starting today, paged week by week.
 * Built with plain flexbox so no calendar library is needed.
 */
export function DateSelector({ value, onChange, days = 14 }: DateSelectorProps) {
  const today = useMemo(() => new Date(), []);

  // The window always starts today, so the selected date is always reachable.
  const windowStart = useMemo(() => {
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return base;
  }, [today]);

  const windowEnd = useMemo(() => addDays(windowStart, days - 1), [windowStart, days]);

  const selected = new Date(`${value}T00:00:00`);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Select a date</p>
        <p className="text-[11px] font-medium text-[#98a2b3]">
          {windowStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {windowEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: days }, (_, i) => {
          const day = addDays(windowStart, i);
          const key = toDateKey(day);
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={cn(
                'flex flex-col items-center rounded-lg border px-1 py-2 transition-colors',
                active
                  ? 'border-[#F26F21] bg-[#F26F21] text-white'
                  : 'border-[#e5e7eb] bg-white text-[#555f6f] hover:border-orange-300 hover:bg-orange-50/40',
              )}
            >
              <span className="text-[10px] font-semibold uppercase">{WEEKDAY_SHORT[day.getDay()]}</span>
              <span className={cn('mt-0.5 text-sm font-bold', active ? 'text-white' : 'text-[#151c27]')}>
                {day.getDate()}
              </span>
              {isToday(day) && (
                <span className={cn('mt-0.5 text-[9px] font-semibold', active ? 'text-white/80' : 'text-[#F26F21]')}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#e5e7eb] pt-3">
        <button
          type="button"
          onClick={() => onChange(toDateKey(selected))}
          className="text-[13px] font-semibold text-[#555f6f] hover:text-[#151c27]"
        >
          {formatColumnDay(selected)}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(toDateKey(addDays(selected, -1)))}
            aria-label="Previous day"
            className="flex size-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] hover:bg-gray-50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(toDateKey(addDays(selected, 1)))}
            aria-label="Next day"
            className="flex size-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] hover:bg-gray-50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
