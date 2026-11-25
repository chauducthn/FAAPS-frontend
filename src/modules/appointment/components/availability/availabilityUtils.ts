// Constants and time helpers for the weekly availability editor.

import type { AvailabilitySlot, IsoWeekday } from '../../types/appointment';

export interface WeekdayOption {
  value: IsoWeekday;
  short: string;
  full: string;
}

export interface DayDraft {
  start: string;
  duration: number;
}

export const WEEKDAYS: WeekdayOption[] = [
  { value: 1, short: 'Mon', full: 'Monday' },
  { value: 2, short: 'Tue', full: 'Tuesday' },
  { value: 3, short: 'Wed', full: 'Wednesday' },
  { value: 4, short: 'Thu', full: 'Thursday' },
  { value: 5, short: 'Fri', full: 'Friday' },
  { value: 6, short: 'Sat', full: 'Saturday' },
  { value: 7, short: 'Sun', full: 'Sunday' },
];

export const START_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 7; h <= 19; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 19) out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
})();

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1h 30m' },
  { value: 120, label: '2 hours' },
];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function sortSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return [...slots].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || toMinutes(a.startTime) - toMinutes(b.startTime),
  );
}

export function slotsKey(slots: AvailabilitySlot[]): string {
  return JSON.stringify(sortSlots(slots));
}
