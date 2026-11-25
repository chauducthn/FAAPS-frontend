// Date formatting helpers for the appointment date selector.

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_MS = 86_400_000;

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function relativeLabel(selected: Date, today: Date): string {
  const diff = Math.round((startOfDay(selected).getTime() - startOfDay(today).getTime()) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1) return `${Math.abs(diff)} days ago`;
  return selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonthLabel(visibleDays: Date[]): string {
  const first = visibleDays[0];
  const last = visibleDays[visibleDays.length - 1];
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
  if (sameMonth) return first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const fmt: Intl.DateTimeFormatOptions = { month: 'short' };
  return `${first.toLocaleDateString('en-US', fmt)} – ${last.toLocaleDateString('en-US', { ...fmt, year: 'numeric' })}`;
}
