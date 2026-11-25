import type { Appointment } from '../types/admin';

const dateFmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

/** "Oct 12, 2026" */
export function formatSlotDay(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', dateFmt);
}

/** "09:00" */
export function formatSlotTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', timeFmt);
}

/** "09:00 – 09:30" (end omitted when the session has no end time). */
export function formatSlotTimeRange(a: Pick<Appointment, 'scheduledAt' | 'endedAt'>) {
  if (!a.scheduledAt) return '—';
  const start = new Date(a.scheduledAt);
  const from = start.toLocaleTimeString('en-US', timeFmt);
  if (!a.endedAt) return from;
  const end = new Date(a.endedAt);
  const sameDay = end.toDateString() === start.toDateString();
  const to = sameDay
    ? end.toLocaleTimeString('en-US', timeFmt)
    : `${end.toLocaleDateString('en-US', dateFmt)} ${end.toLocaleTimeString('en-US', timeFmt)}`;
  return `${from} – ${to}`;
}

/** Local calendar key (yyyy-MM-dd) — the grouping key of the timeline. */
export function localDayKey(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA');
}

/** "Monday" */
export function formatWeekday(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
}

/** "Oct 12, 2026 · 09:00 – 09:30" (kept for the detail modal). */
export function formatSlot(a: Pick<Appointment, 'scheduledAt' | 'endedAt'>) {
  if (!a.scheduledAt) return '—';
  const start = new Date(a.scheduledAt);
  const day = start.toLocaleDateString('en-US', dateFmt);
  const from = start.toLocaleTimeString('en-US', timeFmt);
  if (!a.endedAt) return `${day} · ${from}`;
  const end = new Date(a.endedAt);
  const sameDay = end.toDateString() === start.toDateString();
  const to = sameDay
    ? end.toLocaleTimeString('en-US', timeFmt)
    : `${end.toLocaleDateString('en-US', dateFmt)} ${end.toLocaleTimeString('en-US', timeFmt)}`;
  return `${day} · ${from} – ${to}`;
}

export function durationMinutes(a: Pick<Appointment, 'scheduledAt' | 'endedAt'>) {
  if (!a.scheduledAt || !a.endedAt) return null;
  const minutes = Math.round(
    (new Date(a.endedAt).getTime() - new Date(a.scheduledAt).getTime()) / 60000,
  );
  return minutes > 0 ? minutes : null;
}
