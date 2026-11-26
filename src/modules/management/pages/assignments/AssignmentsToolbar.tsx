import { CaretDown as ChevronDown, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, UserCheck, UserMinus as UserX, Users, MagicWand as WandSparkles, X } from '@phosphor-icons/react';
import type { AssignmentAdvisor, SummaryCohort } from '../../types/admin';
import { cn } from '@/shared/lib/utils';

export type AssignmentTab = 'advisors' | 'assigned' | 'unassigned';

export const ASSIGNMENT_TABS: { key: AssignmentTab; label: string; icon: typeof Users }[] = [
  { key: 'advisors', label: 'Advisors', icon: Users },
  { key: 'assigned', label: 'Assigned students', icon: UserCheck },
  { key: 'unassigned', label: 'Unassigned students', icon: UserX },
];

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';

export function AssignmentsTabBar(props: {
  tab: AssignmentTab; assignedCount?: number; unassignedCount?: number;
  showAutoAssign?: boolean; onTabChange: (tab: AssignmentTab) => void; onAutoAssign?: () => void;
}) {
  const { tab, assignedCount, unassignedCount, showAutoAssign, onTabChange, onAutoAssign } = props;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Assignment view"
        className="inline-flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs"
      >
        {ASSIGNMENT_TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const badgeCount = key === 'assigned' ? assignedCount : key === 'unassigned' ? unassignedCount : undefined;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(key)}
              className={cn(
                'inline-flex h-8.5 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors',
                active
                  ? 'bg-[#F26F21] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
              {badgeCount !== undefined ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.25 text-[11px] font-semibold tabular-nums',
                    active
                      ? 'bg-white/20 text-white'
                      : key === 'unassigned' && badgeCount > 0
                        ? 'bg-orange-100 text-[#C2410C]'
                        : key === 'assigned' && badgeCount > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {showAutoAssign && onAutoAssign && (
        <button
          type="button"
          onClick={onAutoAssign}
          title="Automatically distribute unassigned students across each cohort's advisor pool"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14]"
        >
          <WandSparkles className="size-4" aria-hidden />
          Auto assign
        </button>
      )}
    </div>
  );
}

export function AssignmentsFilterBar(props: {
  tab: AssignmentTab, search: string, advisorFilter: string, majorFilter: string, cohortFilter: string,
  pendingOnly: boolean, advisors: AssignmentAdvisor[], majors: string[], cohorts: SummaryCohort[],
  advisorCohortOptions: SummaryCohort[], hasFilter: boolean, onSearchChange: (val: string) => void,
  onAdvisorChange: (val: string) => void, onMajorChange: (val: string) => void, onCohortChange: (val: string) => void,
  onPendingChange: (checked: boolean) => void, onClear: () => void,
}) {
  const { tab, search, advisorFilter, majorFilter, cohortFilter, pendingOnly, advisors, majors, cohorts, advisorCohortOptions, hasFilter, onSearchChange, onAdvisorChange, onMajorChange, onCohortChange, onPendingChange, onClear } = props;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            tab === 'advisors'
              ? 'Search by advisor name or email...'
              : tab === 'assigned'
                ? 'Search by student ID, name, or advisor...'
                : 'Search by student ID or name...'
          }
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

      {tab === 'assigned' && (
        <div className="relative w-full shrink-0 sm:w-[210px]">
          <select value={advisorFilter} onChange={(e) => onAdvisorChange(e.target.value)} aria-label="Filter by advisor" className={selectClass}>
            <option value="">All advisors</option>
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} ({a.activeStudents})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      )}

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
          {(majorFilter ? advisorCohortOptions : cohorts).map((c) => {
            const countSuffix =
              tab === 'unassigned' ? ` (${c.unassigned})` : tab === 'assigned' ? ` (${c.assigned})` : '';
            return (
              <option key={c.cohortId} value={c.cohortId}>
                {majorFilter ? `${c.cohort}${countSuffix}` : `${c.cohort} · ${c.majorCode}${countSuffix}`}
              </option>
            );
          })}
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
