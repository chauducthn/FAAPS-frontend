const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** yyyy-MM for a Date. */
export const toMonthValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** "2025-07" -> "Jul/2025" */
export const formatMonthLabel = (month: string) => {
  const [year, m] = month.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]}/${year}`;
};

/** Last `count` months ending at the current month. */
export const defaultMonthRange = (count = 12) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);
  return { start: toMonthValue(start), end: toMonthValue(now) };
};

/** Every yyyy-MM from start to end, inclusive. */
export const monthsBetween = (start: string, end: string) => {
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  const result: string[] = [];
  for (let y = sy, m = sm; y < ey || (y === ey && m <= em); m === 12 ? ((y += 1), (m = 1)) : (m += 1)) {
    result.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return result;
};

/** Number of months in the inclusive range; 0 if malformed or reversed. */
export const monthSpan = (start: string, end: string) => {
  if (!/^\d{4}-\d{2}$/.test(start) || !/^\d{4}-\d{2}$/.test(end)) return 0;
  return monthsBetween(start, end).length;
};
