// src/components/appointments/TimeSlotPicker.tsx
import { useMemo } from 'react';
import { Clock, Sunrise, Sun, MoonStar } from 'lucide-react';
import { formatIsoTime, formatSlotRange, slotDurationMinutes } from '../../lib/appointmentDate';
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

interface SlotGroup {
  id: string;
  label: string;
  icon: typeof Sunrise;
  slots: AvailableSlot[];
}

function periodOf(startIso: string): 'morning' | 'afternoon' | 'evening' {
  const h = new Date(startIso).getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/**
 * Free slots of one day, rendered as start–end range buttons grouped by period.
 * Duration is computed from startTime/endTime (backend source of truth),
 * not hardcoded — so a 30-min slot shows "09:00 – 09:30 · 30 min",
 * and an irregular slot (e.g. 39 min) still displays correctly.
 */
export function TimeSlotPicker({ slots, value, onChange, isLoading, isError, onRetry }: TimeSlotPickerProps) {
  const sorted = useMemo(
    () => [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots],
  );

  const durations = useMemo(
    () => sorted.map((s) => slotDurationMinutes(s.startTime, s.endTime)),
    [sorted],
  );

  // Most common duration, e.g. 30 — shown in the header when consistent.
  const commonDuration = useMemo(() => {
    const valid = durations.filter((d): d is number => d != null);
    if (valid.length === 0) return null;
    const freq = new Map<number, number>();
    for (const d of valid) freq.set(d, (freq.get(d) ?? 0) + 1);
    let best: number | null = null;
    let bestCount = 0;
    for (const [d, c] of freq) {
      if (c > bestCount) {
        best = d;
        bestCount = c;
      }
    }
    return bestCount === valid.length ? best : null;
  }, [durations]);

  const groups = useMemo<SlotGroup[]>(() => {
    const morning = sorted.filter((s) => periodOf(s.startTime) === 'morning');
    const afternoon = sorted.filter((s) => periodOf(s.startTime) === 'afternoon');
    const evening = sorted.filter((s) => periodOf(s.startTime) === 'evening');
    return [
      { id: 'morning', label: 'Morning', icon: Sunrise, slots: morning },
      { id: 'afternoon', label: 'Afternoon', icon: Sun, slots: afternoon },
      { id: 'evening', label: 'Evening', icon: MoonStar, slots: evening },
    ].filter((g) => g.slots.length > 0);
  }, [sorted]);

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
          <Clock className="size-3.5" />
          Available times
        </p>
        {!isLoading && sorted.length > 0 && (
          <p className="text-[11px] font-semibold text-[#98a2b3]">
            {sorted.length} free
            {commonDuration != null && <span> · {commonDuration} min each</span>}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[52px] animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="mt-3 rounded-lg bg-[#f7f8fa] px-4 py-6 text-center text-sm text-[#555f6f]">
          No free slots on this date. Please pick another day.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.id}>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
                  <Icon className="size-3.5" />
                  {group.label}
                  <span className="font-semibold normal-case">· {group.slots.length}</span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.slots.map((slot) => {
                    const active = value === slot.startTime;
                    const minutes = slotDurationMinutes(slot.startTime, slot.endTime);
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => onChange(slot.startTime)}
                        aria-pressed={active}
                        title={`${formatSlotRange(slot.startTime, slot.endTime)}${minutes != null ? ` (${minutes} minutes)` : ''}`}
                        className={cn(
                          'flex flex-col items-center rounded-lg border px-2 py-2 transition-colors',
                          active
                            ? 'border-[#F26F21] bg-[#F26F21] text-white shadow-md shadow-orange-200'
                            : 'border-[#e5e7eb] bg-white text-[#151c27] hover:border-orange-300 hover:bg-orange-50/40',
                        )}
                      >
                        <span className="text-[13px] font-bold leading-tight">
                          {formatIsoTime(slot.startTime)}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 text-[11px] font-medium leading-tight',
                            active ? 'text-white/85' : 'text-[#555f6f]',
                          )}
                        >
                          – {formatIsoTime(slot.endTime)}
                          {minutes != null && (
                            <span
                              className={cn(
                                'ml-1 rounded-full px-1.5 py-px text-[10px] font-bold',
                                active ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#98a2b3]',
                              )}
                            >
                              {minutes}m
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
