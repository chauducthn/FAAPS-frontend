import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import type { SummaryCohort } from '../../types/admin';
import { cn } from '@/shared/lib/utils';

export type AssignmentTab = 'advisors' | 'unassigned';

export const ASSIGNMENT_TABS: { key: AssignmentTab; label: string }[] = [
  { key: 'advisors', label: 'Advisors' },
  { key: 'unassigned', label: 'Unassigned students' },
];

const selectClass =
  'h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

export function StatCard({
  label,
  value,
  sub,
  tone,
  action,
}: {
  label: string;
  value?: number;
  sub?: string;
  tone?: 'warn';
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#555f6f]">{label}</p>
        <p className={cn('mt-1 text-3xl font-bold', tone === 'warn' && (value ?? 0) > 0 ? 'text-[#b45309]' : 'text-[#151c27]')}>
          {value ?? '–'}
          {sub && <span className="ml-2 text-xs font-medium text-[#555f6f]">{sub}</span>}
        </p>
      </div>
      {action}
    </div>
  );
}

export function AssignmentsFilterBar({
  tab,
  unassignedCount,
  search,
  majorFilter,
  cohortFilter,
  pendingOnly,
  majors,
  cohorts,
  advisorCohortOptions,
  hasFilter,
  onTabChange,
  onSearchChange,
  onMajorChange,
  onCohortChange,
  onPendingChange,
  onClear,
}: {
  tab: AssignmentTab;
  unassignedCount?: number;
  search: string;
  majorFilter: string;
  cohortFilter: string;
  pendingOnly: boolean;
  majors: string[];
  cohorts: SummaryCohort[];
  advisorCohortOptions: SummaryCohort[];
  hasFilter: boolean;
  onTabChange: (tab: AssignmentTab) => void;
  onSearchChange: (val: string) => void;
  onMajorChange: (val: string) => void;
  onCohortChange: (val: string) => void;
  onPendingChange: (checked: boolean) => void;
  onClear: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <div role="tablist" aria-label="Assignment view" className="flex flex-wrap gap-1">
        {ASSIGNMENT_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => onTabChange(t.key)}
            className={cn(
              'rounded-md border-b-2 px-3 py-2 text-sm font-semibold',
              tab === t.key ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]' : 'border-transparent text-[#555f6f] hover:bg-gray-50',
            )}
          >
            {t.label}
            {t.key === 'unassigned' && unassignedCount !== undefined ? (
              <span className="ml-1.5 text-xs font-bold">{unassignedCount}</span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tab === 'advisors' ? 'Search by advisor name or email...' : 'Search by student ID or name...'}
            aria-label="Search"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        {tab === 'advisors' && (
          <>
            <select value={majorFilter} onChange={(e) => onMajorChange(e.target.value)} aria-label="Filter by major" className={selectClass}>
              <option value="">Major: All</option>
              {majors.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={cohortFilter} onChange={(e) => onCohortChange(e.target.value)} aria-label="Filter by cohort" className={selectClass}>
              <option value="">Cohort: All</option>
              {advisorCohortOptions.map((c) => (
                <option key={c.cohortId} value={c.cohortId}>{c.majorCode} {c.cohort}</option>
              ))}
            </select>
          </>
        )}
        {tab === 'unassigned' && (
          <>
            <select value={cohortFilter} onChange={(e) => onCohortChange(e.target.value)} aria-label="Filter by cohort" className={selectClass}>
              <option value="">Cohort: All</option>
              {cohorts.map((c) => (
                <option key={c.cohortId} value={c.cohortId}>{c.majorCode} {c.cohort}</option>
              ))}
            </select>
            <label className="flex h-[38px] cursor-pointer items-center gap-2 text-sm font-medium text-[#151c27]">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => onPendingChange(e.target.checked)}
                className="size-4 accent-[#f37021]"
              />
              Requested an advisor
            </label>
          </>
        )}
        <button
          type="button"
          disabled={!hasFilter}
          onClick={onClear}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}
