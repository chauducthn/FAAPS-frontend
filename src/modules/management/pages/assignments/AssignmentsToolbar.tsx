import { CaretDown as ChevronDown, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, UserCheck, UserMinus as UserX, Users, MagicWand as WandSparkles, X } from '@phosphor-icons/react';
import { ADMIN_TAB_ACTIVE_COUNT_CLASS, ADMIN_TAB_LIST_CLASS, adminTabClass } from '../../components/AdminTabBar';
import type { AssignmentAdvisor, SummaryCohort } from '../../types/admin';
import { cn } from '@/shared/lib/utils';

export type AssignmentTab = 'advisors' | 'assigned' | 'unassigned';
export const UNASSIGNED_FILTER = '__NONE__';

export const ASSIGNMENT_TABS: { key: AssignmentTab; label: string; icon: typeof Users }[] = [
  { key: 'advisors', label: 'Advisors', icon: Users },
  { key: 'assigned', label: 'Assigned students', icon: UserCheck },
  { key: 'unassigned', label: 'Unassigned students', icon: UserX },
];

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-line bg-white pl-3 pr-7 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

export function AssignmentsTabBar(props: {
  tab: AssignmentTab; assignedCount?: number; unassignedCount?: number;
  canAutoAssign?: boolean; onTabChange: (tab: AssignmentTab) => void; onAutoAssign?: () => void;
}) {
  const { tab, assignedCount, unassignedCount, canAutoAssign = false, onTabChange, onAutoAssign } = props;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Assignment view"
        className={ADMIN_TAB_LIST_CLASS}
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
              className={adminTabClass(active)}
            >
              <Icon className="size-4" aria-hidden />
              {label}
              {badgeCount !== undefined ? (
                <span
                  className={cn(
                    'rounded-sm px-1.5 py-px text-[11px] font-semibold tabular-nums',
                    active
                      ? ADMIN_TAB_ACTIVE_COUNT_CLASS
                      : key === 'unassigned' && badgeCount > 0
                        ? 'bg-brand-soft-strong text-brand-ink'
                        : key === 'assigned' && badgeCount > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-line-soft text-ink-muted',
                  )}
                >
                  {badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {onAutoAssign && (
        <button
          type="button"
          onClick={onAutoAssign}
          disabled={!canAutoAssign}
          title={
            canAutoAssign
              ? "Automatically distribute unassigned students across each cohort's advisor pool"
              : 'No unassigned students waiting in any cohort'
          }
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45"
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
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
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
          className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-7 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
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
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>
      )}

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]">
        <select value={majorFilter} onChange={(e) => onMajorChange(e.target.value)} aria-label="Filter by major" className={selectClass}>
          <option value="">All majors</option>
          {tab === 'advisors' && <option value={UNASSIGNED_FILTER}>No major</option>}
          {majors.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[146px]">
        <select value={cohortFilter} onChange={(e) => onCohortChange(e.target.value)} aria-label="Filter by cohort" className={selectClass}>
          <option value="">All cohorts</option>
          {tab === 'advisors' && <option value={UNASSIGNED_FILTER}>No cohort</option>}
          {[...new Set((majorFilter ? advisorCohortOptions : cohorts).map((c) => c.cohort.trim().toUpperCase()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((cohort) => <option key={cohort} value={cohort}>{cohort}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      {tab === 'unassigned' && (
        <label
          className={cn(
            'inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors',
            pendingOnly
              ? 'border-brand/50 bg-brand-soft/70 text-brand-ink'
              : 'border-line bg-white text-ink-secondary hover:border-ink-subtle/50',
          )}
        >
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => onPendingChange(e.target.checked)}
            className="size-3.5 accent-brand"
          />
          Requested an advisor
        </label>
      )}

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilter}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
