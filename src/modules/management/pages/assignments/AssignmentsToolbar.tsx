import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import type { SummaryCohort } from '../../types/admin';
import { cn } from '@/shared/lib/utils';

export type AssignmentTab = 'advisors' | 'unassigned';

export const ASSIGNMENT_TABS: { key: AssignmentTab; label: string }[] = [
  { key: 'advisors', label: 'Advisors' },
  { key: 'unassigned', label: 'Unassigned students' },
];

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';

export function AssignmentsTabBar({
  tab,
  unassignedCount,
  onTabChange,
}: {
  tab: AssignmentTab;
  unassignedCount?: number;
  onTabChange: (tab: AssignmentTab) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-2.5">
      <div role="tablist" aria-label="Assignment view" className="inline-flex items-center gap-1 rounded-lg bg-gray-100/80 p-1">
        {ASSIGNMENT_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all',
                active
                  ? 'bg-white font-semibold text-gray-900 shadow-2xs ring-1 ring-black/5'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {t.label}
              {t.key === 'unassigned' && unassignedCount !== undefined ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.25 text-[11px] font-semibold tabular-nums',
                    active && unassignedCount > 0
                      ? 'bg-orange-100 text-[#C2410C]'
                      : 'bg-gray-200/80 text-gray-600',
                  )}
                >
                  {unassignedCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="hidden text-xs text-gray-500 md:block">
        {tab === 'advisors'
          ? 'Monitor advisor workload, click any cohort chip to configure its pool, or open details.'
          : 'Assign a student directly from their row, or select multiple rows for bulk assignment.'}
      </p>
    </div>
  );
}

export function AssignmentsFilterBar({
  tab,
  search,
  majorFilter,
  cohortFilter,
  pendingOnly,
  majors,
  cohorts,
  advisorCohortOptions,
  hasFilter,
  onSearchChange,
  onMajorChange,
  onCohortChange,
  onPendingChange,
  onClear,
}: {
  tab: AssignmentTab;
  search: string;
  majorFilter: string;
  cohortFilter: string;
  pendingOnly: boolean;
  majors: string[];
  cohorts: SummaryCohort[];
  advisorCohortOptions: SummaryCohort[];
  hasFilter: boolean;
  onSearchChange: (val: string) => void;
  onMajorChange: (val: string) => void;
  onCohortChange: (val: string) => void;
  onPendingChange: (checked: boolean) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tab === 'advisors' ? 'Search by advisor name or email...' : 'Search by student ID or name...'}
          aria-label="Search"
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

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]">
        <select value={majorFilter} onChange={(e) => onMajorChange(e.target.value)} aria-label="Filter by major" className={selectClass}>
          <option value="">All majors</option>
          {majors.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[164px]">
        <select value={cohortFilter} onChange={(e) => onCohortChange(e.target.value)} aria-label="Filter by cohort" className={selectClass}>
          <option value="">All cohorts</option>
          {(majorFilter ? advisorCohortOptions : cohorts).map((c) => (
            <option key={c.cohortId} value={c.cohortId}>
              {majorFilter
                ? tab === 'unassigned' ? `${c.cohort} (${c.unassigned})` : c.cohort
                : tab === 'unassigned' ? `${c.cohort} · ${c.majorCode} (${c.unassigned})` : `${c.cohort} · ${c.majorCode}`}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      {tab === 'unassigned' && (
        <label
          className={cn(
            'inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors',
            pendingOnly
              ? 'border-[#F26F21]/50 bg-orange-50/70 text-[#C2410C]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
          )}
        >
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => onPendingChange(e.target.checked)}
            className="size-3.5 accent-[#F26F21]"
          />
          Requested an advisor
        </label>
      )}

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilter}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
