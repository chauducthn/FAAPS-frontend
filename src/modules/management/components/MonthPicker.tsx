import { CaretDown } from '@phosphor-icons/react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const selectClass =
  'h-9 w-full appearance-none rounded-md border border-line bg-white pl-3 pr-8 text-[13px] font-medium text-ink-primary ' +
  'transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

interface MonthPickerProps {
  label: string;
  /** "YYYY-MM" */
  value: string;
  onChange: (value: string) => void;
}

/** English month + year selects. The native month input follows the browser language, which is not wanted here. */
export function MonthPicker({ label, value, onChange }: MonthPickerProps) {
  const [year, month] = value.split('-').map(Number);
  const thisYear = new Date().getFullYear();
  const first = Math.min(thisYear - 8, year);
  const last = Math.max(thisYear + 1, year);
  const years = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const emit = (y: number, m: number) => onChange(`${y}-${String(m).padStart(2, '0')}`);

  return (
    <div className="flex flex-col gap-1 text-xs font-medium text-ink-muted" role="group" aria-label={label}>
      {label}
      <div className="grid grid-cols-[1fr_88px] gap-2">
        <div className="relative">
          <select aria-label={`${label} - month`} value={month} onChange={(e) => emit(year, Number(e.target.value))} className={selectClass}>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
          <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" aria-hidden />
        </div>
        <div className="relative">
          <select aria-label={`${label} - year`} value={year} onChange={(e) => emit(Number(e.target.value), month)} className={selectClass}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <CaretDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" aria-hidden />
        </div>
      </div>
    </div>
  );
}
