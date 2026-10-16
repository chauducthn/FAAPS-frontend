import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Pagination } from '../../../components/admin/Pagination';
import {
  useAssignmentAdvisors,
  useAssignmentCohorts,
  useCohortStudentLists,
} from '../../../hooks/queries/useAdminAssignments';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;
type Tab = 'cohorts' | 'advisors';

const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

export default function AssignmentsOverview() {
  const [tab, setTab] = useState<Tab>('cohorts');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const cohortsQuery = useAssignmentCohorts();
  const advisorsQuery = useAssignmentAdvisors();
  const cohorts = useMemo(() => cohortsQuery.data ?? [], [cohortsQuery.data]);
  const studentLists = useCohortStudentLists(cohorts.map((c) => c.cohort));

  const term = search.trim().toLowerCase();

  const cohortRows = useMemo(
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

  const advisorRows = useMemo(
    () =>
      (advisorsQuery.data ?? []).filter(
        (a) => a.fullName.toLowerCase().includes(term) || a.advisorCode.toLowerCase().includes(term)
      ),
    [advisorsQuery.data, term]
  );

  const query = tab === 'cohorts' ? cohortsQuery : advisorsQuery;
  const rowCount = tab === 'cohorts' ? cohortRows.length : advisorRows.length;
  const pageStart = page * PAGE_SIZE;

  const switchTab = (next: Tab) => {
    setTab(next);
    setSearch('');
    setPage(0);
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs text-[#555f6f]">Users &amp; Advisors / Advisor Assignments</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advisor Assignments</h1>
      </div>

      <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div role="tablist" aria-label="Assignment view" className="flex gap-1">
          {(
            [
              ['cohorts', 'Cohorts'],
              ['advisors', 'Advisors'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => switchTab(key)}
              className={cn(
                'rounded-md border-b-2 px-3 py-2 text-sm font-semibold',
                tab === key ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]' : 'border-transparent text-[#555f6f] hover:bg-gray-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
            <Search className="size-4 text-[#98a2b3]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder={tab === 'cohorts' ? 'Search by cohort code...' : 'Search by advisor name or code...'}
              aria-label="Search"
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
        </div>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          {tab === 'cohorts' ? (
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
                {query.isLoading ? (
                  <LoadingRows cols={5} />
                ) : query.isError ? (
                  <ErrorRow cols={5} noun="cohorts" onRetry={() => query.refetch()} />
                ) : cohortRows.length === 0 ? (
                  <EmptyRow cols={5} text={search ? 'No cohorts match your search.' : 'No cohorts yet.'} />
                ) : (
                  cohortRows.slice(pageStart, pageStart + PAGE_SIZE).map((c) => (
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
          ) : (
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-[rgba(240,243,255,0.7)]">
                <tr>
                  <th className={th}>Advisor ID</th>
                  <th className={th}>Name</th>
                  <th className={th}>Assigned students</th>
                  <th className={th}>Capacity</th>
                  <th className={cn(th, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.isLoading ? (
                  <LoadingRows cols={5} />
                ) : query.isError ? (
                  <ErrorRow cols={5} noun="advisors" onRetry={() => query.refetch()} />
                ) : advisorRows.length === 0 ? (
                  <EmptyRow cols={5} text={search ? 'No advisors match your search.' : 'No active advisors.'} />
                ) : (
                  advisorRows.slice(pageStart, pageStart + PAGE_SIZE).map((a) => {
                    const full = a.maxAdvisees !== null && a.activeStudents >= a.maxAdvisees;
                    return (
                      <tr key={a.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                        <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]">{a.advisorCode}</td>
                        <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{a.fullName}</td>
                        <td className="px-3 py-4 text-sm text-[#151c27]">{a.activeStudents}</td>
                        <td className="px-3 py-4 text-sm text-[#151c27]">
                          {a.maxAdvisees === null ? 'No limit' : (
                            <span className={full ? 'font-semibold text-[#b91c1c]' : ''}>
                              {a.activeStudents} / {a.maxAdvisees}
                              {full ? ' (full)' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-right">
                          <Link
                            to={`/admin/assignments/advisors/${a.id}`}
                            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                          >
                            View details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={rowCount}
          noun={tab === 'cohorts' ? 'cohorts' : 'advisors'}
          onChange={setPage}
        />
      </section>
    </div>
  );
}

function LoadingRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-t border-[#e7eefe]">
          <td colSpan={cols} className="px-4 py-5">
            <div className="h-4 animate-pulse rounded bg-gray-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function ErrorRow({ cols, noun, onRetry }: { cols: number; noun: string; onRetry: () => void }) {
  return (
    <tr className="border-t border-[#e7eefe]">
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-[#555f6f]">
        Could not load {noun}.{' '}
        <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
          Retry
        </button>
      </td>
    </tr>
  );
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr className="border-t border-[#e7eefe]">
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-[#555f6f]">
        {text}
      </td>
    </tr>
  );
}
