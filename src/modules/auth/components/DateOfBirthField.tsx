import { useMemo, type ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { MIN_STUDENT_AGE } from '../validations/register.schema';
import { authSelectClass as select } from './authFormStyles';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Replaces the native select arrow with an evenly inset caret. */
function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-w-0">
      {children}
      <CaretDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle"
        weight="bold"
        aria-hidden
      />
    </div>
  );
}

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
  // The newest selectable year is the one of the youngest allowed student.
  const years = useMemo(() => Array.from({ length: 60 }, (_, i) => thisYear - MIN_STUDENT_AGE - i), [thisYear]);

  // Keep a partially chosen date in the form as "YYYY-MM-DD" with empty parts so the selects do not reset.
  const update = (next: { year?: string; month?: string; day?: string }) => {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const d = next.day ?? day;
    onChange(y && m && d ? `${y}-${m}-${d}` : y || m || d ? `${y}-${m}-${d}` : '');
  };

  return (
    <div className="grid grid-cols-[1fr_1.4fr_1.1fr] gap-2">
      <SelectShell>
        <select
          id={`${idPrefix}-day`}
          aria-label="Day of birth"
          value={day}
          onChange={(e) => update({ day: e.target.value })}
          className={select}
        >
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
            <option key={d} value={d}>
              {Number(d)}
            </option>
          ))}
        </select>
      </SelectShell>
      <SelectShell>
        <select
          id={`${idPrefix}-month`}
          aria-label="Month of birth"
          value={month}
          onChange={(e) => update({ month: e.target.value })}
          className={select}
        >
          <option value="">Month</option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, '0')}>
              {name}
            </option>
          ))}
        </select>
      </SelectShell>
      <SelectShell>
        <select
          id={`${idPrefix}-year`}
          aria-label="Year of birth"
          value={year}
          onChange={(e) => update({ year: e.target.value })}
          className={select}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </SelectShell>
    </div>
  );
}
