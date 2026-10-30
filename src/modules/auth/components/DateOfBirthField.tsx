import { useMemo } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const select =
  'block w-full min-w-0 rounded-lg border border-gray-300 bg-white px-2.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

interface Props {
  /** ISO date (YYYY-MM-DD) or an empty string while incomplete. */
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
}

/** Day / month / year selects. A native date input follows the browser language, which is not always English. */
export function DateOfBirthField({ value, onChange, idPrefix = 'dob' }: Props) {
  const [year = '', month = '', day = ''] = value ? value.split('-') : [];
  const thisYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 71 }, (_, i) => thisYear - 14 - i), [thisYear]);

  // Keep a partially chosen date in the form as "YYYY-MM-DD" with empty parts so the selects do not reset.
  const update = (next: { year?: string; month?: string; day?: string }) => {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const d = next.day ?? day;
    onChange(y && m && d ? `${y}-${m}-${d}` : y || m || d ? `${y}-${m}-${d}` : '');
  };

  return (
    <div className="grid grid-cols-[1fr_1.7fr_1.2fr] gap-2">
      <select id={`${idPrefix}-day`} aria-label="Day of birth" value={day} onChange={(e) => update({ day: e.target.value })} className={select}>
        <option value="">Day</option>
        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
          <option key={d} value={d}>
            {Number(d)}
          </option>
        ))}
      </select>
      <select id={`${idPrefix}-month`} aria-label="Month of birth" value={month} onChange={(e) => update({ month: e.target.value })} className={select}>
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, '0')}>
            {name}
          </option>
        ))}
      </select>
      <select id={`${idPrefix}-year`} aria-label="Year of birth" value={year} onChange={(e) => update({ year: e.target.value })} className={select}>
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
