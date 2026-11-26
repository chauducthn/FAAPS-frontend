import { useEffect, useRef, useState } from 'react';
import { CalendarRange, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { STATUS_META } from '../AppointmentBits';
import type { AppointmentStatus } from '../../types/admin';

const CONTROL_CLASS =
  'h-9 w-full rounded-lg border-0 bg-transparent pl-8 pr-7 text-[13px] font-medium text-gray-700 outline-none truncate';

const WRAP_CLASS =
  'relative inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300 focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/15';

export function FilterSelectControl({
  label,
  value,
  onChange,
  children,
  icon,
  widthClass = 'w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <div className={cn(WRAP_CLASS, widthClass)}>
      <span aria-hidden className="pointer-events-none absolute left-2.5 flex items-center text-gray-400">
        {icon}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL_CLASS, 'cursor-pointer appearance-none')}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2 size-3.5 text-gray-400" />
    </div>
  );
}

export function DateRangeControl({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const hasRange = !!fromDate || !!toDate;
  const summary = fromDate && toDate ? `${fromDate} → ${toDate}` : fromDate ? `From ${fromDate}` : toDate ? `Until ${toDate}` : 'Any date';

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Filter by date range"
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/30',
          hasRange
            ? 'border-[#F26F21]/40 bg-orange-50/70 text-[#9a3412]'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
          open && 'border-[#F26F21] ring-2 ring-[#F26F21]/15',
        )}
      >
        <CalendarRange className="size-4 shrink-0 text-gray-400" aria-hidden />
        <span className="whitespace-nowrap">{hasRange ? summary : 'Date range'}</span>
        <ChevronDown className="size-3.5 shrink-0 text-gray-400" aria-hidden />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-[19rem] rounded-xl border border-gray-200 bg-white p-3 shadow-[0_12px_32px_rgba(20,32,51,0.14)] sm:left-auto sm:right-0">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5b6577]">
                From
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => onFromChange(event.target.value)}
                aria-label="Filter by start date"
                className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[13px] text-[#151c27] outline-none focus:border-[#f37021] focus:ring-1 focus:ring-[#f37021]/30"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5b6577]">
                To
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => onToChange(event.target.value)}
                aria-label="Filter by end date"
                className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white px-2.5 text-[13px] text-[#151c27] outline-none focus:border-[#f37021] focus:ring-1 focus:ring-[#f37021]/30"
              />
            </label>
          </div>
          {hasRange ? (
            <button
              type="button"
              onClick={() => {
                onFromChange('');
                onToChange('');
              }}
              className="mt-3 text-[12px] font-semibold text-[#f37021] hover:underline"
            >
              Clear date range
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AppointmentStatusIcon({ status }: { status: AppointmentStatus | '' }) {
  if (!status) {
    return (
      <span aria-hidden className="size-2 rounded-full border-[1.5px] border-dashed border-[#5b6577]" />
    );
  }
  const Icon = STATUS_META[status].icon;
  return <Icon className="size-4" aria-hidden />;
}
