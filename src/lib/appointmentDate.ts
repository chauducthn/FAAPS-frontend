// src/lib/appointmentDate.ts
// Small date helpers shared by the student booking view and the advisor weekly calendar.

/** Local "yyyy-MM-dd" key for a Date (not UTC — the calendar is rendered in the user's timezone). */
export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Parses "yyyy-MM-dd" into a local Date at midnight. */
export const fromDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

/** Monday of the week containing `date`. */
export const startOfWeek = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = d.getDay(); // 0 = Sunday
  const offset = weekday === 0 ? -6 : 1 - weekday;
  d.setDate(d.getDate() + offset);
  return d;
};

/** Adds `days` calendar days. */
export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/** The 7 days (Mon -> Sun) of the week containing `date`. */
export const weekDays = (date: Date): Date[] => {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

/** "yyyy-MM-dd" keys of the week containing `date`. */
export const weekDateKeys = (date: Date): string[] => weekDays(date).map(toDateKey);

/** "HH:mm" of a Date. */
export const toTimeValue = (date: Date): string =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

/** ISO-8601 local date-time ("2026-10-25T09:00:00") — the format the booking endpoint expects. */
export const toIsoLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

/** "09:00" for a Date. */
export const formatTime = (date: Date): string => date.toLocaleTimeString('en-US', timeFmt);

/** "09:00" for an ISO string. */
export const formatIsoTime = (iso: string): string => formatTime(new Date(iso));

const dayFmt: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: '2-digit' };

/** "Oct 25, 2026" for a Date. */
export const formatDay = (date: Date): string => date.toLocaleDateString('en-US', dayFmt);

/** "Oct 25, 2026" for an ISO string. */
export const formatIsoDay = (iso: string): string => formatDay(new Date(iso));

/** "Mon, Oct 25" — the header label of a calendar column. */
export const formatColumnDay = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

/** True when the date is today (local). */
export const isToday = (date: Date): boolean => toDateKey(date) === toDateKey(new Date());

/** "2026-10-25" -> "Mon" ... "Sun" (ISO weekday number). */
export const ISO_WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** ISO weekday number (1 = Monday) of a Date. */
export const isoWeekday = (date: Date): number => (date.getDay() === 0 ? 7 : date.getDay());
