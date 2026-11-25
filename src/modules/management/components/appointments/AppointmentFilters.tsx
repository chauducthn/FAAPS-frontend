import { useEffect, useState } from 'react';
import { RotateCcw, Search, User } from 'lucide-react';
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
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#e5e7eb] bg-[#f7f8fa] p-1">
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

      <FilterSelectControl
        label="Filter by status"
        value={status}
        onChange={(value) => onStatusChange(value as AppointmentStatus | '')}
        icon={<AppointmentStatusIcon status={status} />}
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
