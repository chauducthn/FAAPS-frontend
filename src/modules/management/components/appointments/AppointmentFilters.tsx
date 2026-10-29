import { useEffect, useRef, useState } from 'react';
import { CalendarRange, ChevronDown, RotateCcw, Search, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  APPOINTMENT_STATUSES,
  STATUS_META,
} from '../AppointmentBits';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AppointmentStatus, AssignmentAdvisor } from '../../types/admin';

const CONTROL_CLASS =
  'h-9 w-full rounded-lg border border-transparent bg-transparent pl-8 pr-7 text-[13px] font-medium text-[#151c27] outline-none transition-colors hover:bg-white focus:border-[#f37021] focus:bg-white focus:ring-1 focus:ring-[#f37021]/30';

const WRAP_CLASS =
  'relative inline-flex h-9 items-center rounded-lg border border-transparent text-[#555f6f] transition-colors hover:bg-white focus-within:border-[#f37021] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#f37021]/30';

/** A select that shows an icon on the left and a chevron on the right. */
function SelectControl({
  label,
  value,
  onChange,
  children,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className={WRAP_CLASS}>
      <span aria-hidden className="pointer-events-none absolute left-2.5 flex items-center text-[#5b6577]">
        {icon}
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL_CLASS, 'cursor-pointer appearance-none pr-7')}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2 size-3.5 text-[#5b6577]"
      />
    </div>
  );
}

/**
 * A compact from–to date range.
 *
 * The two native date inputs sit on top of a single calendar icon, so the
 * control reads as one field instead of two boxes. The native picker is kept
 * because it is accessible, keyboard-operable and localised for free.
 */
function DateRangeControl({
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
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Filter by date range"
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-lg border px-2.5 text-[13px] font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37021]/40',
          hasRange
            ? 'border-[#f37021]/30 bg-[#fff7ed] text-[#9a3412]'
            : 'border-transparent text-[#555f6f] hover:bg-white',
          open && 'border-[#f37021] bg-white ring-1 ring-[#f37021]/30',
        )}
      >
        <CalendarRange className="size-4 shrink-0" aria-hidden />
        <span className="whitespace-nowrap">{hasRange ? summary : 'Date range'}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 w-[19rem] rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-[0_12px_32px_rgba(20,32,51,0.14)]">
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

export interface AppointmentFiltersProps {
  search: string;
  status: AppointmentStatus | '';
  advisorId: string;
  advisors: AssignmentAdvisor[];
  fromDate: string;
  toDate: string;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AppointmentStatus | '') => void;
  onAdvisorChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onClear: () => void;
}

/**
 * The filter toolbar: one unified block that holds the search field, the
 * status and advisor selects and the date range, styled like a Linear/Stripe
 * command bar rather than a row of separate boxes.
 */
export function AppointmentFilters({
  search,
  status,
  advisorId,
  advisors,
  fromDate,
  toDate,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onAdvisorChange,
  onFromDateChange,
  onToDateChange,
  onClear,
}: AppointmentFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  // The parent owns the value so "Reset" can empty the box; the field keeps
  // what the user is typing in the meantime.
  useEffect(() => {
    setLocalSearch((current) => (current === search ? current : search));
  }, [search]);

  // Only the settled term reaches the parent, so every keystroke does not
  // trigger a request.
  useEffect(() => {
    if (debouncedSearch === search) return;
    onSearchChange(debouncedSearch);
    // `search` is excluded on purpose: it is the value this effect writes to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#e5e7eb] bg-[#f7f8fa] p-1">
      {/* Search */}
      <div className="relative min-w-[13rem] flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#5b6577]"
          aria-hidden
        />
        <input
          type="search"
          value={localSearch}
          onChange={(event) => {
            setLocalSearch(event.target.value);
          }}
          placeholder="Search student, advisor or topic..."
          aria-label="Search appointments"
          className="h-9 w-full rounded-lg border border-transparent bg-transparent pl-8 pr-3 text-[13px] text-[#151c27] outline-none transition-colors placeholder:text-[#5b6577] hover:bg-white focus:border-[#f37021] focus:bg-white focus:ring-1 focus:ring-[#f37021]/30"
        />
      </div>

      <span aria-hidden className="h-5 w-px shrink-0 bg-[#e5e7eb]" />

      <SelectControl
        label="Filter by status"
        value={status}
        onChange={(value) => onStatusChange(value as AppointmentStatus | '')}
        icon={<StatusIcon status={status} />}
      >
        <option value="">All statuses</option>
        {APPOINTMENT_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_META[value].label}
          </option>
        ))}
      </SelectControl>

      <SelectControl
        label="Filter by advisor"
        value={advisorId}
        onChange={onAdvisorChange}
        icon={<User className="size-4" aria-hidden />}
      >
        <option value="">All advisors</option>
        {advisors.map((advisor) => (
          <option key={advisor.id} value={advisor.id}>
            {advisor.fullName}
          </option>
        ))}
      </SelectControl>

      <DateRangeControl
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={onFromDateChange}
        onToChange={onToDateChange}
      />

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold text-[#555f6f] transition-colors hover:bg-white hover:text-[#151c27]"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </button>
      ) : null}
    </div>
  );
}

/** The status dot shown inside the status select. */
function StatusIcon({ status }: { status: AppointmentStatus | '' }) {
  if (!status) {
    return (
      <span
        aria-hidden
        className="size-2 rounded-full border-[1.5px] border-dashed border-[#5b6577]"
      />
    );
  }
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return <Icon className="size-4" aria-hidden />;
}
