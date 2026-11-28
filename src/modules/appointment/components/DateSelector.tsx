// Week-paged date picker with live availability hints and quick actions.

import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { addDays, toDateKey } from '../../../shared/lib/appointmentDate';
import { APPOINTMENT_QUERY_KEYS } from '../hooks/queries/useAppointmentQueries';
import { appointmentService } from '../services/appointmentService';
import { DateSelectorHeader } from './date-selector/DateSelectorHeader';
import { DateSelectorSummary } from './date-selector/DateSelectorSummary';
import { DateSelectorWeekStrip } from './date-selector/DateSelectorWeekStrip';
import { DAY_MS, formatMonthLabel, startOfDay } from './date-selector/dateSelectorUtils';

interface DateSelectorProps {
  /** "yyyy-MM-dd" */
  value: string;
  onChange: (value: string) => void;
  /** How many days ahead can be booked (total horizon). */
  days?: number;
  /** The chosen advisor, so free-slot counts match them. Empty falls back to the student's assigned advisor. */
  advisorId?: string | null;
}

export function DateSelector({ value, onChange, days = 28, advisorId }: DateSelectorProps) {
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

  const slotQueries = useQueries({
    queries: visibleDays.map((day) => {
      const key = toDateKey(day);
      const outOfRange = key < todayKey || key > maxKey;
      return {
        queryKey: APPOINTMENT_QUERY_KEYS.availableSlots(key, advisorId ?? undefined),
        queryFn: () => appointmentService.getAvailableSlots(key, advisorId ?? undefined),
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

  const monthLabel = useMemo(() => formatMonthLabel(visibleDays), [visibleDays]);
  const canPrevWeek = weekOffset > 0;
  const canNextWeek = toDateKey(weekStart) <= maxKey && toDateKey(addDays(weekStart, 7)) <= maxKey;

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
        const key = toDateKey(addDays(today, i));
        const cached = queryClient.getQueryData<unknown[]>(APPOINTMENT_QUERY_KEYS.availableSlots(key, advisorId ?? undefined));
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
        const slots = await appointmentService.getAvailableSlots(key, advisorId ?? undefined);
        queryClient.setQueryData(APPOINTMENT_QUERY_KEYS.availableSlots(key, advisorId ?? undefined), slots);
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

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <DateSelectorHeader
        monthLabel={monthLabel}
        value={value}
        todayKey={todayKey}
        tomorrowKey={tomorrowKey}
        maxKey={maxKey}
        searching={searching}
        searchFailed={searchFailed}
        onJumpTo={jumpTo}
        onNextAvailable={handleNextAvailable}
      />

      <DateSelectorWeekStrip
        visibleDays={visibleDays}
        value={value}
        todayKey={todayKey}
        maxKey={maxKey}
        counts={counts}
        loadingFlags={slotQueries.map((q) => q.isLoading)}
        canPrevWeek={canPrevWeek}
        canNextWeek={canNextWeek}
        onPrevWeek={() => setWeekOffset((w) => Math.max(0, w - 1))}
        onNextWeek={() => setWeekOffset((w) => w + 1)}
        onSelect={onChange}
      />

      <DateSelectorSummary
        selected={selected}
        today={today}
        selectedCount={counts[value] ?? null}
        canPrevDay={value > todayKey}
        canNextDay={value < maxKey}
        onPrevDay={() => jumpTo(toDateKey(addDays(selected, -1)))}
        onNextDay={() => jumpTo(toDateKey(addDays(selected, 1)))}
      />
    </div>
  );
}
