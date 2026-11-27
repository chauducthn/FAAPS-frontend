import { useEffect, useState } from 'react';
import { ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, User, X } from '@phosphor-icons/react';
import { APPOINTMENT_STATUSES, STATUS_META } from '../AppointmentBits';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AppointmentStatus, AssignmentAdvisor } from '../../types/admin';
import {
  AppointmentStatusIcon,
  DateRangeControl,
  FilterSelectControl,
} from './AppointmentFilterControls';

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

  useEffect(() => {
    setLocalSearch((current) => (current === search ? current : search));
  }, [search]);

  useEffect(() => {
    if (debouncedSearch === search) return;
    onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Search student, advisor or topic..."
          aria-label="Search appointments"
          className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-7 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle hover:text-ink-muted"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <FilterSelectControl
        label="Filter by status"
        value={status}
        onChange={(value) => onStatusChange(value as AppointmentStatus | '')}
        icon={<AppointmentStatusIcon status={status} />}
        widthClass="w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]"
      >
        <option value="">All statuses</option>
        {APPOINTMENT_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_META[value].label}
          </option>
        ))}
      </FilterSelectControl>

      <FilterSelectControl
        label="Filter by advisor"
        value={advisorId}
        onChange={onAdvisorChange}
        icon={<User className="size-4" aria-hidden />}
        widthClass="w-[calc(50%-0.25rem)] shrink-0 sm:w-[168px]"
      >
        <option value="">All advisors</option>
        {advisors.map((advisor) => (
          <option key={advisor.id} value={advisor.id}>
            {advisor.fullName}
          </option>
        ))}
      </FilterSelectControl>

      <DateRangeControl
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={onFromDateChange}
        onToChange={onToDateChange}
      />

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        Reset
      </button>
    </div>
  );
}
