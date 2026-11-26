import { CaretDown as ChevronDown, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import type { AcademicRuleStatus } from '../../../academic/types/academic-rule';
import { POLICY_TYPES } from '../../../academic/validations/academic-rule.schema';

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';

export function AcademicRulesFilterBar({
  search,
  policyType,
  status,
  hasFilters,
  onSearchChange,
  onPolicyTypeChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  policyType: string;
  status: 'ALL' | AcademicRuleStatus;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onPolicyTypeChange: (value: string) => void;
  onStatusChange: (value: 'ALL' | AcademicRuleStatus) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by rule name, policy type, or description..."
          aria-label="Search academic rules"
          role="searchbox"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[168px]">
        <select
          value={policyType}
          onChange={(e) => onPolicyTypeChange(e.target.value)}
          aria-label="Filter by policy type"
          className={selectClass}
        >
          <option value="ALL">All policy types</option>
          {POLICY_TYPES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'ALL' | AcademicRuleStatus)}
          aria-label="Filter by status"
          className={selectClass}
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        aria-label="Clear filters"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
