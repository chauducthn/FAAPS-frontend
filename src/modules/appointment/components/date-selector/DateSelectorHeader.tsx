// Header and quick-jump buttons (Today, Tomorrow, Next available) for DateSelector.

import { CalendarDays, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface DateSelectorHeaderProps {
  monthLabel: string;
  value: string;
  todayKey: string;
  tomorrowKey: string;
  maxKey: string;
  searching: boolean;
  searchFailed: boolean;
  onJumpTo: (key: string) => void;
  onNextAvailable: () => void;
}

export function DateSelectorHeader({
  monthLabel,
  value,
  todayKey,
  tomorrowKey,
  maxKey,
  searching,
  searchFailed,
  onJumpTo,
  onNextAvailable,
}: DateSelectorHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
          <CalendarDays className="size-3.5" />
          Select a date
        </p>
        <p className="text-[12px] font-bold text-[#151c27]">{monthLabel}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onJumpTo(todayKey)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors',
            value === todayKey
              ? 'border-[#F26F21] bg-[#F26F21] text-white'
              : 'border-[#e5e7eb] bg-white text-[#555f6f] hover:border-orange-300 hover:bg-orange-50/50',
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onJumpTo(tomorrowKey)}
          disabled={tomorrowKey > maxKey}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
            value === tomorrowKey
              ? 'border-[#F26F21] bg-[#F26F21] text-white'
              : 'border-[#e5e7eb] bg-white text-[#555f6f] hover:border-orange-300 hover:bg-orange-50/50',
          )}
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={onNextAvailable}
          disabled={searching}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-dashed border-orange-300 bg-orange-50/60',
            'px-2.5 py-1 text-[12px] font-bold text-[#c2570b] transition-colors hover:bg-orange-100',
            'disabled:cursor-wait disabled:opacity-60',
          )}
        >
          <Zap className="size-3.5" />
          {searching ? 'Finding...' : 'Next available'}
        </button>
        {searchFailed && <span className="text-[11px] font-medium text-[#98a2b3]">No free days in range</span>}
      </div>
    </>
  );
}
