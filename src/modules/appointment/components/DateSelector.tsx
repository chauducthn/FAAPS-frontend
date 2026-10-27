// src/components/appointments/DateSelector.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { addDays, formatColumnDay, isToday, toDateKey } from '../../../shared/lib/appointmentDate';
import { APPOINTMENT_QUERY_KEYS } from '../hooks/queries/useAppointmentQueries';
import { appointmentService } from '../services/appointmentService';
import { cn } from '@/shared/lib/utils';

interface DateSelectorProps {
  /** "yyyy-MM-dd" */
  value: string;
  onChange: (value: string) => void;
  /** How many days ahead can be booked (total horizon). */
  days?: number;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function relativeLabel(selected: Date, today: Date): string {
  const diff = Math.round((startOfDay(selected).getTime() - startOfDay(today).getTime()) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1) return `${Math.abs(diff)} days ago`;
  return selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Week-paged date picker with live availability hints.
 * - Shows 7 days at a time with prev/next week navigation (instead of a static 14-day wall).
 * - Each day shows how many free slots it has (green = plenty, amber = few left, gray = full).
 * - Quick actions: Today / Tomorrow / Next available day, so users don't have to hunt manually.
 */
export function DateSelector({ value, onChange, days = 28 }: DateSelectorProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = toDateKey(today);
  const maxDate = useMemo(() => addDays(today, days - 1), [today, days]);
  const maxKey = toDateKey(maxDate);

  const [weekOffset, setWeekOffset] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const queryClient = useQueryClient();

  const selected = useMemo(() => new Date(`${value}T00:00:00`), [value]);
  const tomorrowKey = useMemo(() => toDateKey(addDays(today, 1)), [today]);

  const weekStart = useMemo(() => addDays(today, weekOffset * 7), [today, weekOffset]);
  const visibleDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visibleKeys = useMemo(() => visibleDays.map(toDateKey), [visibleDays]);

  // Keep the selected day visible when it changes from outside (e.g. prev/next day buttons).
  useEffect(() => {
    const diff = Math.round((startOfDay(selected).getTime() - today.getTime()) / DAY_MS);
    if (diff < 0) {
      setWeekOffset(0);
      return;
    }
    const needed = Math.floor(diff / 7);
    if (value < visibleKeys[0] || value > visibleKeys[visibleKeys.length - 1]) {
      setWeekOffset(needed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Live free-slot counts for the visible week (shared cache with the parent's useAvailableSlots).
  const slotQueries = useQueries({
    queries: visibleDays.map((day) => {
      const key = toDateKey(day);
      const outOfRange = key < todayKey || key > maxKey;
      return {
        queryKey: APPOINTMENT_QUERY_KEYS.availableSlots(key),
        queryFn: () => appointmentService.getAvailableSlots(key),
        enabled: !outOfRange,
        staleTime: 1000 * 30,
      };
    }),
  });

  const counts = useMemo(
    () =>
      Object.fromEntries(
        visibleKeys.map((key, i) => [key, slotQueries[i]?.data?.length ?? null]),
      ) as Record<string, number | null>,
    [visibleKeys, slotQueries],
  );

  const monthLabel = useMemo(() => {
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
    if (sameMonth) return first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fmt: Intl.DateTimeFormatOptions = { month: 'short' };
    return `${first.toLocaleDateString('en-US', fmt)} – ${last.toLocaleDateString('en-US', { ...fmt, year: 'numeric' })}`;
  }, [visibleDays]);

  const canPrevWeek = weekOffset > 0;
  const canNextWeek = toDateKey(weekStart) <= maxKey && toDateKey(addDays(weekStart, 7)) <= maxKey;
  const canPrevDay = value > todayKey;
  const canNextDay = value < maxKey;

  const jumpTo = (key: string) => {
    const target = new Date(`${key}T00:00:00`);
    const diff = Math.round((startOfDay(target).getTime() - today.getTime()) / DAY_MS);
    setWeekOffset(Math.max(0, Math.floor(diff / 7)));
    setSearchFailed(false);
    onChange(key);
  };

  const handleNextAvailable = async () => {
    setSearching(true);
    setSearchFailed(false);
    try {
      const startDiff = Math.max(0, Math.round((startOfDay(selected).getTime() - today.getTime()) / DAY_MS));
      for (let i = startDiff; i < days; i++) {
        const day = addDays(today, i);
        const key = toDateKey(day);
        const cached = queryClient.getQueryData<{ length: number } | unknown[]>(
          APPOINTMENT_QUERY_KEYS.availableSlots(key),
        );
        if (Array.isArray(cached)) {
          if (cached.length > 0) {
            jumpTo(key);
            return;
          }
          continue;
        }
        const idx = visibleKeys.indexOf(key);
        const visibleData = idx >= 0 ? slotQueries[idx]?.data : undefined;
        if (visibleData) {
          if (visibleData.length > 0) {
            jumpTo(key);
            return;
          }
          continue;
        }
        const slots = await appointmentService.getAvailableSlots(key);
        queryClient.setQueryData(APPOINTMENT_QUERY_KEYS.availableSlots(key), slots);
        if (slots.length > 0) {
          jumpTo(key);
          return;
        }
      }
      setSearchFailed(true);
    } catch {
      setSearchFailed(true);
    } finally {
      setSearching(false);
    }
  };

  const selectedCount = counts[value] ?? null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* Header: month + quick actions */}
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
          onClick={() => jumpTo(todayKey)}
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
          onClick={() => jumpTo(tomorrowKey)}
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
          onClick={handleNextAvailable}
          disabled={searching}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-orange-300 bg-orange-50/60 px-2.5 py-1 text-[12px] font-bold text-[#c2570b] transition-colors hover:bg-orange-100 disabled:cursor-wait disabled:opacity-60"
        >
          <Zap className="size-3.5" />
          {searching ? 'Finding...' : 'Next available'}
        </button>
        {searchFailed && <span className="text-[11px] font-medium text-[#98a2b3]">No free days in range</span>}
      </div>

      {/* Week strip with pager */}
      <div className="mt-3 flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
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
            const loading = slotQueries[i]?.isLoading;
            const weekend = day.getDay() === 0 || day.getDay() === 6;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onChange(key)}
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
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={!canNextWeek}
          aria-label="Next week"
          className="flex w-7 shrink-0 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Legend */}
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

      {/* Selected summary + day stepper */}
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
            onClick={() => jumpTo(toDateKey(addDays(selected, -1)))}
            disabled={!canPrevDay}
            aria-label="Previous day"
            className="flex size-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => jumpTo(toDateKey(addDays(selected, 1)))}
            disabled={!canNextDay}
            aria-label="Next day"
            className="flex size-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#555f6f] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
