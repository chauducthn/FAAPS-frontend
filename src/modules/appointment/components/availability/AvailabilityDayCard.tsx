// Single weekday card for configuring availability slots.

import { Copy, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AvailabilitySlot, IsoWeekday } from '../../types/appointment';
import {
  DURATION_OPTIONS,
  START_OPTIONS,
  toHHMM,
  toMinutes,
  type DayDraft,
  type WeekdayOption,
} from './availabilityUtils';

const INPUT_CLASS =
  'h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/30';

interface AvailabilityDayCardProps {
  day: WeekdayOption;
  isOn: boolean;
  slots: AvailabilitySlot[];
  draft: DayDraft;
  error: string | null | undefined;
  onToggle: (day: IsoWeekday) => void;
  onCopyToWeekdays: (day: IsoWeekday) => void;
  onRemoveSlot: (day: IsoWeekday, start: string) => void;
  onDraftChange: (day: IsoWeekday, patch: Partial<DayDraft>) => void;
  onAddSlot: (day: IsoWeekday) => void;
}

export function AvailabilityDayCard({
  day,
  isOn,
  slots,
  draft,
  error,
  onToggle,
  onCopyToWeekdays,
  onRemoveSlot,
  onDraftChange,
  onAddSlot,
}: AvailabilityDayCardProps) {
  const isWeekend = day.value >= 6;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors sm:p-5',
        isOn ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/70',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`${day.full} availability`}
          onClick={() => onToggle(day.value)}
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
            {day.full}
            {isWeekend && (
              <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
                Weekend
              </span>
            )}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-600">
            {isOn
              ? slots.length === 0
                ? 'On — add your first slot below'
                : `${slots.length} slot${slots.length === 1 ? '' : 's'}`
              : 'Off — students cannot book'}
          </p>
        </div>

        {isOn && slots.length > 0 && (
          <button
            type="button"
            onClick={() => onCopyToWeekdays(day.value)}
            title={`Copy ${day.short} slots to Mon–Fri`}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]"
          >
            <Copy className="size-4" aria-hidden />
            <span className="hidden sm:inline">Copy to weekdays</span>
          </button>
        )}
      </div>

      {isOn && (
        <div className="mt-4">
          {slots.length > 0 && (
            <ul className="flex flex-wrap gap-2.5" aria-label={`${day.full} slots`}>
              {slots.map((s) => (
                <li
                  key={`${s.startTime}-${s.endTime}`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-50 px-3.5 text-sm font-bold tabular-nums text-orange-950 ring-1 ring-inset ring-orange-200"
                >
                  {s.startTime} – {s.endTime}
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(day.value, s.startTime)}
                    aria-label={`Remove ${s.startTime} to ${s.endTime} on ${day.full}`}
                    className="flex size-7 items-center justify-center rounded-lg text-orange-700 transition-colors hover:bg-orange-100 hover:text-red-700"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2">
              <span className="sr-only">Start time on {day.full}</span>
              <select
                value={draft.start}
                onChange={(e) => onDraftChange(day.value, { start: e.target.value })}
                className={cn(INPUT_CLASS, 'w-full')}
              >
                {START_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    From {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 items-center gap-2">
              <span className="sr-only">Duration on {day.full}</span>
              <select
                value={draft.duration}
                onChange={(e) => onDraftChange(day.value, { duration: Number(e.target.value) })}
                className={cn(INPUT_CLASS, 'w-full')}
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
              onClick={() => onAddSlot(day.value)}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
            >
              <Plus className="size-4" aria-hidden />
              Add slot
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
