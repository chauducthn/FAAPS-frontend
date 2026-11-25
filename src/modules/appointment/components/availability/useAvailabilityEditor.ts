// State management and slot mutations for the weekly availability editor.

import { useEffect, useMemo, useState } from 'react';
import { useConfigureAvailabilityMutation } from '../../hooks/mutations/useAppointmentMutations';
import type { AvailabilitySlot, IsoWeekday } from '../../types/appointment';
import {
  WEEKDAYS,
  slotsKey,
  sortSlots,
  toHHMM,
  toMinutes,
  type DayDraft,
} from './availabilityUtils';

export function useAvailabilityEditor(initialSlots?: AvailabilitySlot[]) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(sortSlots(initialSlots ?? []));
  const [enabled, setEnabled] = useState<Set<IsoWeekday>>(
    new Set((initialSlots ?? []).map((s) => s.dayOfWeek)),
  );
  const [drafts, setDrafts] = useState<Record<number, DayDraft>>({});
  const [errorByDay, setErrorByDay] = useState<Record<number, string | null>>({});
  const mutation = useConfigureAvailabilityMutation();

  useEffect(() => {
    setSlots(sortSlots(initialSlots ?? []));
    setEnabled(new Set((initialSlots ?? []).map((s) => s.dayOfWeek)));
    setErrorByDay({});
  }, [initialSlots ? slotsKey(initialSlots) : 'empty']); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => slotsKey(slots) !== slotsKey(initialSlots ?? []), [slots, initialSlots]);

  const totalMinutes = useMemo(
    () => slots.reduce((sum, s) => sum + Math.max(0, toMinutes(s.endTime) - toMinutes(s.startTime)), 0),
    [slots],
  );

  const grouped = useMemo(() => {
    const map = new Map<IsoWeekday, AvailabilitySlot[]>();
    for (const d of WEEKDAYS) map.set(d.value, []);
    for (const s of slots) map.get(s.dayOfWeek)?.push(s);
    for (const list of map.values()) list.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    return map;
  }, [slots]);

  const draftOf = (day: IsoWeekday): DayDraft => drafts[day] ?? { start: '09:00', duration: 60 };

  const setDraft = (day: IsoWeekday, patch: Partial<DayDraft>) =>
    setDrafts((prev) => ({ ...prev, [day]: { ...draftOf(day), ...patch } }));

  const toggleDay = (day: IsoWeekday) => {
    setErrorByDay((p) => ({ ...p, [day]: null }));
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
        setSlots((s) => s.filter((x) => x.dayOfWeek !== day));
      } else {
        next.add(day);
        setSlots((s) =>
          s.some((x) => x.dayOfWeek === day)
            ? s
            : sortSlots([...s, { dayOfWeek: day, startTime: '09:00', endTime: '10:00' }]),
        );
      }
      return next;
    });
  };

  const addSlot = (day: IsoWeekday) => {
    const { start, duration } = draftOf(day);
    const end = toHHMM(toMinutes(start) + duration);
    const existing = grouped.get(day) ?? [];
    const ns = toMinutes(start);
    const ne = toMinutes(end);
    if (ne > 20 * 60) {
      setErrorByDay((p) => ({ ...p, [day]: 'Slot ends after 20:00 — pick an earlier start.' }));
      return;
    }
    const overlap = existing.some((s) => ns < toMinutes(s.endTime) && ne > toMinutes(s.startTime));
    if (overlap) {
      setErrorByDay((p) => ({ ...p, [day]: `${start}–${end} overlaps an existing slot.` }));
      return;
    }
    setErrorByDay((p) => ({ ...p, [day]: null }));
    setSlots((s) => sortSlots([...s, { dayOfWeek: day, startTime: start, endTime: end }]));
  };

  const removeSlot = (day: IsoWeekday, start: string) =>
    setSlots((s) => s.filter((x) => !(x.dayOfWeek === day && x.startTime === start)));

  const applyWeekdays = () => {
    const template: AvailabilitySlot[] = ([1, 2, 3, 4, 5] as IsoWeekday[]).map((d) => ({
      dayOfWeek: d,
      startTime: '09:00',
      endTime: '11:30',
    }));
    setSlots(sortSlots(template));
    setEnabled(new Set([1, 2, 3, 4, 5] as IsoWeekday[]));
    setErrorByDay({});
  };

  const copyDayToWeekdays = (day: IsoWeekday) => {
    const source = grouped.get(day) ?? [];
    if (source.length === 0) return;
    setSlots((prev) => {
      const rest = prev.filter((x) => x.dayOfWeek < 1 || x.dayOfWeek > 5 || x.dayOfWeek === day);
      const copies: AvailabilitySlot[] = [];
      for (let d = 1; d <= 5; d++) {
        if (d === day) continue;
        for (const s of source) {
          copies.push({ dayOfWeek: d as IsoWeekday, startTime: s.startTime, endTime: s.endTime });
        }
      }
      return sortSlots([...rest, ...source, ...copies]);
    });
    setEnabled(new Set([1, 2, 3, 4, 5] as IsoWeekday[]));
  };

  const clearAll = () => {
    setSlots([]);
    setEnabled(new Set());
    setErrorByDay({});
  };

  const handleReset = () => {
    setSlots(sortSlots(initialSlots ?? []));
    setEnabled(new Set((initialSlots ?? []).map((s) => s.dayOfWeek)));
    setErrorByDay({});
  };

  const handleSave = () => mutation.mutate({ slots: sortSlots(slots) });

  return {
    slots,
    enabled,
    errorByDay,
    dirty,
    totalMinutes,
    grouped,
    isSaving: mutation.isPending,
    draftOf,
    setDraft,
    toggleDay,
    addSlot,
    removeSlot,
    applyWeekdays,
    copyDayToWeekdays,
    clearAll,
    handleReset,
    handleSave,
  };
}
