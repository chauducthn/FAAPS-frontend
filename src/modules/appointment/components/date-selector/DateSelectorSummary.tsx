// Selected date summary bar and previous/next day stepper buttons.

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatColumnDay } from '../../../../shared/lib/appointmentDate';
import { relativeLabel } from './dateSelectorUtils';

interface DateSelectorSummaryProps {
  selected: Date;
  today: Date;
  selectedCount: number | null;
  canPrevDay: boolean;
  canNextDay: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export function DateSelectorSummary({
  selected,
  today,
  selectedCount,
  canPrevDay,
  canNextDay,
  onPrevDay,
  onNextDay,
}: DateSelectorSummaryProps) {
  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#e5e7eb] pt-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">
          {relativeLabel(selected, today)}
          {selectedCount != null && selectedCount > 0 && (
            <span className="ml-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
              {selectedCount} free
            </span>
          )}
          {selectedCount === 0 && (
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-[#98a2b3]">
              Fully booked
            </span>
          )}
        </p>
        <p className="truncate text-[13px] font-bold text-[#151c27]">{formatColumnDay(selected)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onPrevDay}
          disabled={!canPrevDay}
          aria-label="Previous day"
          className="flex size-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={onNextDay}
          disabled={!canNextDay}
          aria-label="Next day"
          className="flex size-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
