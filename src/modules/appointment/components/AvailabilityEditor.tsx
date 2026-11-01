// src/components/appointments/AvailabilityEditor.tsx
// Weekly availability — redesigned for usability:
// Day-by-day cards with on/off toggle, preset start + duration picks,
// overlap validation, quick templates (Mon-Fri), copy day, dirty tracking.

import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, Copy, Eraser, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useConfigureAvailabilityMutation } from '../hooks/mutations/useAppointmentMutations';
import type { AvailabilitySlot, IsoWeekday } from '../types/appointment';
import { cn } from '@/shared/lib/utils';

interface AvailabilityEditorProps {
  /** The advisor's current weekly template, when it is already loaded. */
  initialSlots?: AvailabilitySlot[];
}

const WEEKDAYS: { value: IsoWeekday; short: string; full: string }[] = [
  { value: 1, short: 'Mon', full: 'Monday' },
  { value: 2, short: 'Tue', full: 'Tuesday' },
  { value: 3, short: 'Wed', full: 'Wednesday' },
  { value: 4, short: 'Thu', full: 'Thursday' },
  { value: 5, short: 'Fri', full: 'Friday' },
  { value: 6, short: 'Sat', full: 'Saturday' },
  { value: 7, short: 'Sun', full: 'Sunday' },
];

const START_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 7; h <= 19; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 19) out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
})();

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1h 30m' },
  { value: 120, label: '2 hours' },
];

const inputClass =
  'h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/30';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function sortSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return [...slots].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || toMinutes(a.startTime) - toMinutes(b.startTime),
  );
}

function slotsKey(slots: AvailabilitySlot[]): string {
  return JSON.stringify(sortSlots(slots));
}

/** Configure the weekly availability published to students. */
export function AvailabilityEditor({ initialSlots }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(sortSlots(initialSlots ?? []));
  const [enabled, setEnabled] = useState<Set<IsoWeekday>>(
    new Set((initialSlots ?? []).map((s) => s.dayOfWeek)),
  );
  const [drafts, setDrafts] = useState<Record<number, { start: string; duration: number }>>({});
  const [errorByDay, setErrorByDay] = useState<Record<number, string | null>>({});
  const mutation = useConfigureAvailabilityMutation();

  useEffect(() => {
    setSlots(sortSlots(initialSlots ?? []));
    setEnabled(new Set((initialSlots ?? []).map((s) => s.dayOfWeek)));
    setErrorByDay({});
  }, [initialSlots ? slotsKey(initialSlots) : 'empty']); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(
    () => slotsKey(slots) !== slotsKey(initialSlots ?? []),
    [slots, initialSlots],
  );

  const totalMinutes = useMemo(
    () =>
      slots.reduce(
        (sum, s) => sum + Math.max(0, toMinutes(s.endTime) - toMinutes(s.startTime)),
        0,
      ),
    [slots],
  );

  const grouped = useMemo(() => {
    const map = new Map<IsoWeekday, AvailabilitySlot[]>();
    for (const d of WEEKDAYS) map.set(d.value, []);
    for (const s of slots) map.get(s.dayOfWeek)?.push(s);
    for (const list of map.values())
      list.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    return map;
  }, [slots]);

  const draftOf = (day: IsoWeekday) => drafts[day] ?? { start: '09:00', duration: 60 };

  const setDraft = (day: IsoWeekday, patch: Partial<{ start: string; duration: number }>) =>
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
    const overlap = existing.some((s) => {
      const es = toMinutes(s.startTime);
      const ee = toMinutes(s.endTime);
      return ns < ee && ne > es;
    });
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
    const template: AvailabilitySlot[] = [1, 2, 3, 4, 5].map((d) => ({
      dayOfWeek: d as IsoWeekday,
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
        for (const s of source) copies.push({ dayOfWeek: d as IsoWeekday, startTime: s.startTime, endTime: s.endTime });
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <CalendarCheck2 className="size-5 text-[#F26F21]" aria-hidden />
            Weekly availability
          </h2>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
            Turn days on, then add slots. Students can only book inside these windows.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
            {slots.length} slot{slots.length === 1 ? '' : 's'} · {(totalMinutes / 60).toFixed(1)}h / week
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={applyWeekdays}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
          >
            <CalendarCheck2 className="size-4" aria-hidden />
            Mon–Fri 9:00–11:30
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={slots.length === 0}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <Eraser className="size-4" aria-hidden />
            Clear all
          </button>
        </div>
      </div>

      {/* Day cards */}
      <div className="mt-6 space-y-4">
        {WEEKDAYS.map((d) => {
          const isOn = enabled.has(d.value);
          const list = grouped.get(d.value) ?? [];
          const draft = draftOf(d.value);
          const err = errorByDay[d.value];
          const isWeekend = d.value >= 6;
          return (
            <div
              key={d.value}
              className={cn(
                'rounded-2xl border p-4 transition-colors sm:p-5',
                isOn ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/70',
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`${d.full} availability`}
                  onClick={() => toggleDay(d.value)}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    isOn ? 'bg-[#F26F21]' : 'bg-slate-300',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-0.5 size-6 rounded-full bg-white shadow transition-all',
                      isOn ? 'left-[22px]' : 'left-0.5',
                    )}
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-slate-900">
                    {d.full}
                    {isWeekend && (
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
                        Weekend
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-600">
                    {isOn
                      ? list.length === 0
                        ? 'On — add your first slot below'
                        : `${list.length} slot${list.length === 1 ? '' : 's'}`
                      : 'Off — students cannot book'}
                  </p>
                </div>
                {isOn && list.length > 0 && (
                  <button
                    type="button"
                    onClick={() => copyDayToWeekdays(d.value)}
                    title={`Copy ${d.short} slots to Mon–Fri`}
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
                  >
                    <Copy className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Copy to weekdays</span>
                  </button>
                )}
              </div>

              {isOn && (
                <div className="mt-4">
                  {/* Existing slots as chips */}
                  {list.length > 0 && (
                    <ul className="flex flex-wrap gap-2.5" aria-label={`${d.full} slots`}>
                      {list.map((s) => (
                        <li
                          key={`${s.startTime}-${s.endTime}`}
                          className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-50 px-3.5 text-sm font-bold tabular-nums text-orange-950 ring-1 ring-inset ring-orange-200"
                        >
                          {s.startTime} – {s.endTime}
                          <button
                            type="button"
                            onClick={() => removeSlot(d.value, s.startTime)}
                            aria-label={`Remove ${s.startTime} to ${s.endTime} on ${d.full}`}
                            className="flex size-7 items-center justify-center rounded-lg text-orange-700 transition-colors hover:bg-orange-100 hover:text-red-700"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Add row */}
                  <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <label className="flex flex-1 items-center gap-2">
                      <span className="sr-only">Start time on {d.full}</span>
                      <select
                        value={draft.start}
                        onChange={(e) => setDraft(d.value, { start: e.target.value })}
                        className={cn(inputClass, 'w-full')}
                      >
                        {START_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            From {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-1 items-center gap-2">
                      <span className="sr-only">Duration on {d.full}</span>
                      <select
                        value={draft.duration}
                        onChange={(e) => setDraft(d.value, { duration: Number(e.target.value) })}
                        className={cn(inputClass, 'w-full')}
                      >
                        {DURATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label} → ends {toHHMM(toMinutes(draft.start) + o.value)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => addSlot(d.value)}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
                    >
                      <Plus className="size-4" aria-hidden />
                      Add slot
                    </button>
                  </div>
                  {err && (
                    <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
                      {err}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <p className="mr-auto text-sm font-medium text-slate-600">
          {dirty ? (
            <span className="font-bold text-[#c2410c]">● Unsaved changes — remember to save.</span>
          ) : slots.length === 0 ? (
            'No slots published yet. Students cannot book until you add some.'
          ) : (
            'All changes saved. Students see these windows when booking.'
          )}
        </p>
        <button
          type="button"
          onClick={handleReset}
          disabled={!dirty || mutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending || !dirty}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
        >
          <Save className="size-4" aria-hidden />
          {mutation.isPending ? 'Saving…' : 'Save availability'}
        </button>
      </div>
    </div>
  );
}
