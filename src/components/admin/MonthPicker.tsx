const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const selectClass =
  'h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

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
    <div className="flex flex-col gap-1 text-xs font-medium text-[#555f6f]" role="group" aria-label={label}>
      {label}
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <select aria-label={`${label} - month`} value={month} onChange={(e) => emit(year, Number(e.target.value))} className={selectClass}>
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </select>
        <select aria-label={`${label} - year`} value={year} onChange={(e) => emit(Number(e.target.value), month)} className={selectClass}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
