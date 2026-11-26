import { Link } from 'react-router';
import { CaretDown as ChevronDown, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import { LoadBadge } from '../../components/LoadBadge';
import { UserInitials } from '../../components/UserInitials';
import { backState } from '../../../../shared/lib/backLink';

export function CohortPoolSection({
  cohortId,
  title,
  isLoading,
  pool,
  advisors,
}: {
  cohortId: string;
  title: string;
  isLoading: boolean;
  pool: { advisorId: string; fullName: string; email: string; cohortStudents: number; maxAdvisees: number | null }[];
  advisors: { id: string; activeStudents: number }[];
}) {
  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Advisors of this cohort</h2>
        <span className="text-xs text-gray-400 tabular-nums">{pool.length} configured</span>
      </div>
      {isLoading ? (
        <div className="mt-3 h-10 animate-pulse rounded-lg bg-gray-100" />
      ) : pool.length === 0 ? (
        <p className="mt-2.5 text-xs text-gray-500">
          No advisor is configured yet. Choose them with <strong className="text-gray-700">Configure advisors</strong>; Auto Assign distributes only among these advisors.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {pool.map((a) => (
            <li
              key={a.advisorId}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5 text-xs"
            >
              <Link
                to={`/admin/assignments/advisors/${a.advisorId}`}
                state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)}
                className="flex min-w-0 items-center gap-2.5 hover:text-[#F26F21]"
              >
                <UserInitials name={a.fullName} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-gray-900">{a.fullName}</span>
                  <span className="block truncate text-[11px] text-gray-500">{a.email}</span>
                </span>
              </Link>
              <div className="flex shrink-0 items-center gap-2 text-gray-500">
                <span className="tabular-nums">{a.cohortStudents} here</span>
                <LoadBadge count={advisors.find((x) => x.id === a.advisorId)?.activeStudents ?? 0} limit={a.maxAdvisees} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CohortStudentsFilterBar({
  search,
  unassignedOnly,
  pendingOnly,
  hasFilters,
  onSearchChange,
  onUnassignedChange,
  onPendingChange,
  onClear,
}: {
  search: string;
  unassignedOnly: boolean;
  pendingOnly: boolean;
  hasFilters: boolean;
  onSearchChange: (val: string) => void;
  onUnassignedChange: (val: boolean) => void;
  onPendingChange: (val: boolean) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
      <div className="relative min-w-[220px] flex-1">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by student ID or full name..."
          aria-label="Search students"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
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

      <div className="relative">
        <select
          value={unassignedOnly ? 'UNASSIGNED' : 'ALL'}
          disabled={pendingOnly}
          onChange={(e) => onUnassignedChange(e.target.value === 'UNASSIGNED')}
          aria-label="Filter by assignment status"
          className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15 disabled:bg-gray-50 disabled:opacity-60"
        >
          <option value="ALL">Status: All</option>
          <option value="UNASSIGNED">Status: Unassigned</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300">
        <input
          type="checkbox"
          checked={pendingOnly}
          onChange={(e) => onPendingChange(e.target.checked)}
          className="size-3.5 accent-[#F26F21]"
        />
        Requested an advisor
      </label>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-dashed border-gray-300 bg-white px-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      )}
    </div>
  );
}
