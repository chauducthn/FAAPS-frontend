import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { LoadBadge } from '../../components/LoadBadge';
import { backState } from '../../../../shared/lib/backLink';

export function CohortStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#151c27]">{value}</p>
    </div>
  );
}

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
    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold text-[#151c27]">Advisors of this cohort</h2>
      {isLoading ? (
        <div className="mt-3 h-10 animate-pulse rounded bg-gray-100" />
      ) : pool.length === 0 ? (
        <p className="mt-3 text-sm text-[#555f6f]">
          No advisor is configured yet. Choose them with <strong>Configure advisors</strong>; Auto Assign distributes only among these advisors.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {pool.map((a) => (
            <li key={a.advisorId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
              <Link
                to={`/admin/assignments/advisors/${a.advisorId}`}
                state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)}
                className="font-semibold text-[#151c27] hover:text-orange-600"
              >
                {a.fullName} <span className="font-normal text-[#555f6f]">· {a.email}</span>
              </Link>
              <span className="flex items-center gap-3 text-[#555f6f]">
                {a.cohortStudents} in this cohort
                <LoadBadge count={advisors.find((x) => x.id === a.advisorId)?.activeStudents ?? 0} limit={a.maxAdvisees} />
              </span>
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
    <div>
      <h2 className="mb-3 text-base font-semibold text-[#151c27]">Students</h2>
      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student ID or full name..."
            aria-label="Search students"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        <select
          value={unassignedOnly ? 'UNASSIGNED' : 'ALL'}
          disabled={pendingOnly}
          onChange={(e) => onUnassignedChange(e.target.value === 'UNASSIGNED')}
          aria-label="Filter by assignment status"
          className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-[#f7f8fa]"
        >
          <option value="ALL">Assignment status: All</option>
          <option value="UNASSIGNED">Assignment status: Unassigned</option>
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
        <button
          type="button"
          disabled={!hasFilters}
          onClick={onClear}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </section>
    </div>
  );
}
