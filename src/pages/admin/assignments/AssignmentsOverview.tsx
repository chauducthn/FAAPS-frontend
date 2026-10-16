import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Pagination } from '../../../components/admin/Pagination';
import { useAssignmentCohorts, useCohortStudentLists } from '../../../hooks/queries/useAdminAssignments';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

export default function AssignmentsOverview() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const cohortsQuery = useAssignmentCohorts();
  const cohorts = useMemo(() => cohortsQuery.data ?? [], [cohortsQuery.data]);
  const studentLists = useCohortStudentLists(cohorts.map((c) => c.cohort));

  const term = search.trim().toLowerCase();
  const rows = useMemo(
    () =>
      cohorts
        .map((c, i) => {
          const students = studentLists[i]?.data;
          const assigned = students ? students.filter((s) => s.advisorId).length : undefined;
          return { ...c, assigned, unassigned: assigned === undefined ? undefined : c.students - assigned };
        })
        .filter((c) => c.cohort.toLowerCase().includes(term)),
    [cohorts, studentLists, term]
  );

  const pageStart = page * PAGE_SIZE;
  const showError = cohortsQuery.isError && !cohortsQuery.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs text-[#555f6f]">Users &amp; Advisors / Advisor Assignments</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advisor Assignments</h1>
      </div>

      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by cohort code..."
            aria-label="Search cohorts"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        <button
          type="button"
          disabled={!search}
          onClick={() => {
            setSearch('');
            setPage(0);
          }}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className={th}>Cohort code</th>
                <th className={th}>Total students</th>
                <th className={th}>Assigned students</th>
                <th className={th}>Unassigned students</th>
                <th className={cn(th, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cohortsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={5} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : showError ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load cohorts.{' '}
                    <button type="button" onClick={() => cohortsQuery.refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {search ? 'No cohorts match your search.' : 'No cohorts yet.'}
                  </td>
                </tr>
              ) : (
                rows.slice(pageStart, pageStart + PAGE_SIZE).map((c) => (
                  <tr key={c.cohort} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                    <td className="px-3 py-4 text-sm font-semibold">
                      <Link to={`/admin/assignments/cohorts/${encodeURIComponent(c.cohort)}`} className="text-[#f37021] hover:underline">
                        {c.cohort}
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm text-[#151c27]">{c.students}</td>
                    <td className="px-3 py-4 text-sm text-[#151c27]">{c.assigned ?? '–'}</td>
                    <td className="px-3 py-4 text-sm text-[#151c27]">
                      {c.unassigned === undefined ? '–' : (
                        <span className={c.unassigned > 0 ? 'font-semibold text-[#b45309]' : ''}>{c.unassigned}</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Link
                        to={`/admin/assignments/cohorts/${encodeURIComponent(c.cohort)}`}
                        className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} noun="cohorts" onChange={setPage} />
      </section>
    </div>
  );
}
