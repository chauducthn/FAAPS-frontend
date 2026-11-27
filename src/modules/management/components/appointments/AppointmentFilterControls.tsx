import { useEffect, useRef, useState } from 'react';
import { CalendarDots as CalendarRange, CaretDown as ChevronDown } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { STATUS_META } from '../AppointmentBits';
import type { AppointmentStatus } from '../../types/admin';

const CONTROL_CLASS =
  'h-9 w-full rounded-lg border-0 bg-transparent pl-8 pr-7 text-[13px] font-medium text-ink-secondary outline-none truncate';

const WRAP_CLASS =
  'relative inline-flex h-9 items-center rounded-lg border border-line bg-white text-ink-muted transition-colors hover:border-ink-subtle/50 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15';

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
      <span aria-hidden className="pointer-events-none absolute left-2.5 flex items-center text-ink-subtle">
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
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2 size-3.5 text-ink-subtle" />
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
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          hasRange
            ? 'border-brand/40 bg-brand-soft/70 text-brand-ink'
            : 'border-line bg-white text-ink-secondary hover:border-ink-subtle/50',
          open && 'border-brand ring-2 ring-brand/15',
        )}
      >
        <CalendarRange className="size-4 shrink-0 text-ink-subtle" aria-hidden />
        <span className="whitespace-nowrap">{hasRange ? summary : 'Date range'}</span>
        <ChevronDown className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-[19rem] rounded-lg border border-line bg-white p-3 shadow-[0_12px_32px_rgba(20,32,51,0.14)] sm:left-auto sm:right-0">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
                From
              </span>
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => onFromChange(event.target.value)}
                aria-label="Filter by start date"
                className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[13px] text-ink-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
                To
              </span>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => onToChange(event.target.value)}
                aria-label="Filter by end date"
                className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[13px] text-ink-primary outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
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
              className="mt-3 text-[12px] font-semibold text-brand hover:underline"
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
      <span aria-hidden className="size-2 rounded-full border-[1.5px] border-dashed border-ink-muted" />
    );
  }
  const Icon = STATUS_META[status].icon;
  return <Icon className="size-4" aria-hidden />;
}
