import { CaretDown as ChevronDown, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import type { AcademicRuleStatus } from '../../../academic/types/academic-rule';
import { POLICY_TYPES } from '../../../academic/validations/academic-rule.schema';

const selectClass =
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-7 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

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
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by rule name, policy type, or description..."
          aria-label="Search academic rules"
          role="searchbox"
          className="h-9 w-full rounded-md border border-line bg-white pl-9 pr-7 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle hover:text-ink-muted"
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
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
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
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        aria-label="Clear filters"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
