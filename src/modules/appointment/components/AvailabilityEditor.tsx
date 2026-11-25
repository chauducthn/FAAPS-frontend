// Weekly availability editor with day-by-day cards, overlap validation,
// quick templates (Mon-Fri), copy-to-weekdays, and dirty tracking.

import { CalendarCheck2, Eraser, RotateCcw, Save } from 'lucide-react';
import type { AvailabilitySlot } from '../types/appointment';
import { AvailabilityDayCard } from './availability/AvailabilityDayCard';
import { WEEKDAYS } from './availability/availabilityUtils';
import { useAvailabilityEditor } from './availability/useAvailabilityEditor';

interface AvailabilityEditorProps {
  /** The advisor's current weekly template, when it is already loaded. */
  initialSlots?: AvailabilitySlot[];
}

/** Configure the weekly availability published to students. */
export function AvailabilityEditor({ initialSlots }: AvailabilityEditorProps) {
  const {
    slots,
    enabled,
    errorByDay,
    dirty,
    totalMinutes,
    grouped,
    isSaving,
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
  } = useAvailabilityEditor(initialSlots);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
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

      <div className="mt-6 space-y-4">
        {WEEKDAYS.map((d) => (
          <AvailabilityDayCard
            key={d.value}
            day={d}
            isOn={enabled.has(d.value)}
            slots={grouped.get(d.value) ?? []}
            draft={draftOf(d.value)}
            error={errorByDay[d.value]}
            onToggle={toggleDay}
            onCopyToWeekdays={copyDayToWeekdays}
            onRemoveSlot={removeSlot}
            onDraftChange={setDraft}
            onAddSlot={addSlot}
          />
        ))}
      </div>

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
          disabled={!dirty || isSaving}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !dirty}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
        >
          <Save className="size-4" aria-hidden />
          {isSaving ? 'Saving…' : 'Save availability'}
        </button>
      </div>
    </div>
  );
}
