// src/components/appointments/TimeSlotPicker.tsx
import { Clock } from 'lucide-react';
import { formatIsoTime } from '../../lib/appointmentDate';
import type { AvailableSlot } from '../../types/appointment';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  /** ISO start time of the chosen slot. */
  value: string | null;
  onChange: (startTime: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/** The free 30-minute slots of one day, rendered as a grid of buttons. */
export function TimeSlotPicker({ slots, value, onChange, isLoading, isError, onRetry }: TimeSlotPickerProps) {
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#555f6f]">Could not load the available slots.</p>
        <button type="button" onClick={onRetry} className="text-[13px] font-semibold text-orange-600 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
        <Clock className="size-3.5" />
        Available times
      </p>

      {isLoading ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="mt-3 rounded-lg bg-[#f7f8fa] px-4 py-6 text-center text-sm text-[#555f6f]">
          No free slots on this date. Please pick another day.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((slot) => {
            const active = value === slot.startTime;
            return (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => onChange(slot.startTime)}
                aria-pressed={active}
                className={cn(
                  'rounded-lg border px-2 py-2 text-[13px] font-semibold transition-colors',
                  active
                    ? 'border-[#F26F21] bg-[#F26F21] text-white'
                    : 'border-[#e5e7eb] bg-white text-[#151c27] hover:border-orange-300 hover:bg-orange-50/40',
                )}
              >
                {formatIsoTime(slot.startTime)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
