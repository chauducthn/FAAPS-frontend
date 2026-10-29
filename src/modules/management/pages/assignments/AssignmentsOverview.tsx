import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Bell, Search, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AssignToAdvisorModal } from '../../components/AssignToAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import { LoadBadge } from '../../components/LoadBadge';
import { UserInitials } from '../../components/UserInitials';
import { backState } from '../../../../shared/lib/backLink';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Pagination } from '../../components/Pagination';
import {
  useAdvisorCohortRows,
  useAssignmentAdvisors,
  useAssignmentSummary,
  useAutoAssignStudents,
  useCohortPool,
  useUnassignedStudents,
} from '../../hooks/queries/useAdminAssignments';
import type { SummaryCohort, UnassignedStudent } from '../../types/admin';
import { cn } from '@/shared/lib/utils';
import { DataTable, type DataTableColumnDef } from '../../../../shared/components/common/DataTable';

const PAGE_SIZE = 10;
type Tab = 'cohorts' | 'advisors' | 'unassigned';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cohorts', label: 'Cohorts' },
  { key: 'advisors', label: 'Advisors' },
  { key: 'unassigned', label: 'Unassigned students' },
];
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';
const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

function StatCard({ label, value, tone, onClick }: { label: string; value?: number; tone?: 'warn'; onClick?: () => void }) {
  const body = (
    <>
      <p className="text-xs font-medium text-[#555f6f]">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tone === 'warn' && (value ?? 0) > 0 ? 'text-[#b45309]' : 'text-[#151c27]')}>{value ?? '–'}</p>
    </>
  );
  const cls = cn('rounded-xl bg-white p-4 text-left shadow-sm', onClick && 'hover:ring-2 hover:ring-orange-200');
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function TableState({ cols, loading, error, empty, onRetry }: { cols: number; loading: boolean; error: boolean; empty: string | null; onRetry: () => void }) {
  if (loading)
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
  const text = error ? (
    <>
      Could not load this list.{' '}
      <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
        Retry
      </button>
    </>
  ) : (
    empty
  );
  return (
    <tr className="border-t border-[#e7eefe]">
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-[#555f6f]">
        {text}
      </td>
    </tr>
  );
}

export default function AssignmentsOverview() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = TABS.some((t) => t.key === params.get('tab')) ? (params.get('tab') as Tab) : 'cohorts';
  const pendingOnly = params.get('pending') === '1';
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [page, setPage] = useState(0);

  const [assignCohortFor, setAssignCohortFor] = useState<{ cohortId?: string; advisorId?: string } | null>(null);
  const [autoFor, setAutoFor] = useState<SummaryCohort | null>(null);
  const [poolFor, setPoolFor] = useState<SummaryCohort | null>(null);
  // The students ticked in the unassigned table, handed to the bulk modal.
  const [bulkAssignStudents, setBulkAssignStudents] = useState<{ id: string; name: string }[] | null>(null);

  const summary = useAssignmentSummary();
  const advisors = useAssignmentAdvisors();
  const advisorRows = useAdvisorCohortRows();
  const autoAssign = useAutoAssignStudents();
  const debouncedSearch = useDebounce(search.trim());
  // The unassigned list is searched, filtered and paged by the server.
  const unassigned = useUnassignedStudents({
    search: tab === 'unassigned' ? debouncedSearch || undefined : undefined,
    cohortId: cohortFilter || undefined,
    hasPendingRequest: pendingOnly ? true : undefined,
    page,
    size: PAGE_SIZE,
  });
  const autoPool = useCohortPool(autoFor?.cohortId ?? poolFor?.cohortId);

  const cohorts = useMemo(() => summary.data?.cohorts ?? [], [summary.data]);
  const term = search.trim().toLowerCase();

  const setTab = (next: Tab, extra: Record<string, string> = {}) => {
    setParams(next === 'cohorts' && !Object.keys(extra).length ? {} : { tab: next, ...extra }, { replace: true });
    setSearch('');
    setCohortFilter('');
    setPage(0);
  };

  // Which advisors are configured for each cohort (for the Cohorts tab).
  const poolByCohort = useMemo(() => {
    const map = new Map<string, string[]>();
    (advisorRows.data ?? []).forEach((r) => {
      if (r.cohortId && r.inPool) map.set(r.cohortId, [...(map.get(r.cohortId) ?? []), r.fullName]);
    });
    return map;
  }, [advisorRows.data]);

  const cohortRows = cohorts.filter((c) => `${c.majorCode} ${c.cohort}`.toLowerCase().includes(term));

  // One row per advisor; cohort chips collect the advisor's students and configured cohorts.
  const advisorList = useMemo(() => {
    const map = new Map<string, { id: string; email: string; name: string; limit: number | null; chips: { key: string; text: string; inPool: boolean; students: number }[] }>();
    (advisorRows.data ?? []).forEach((r) => {
      const item = map.get(r.advisorId) ?? { id: r.advisorId, email: r.email, name: r.fullName, limit: r.maxAdvisees, chips: [] };
      if (r.cohortId) item.chips.push({ key: r.cohortId, text: `${r.majorCode} ${r.cohort}`, inPool: r.inPool, students: r.studentCount });
      map.set(r.advisorId, item);
    });
    return [...map.values()].filter((a) => a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term));
  }, [advisorRows.data, term]);
  const loadOf = (id: string) => advisors.data?.find((a) => a.id === id)?.activeStudents ?? 0;

  const unassignedRows = useMemo(() => unassigned.data?.items ?? [], [unassigned.data]);

  const total = tab === 'cohorts' ? cohortRows.length : tab === 'advisors' ? advisorList.length : unassigned.data?.totalElements ?? 0;
  const start = page * PAGE_SIZE;
  const pending = summary.data?.pendingAdvisorRequests;
  const hasFilter = !!search || !!cohortFilter || pendingOnly;

  const unassignedColumns = useMemo<DataTableColumnDef<UnassignedStudent>[]>(
    () => [
      {
        accessorKey: 'studentCode',
        header: 'Student ID',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-[#151c27]">{row.original.studentCode}</span>
        ),
      },
      {
        accessorKey: 'fullName',
        header: 'Full Name',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <UserInitials name={row.original.fullName} />
            <span className="truncate font-semibold text-[#151c27]">{row.original.fullName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'majorCode',
        header: 'Major',
        enableSorting: false,
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.majorCode}</span>,
      },
      {
        accessorKey: 'cohort',
        header: 'Cohort',
        enableSorting: false,
        cell: ({ row }) => <span className="text-[#555f6f]">{row.original.cohort}</span>,
      },
    ],
    [],
  );

  /** Auto assigns the students ticked in the table. */
  const runAutoAssign = async (studentIds: string[]) => {
    if (studentIds.length === 0) return;
    try {
      const res = await autoAssign.mutateAsync({ studentIds });
      toast.success(`${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned automatically.`);
    } catch {
      // The global API error handler already shows a toast.
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-xs text-[#555f6f]">Users &amp; Advisors / Advisor Assignments</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Advisor Assignments</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total students" value={summary.data?.total} />
        <StatCard label="Waiting for an advisor" value={pending} tone="warn" onClick={() => setTab('unassigned', { pending: '1' })} />
      </div>

      {(summary.data?.missingAcademicProfile ?? 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {summary.data?.missingAcademicProfile} student account(s) have no academic profile yet, so they do not appear in a cohort or assignment list. Complete their student details in{' '}
          <Link to="/admin/users?role=STUDENT" className="font-semibold underline">User Accounts</Link> before assigning an advisor.
        </div>
      )}

      {(pending ?? 0) > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-sm text-[#92400e]">
            <Bell className="size-4 shrink-0" />
            <span>
              <strong>{pending}</strong> student{pending === 1 ? ' has' : 's have'} asked for an advisor. Assign them one, or run Auto Assign for the cohort.
            </span>
          </p>
          <button type="button" onClick={() => setTab('unassigned', { pending: '1' })} className="rounded-lg bg-[#f37021] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#d95f15]">
            Review requests
          </button>
        </div>
      )}

      {summary.isError && !summary.data && (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load the summary.
          <button type="button" onClick={() => summary.refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div role="tablist" aria-label="Assignment view" className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn('rounded-md border-b-2 px-3 py-2 text-sm font-semibold', tab === t.key ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]' : 'border-transparent text-[#555f6f] hover:bg-gray-50')}
            >
              {t.label}
              {t.key === 'unassigned' && summary.data ? <span className="ml-1.5 text-xs font-bold">{summary.data.unassigned}</span> : null}
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
              placeholder={tab === 'cohorts' ? 'Search by major or cohort...' : tab === 'advisors' ? 'Search by advisor name or code...' : 'Search by student ID or name...'}
              aria-label="Search"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
          {tab === 'unassigned' && (
            <>
              <select
                value={cohortFilter}
                onChange={(e) => {
                  setCohortFilter(e.target.value);
                  setPage(0);
                }}
                aria-label="Filter by cohort"
                className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Cohort: All</option>
                {cohorts.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>
                    {c.majorCode} {c.cohort}
                  </option>
                ))}
              </select>
              <label className="flex h-[38px] cursor-pointer items-center gap-2 text-sm font-medium text-[#151c27]">
                <input
                  type="checkbox"
                  checked={pendingOnly}
                  onChange={(e) => {
                    setParams(e.target.checked ? { tab: 'unassigned', pending: '1' } : { tab: 'unassigned' }, { replace: true });
                    setPage(0);
                  }}
                  className="size-4 accent-[#f37021]"
                />
                Requested an advisor
              </label>
            </>
          )}
          <button
            type="button"
            disabled={!hasFilter}
            onClick={() => {
              setSearch('');
              setCohortFilter('');
              if (pendingOnly) setParams({ tab }, { replace: true });
              setPage(0);
            }}
            className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
          >
            Clear filters
          </button>
        </div>
      </section>

      {tab === 'unassigned' ? (
        <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <DataTable
            manual
            columns={unassignedColumns}
            data={unassignedRows}
            searchKey="fullName"
            showSearch={false}
            emptyText={hasFilter ? 'No students match your filters.' : 'Every student has an advisor.'}
            getRowId={(row) => row.id}
            isLoading={unassigned.isLoading}
            totalRowCount={unassigned.data?.totalElements ?? 0}
            pagination={{ pageIndex: page, pageSize: PAGE_SIZE }}
            onPaginationChange={(next) => setPage(next.pageIndex)}
            bulkActions={(selectedRows) => (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setBulkAssignStudents(selectedRows.map((s) => ({ id: s.id, name: s.fullName })))
                  }
                  className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]"
                >
                  Assign to Advisor
                </button>
                <button
                  type="button"
                  onClick={() => runAutoAssign(selectedRows.map((s) => s.id))}
                  disabled={autoAssign.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50 disabled:opacity-50"
                >
                  <WandSparkles className="size-4" aria-hidden />
                  {autoAssign.isPending ? 'Assigning...' : 'Auto Assign'}
                </button>
              </>
            )}
          />
        </section>
      ) : (
        <section className="rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            {tab === 'cohorts' && (
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-[rgba(240,243,255,0.7)]">
                  <tr>
                    <th className={th}>Major</th>
                    <th className={th}>Cohort</th>
                    <th className={th}>Total</th>
                    <th className={th}>Assigned</th>
                    <th className={th}>Unassigned</th>
                    <th className={th}>Advisors</th>
                    <th className={cn(th, 'text-right')}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.isLoading || (summary.isError && !summary.data) || cohortRows.length === 0 ? (
                    <TableState cols={7} loading={summary.isLoading} error={summary.isError && !summary.data} empty={search ? 'No cohorts match your search.' : 'No cohorts yet.'} onRetry={() => summary.refetch()} />
                  ) : (
                    cohortRows.slice(start, start + PAGE_SIZE).map((c) => (
                      <tr key={c.cohortId} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                        <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{c.majorCode}</td>
                        <td className="px-3 py-4 text-sm font-semibold">
                          <Link to={`/admin/assignments/cohorts/${c.cohortId}`} className="text-[#f37021] hover:underline">
                            {c.cohort}
                          </Link>
                        </td>
                        <td className="px-3 py-4 text-sm text-[#151c27]">{c.total}</td>
                        <td className="px-3 py-4 text-sm text-[#151c27]">{c.assigned}</td>
                        <td className="px-3 py-4 text-sm">
                          <span className={c.unassigned > 0 ? 'font-semibold text-[#b45309]' : 'text-[#151c27]'}>{c.unassigned}</span>
                        </td>
                        <td className="max-w-[220px] px-3 py-4 text-[13px] text-[#555f6f]">{poolByCohort.get(c.cohortId)?.join(', ') ?? <span className="text-[#98a2b3]">Not configured</span>}</td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {c.unassigned > 0 ? (
                              <>
                                <button type="button" className={btn} onClick={() => setAssignCohortFor({ cohortId: c.cohortId })}>Assign advisor</button>
                                <button type="button" className={btn} onClick={() => setAutoFor(c)}>Auto assign</button>
                              </>
                            ) : (
                              <Link to={`/admin/assignments/cohorts/${c.cohortId}`} className={btn}>Reassign / unassign</Link>
                            )}
                            <Link to={`/admin/assignments/cohorts/${c.cohortId}`} className={btn}>
                              Manage
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {tab === 'advisors' && (
              <table className="w-full min-w-[780px] text-left">
                <thead className="bg-[rgba(240,243,255,0.7)]">
                  <tr>
                    <th className={th}>Advisor</th>
                    <th className={th}>Students / limit</th>
                    <th className={th}>Cohorts</th>
                    <th className={cn(th, 'text-right')}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {advisorRows.isLoading || (advisorRows.isError && !advisorRows.data) || advisorList.length === 0 ? (
                    <TableState cols={4} loading={advisorRows.isLoading} error={advisorRows.isError && !advisorRows.data} empty={search ? 'No advisors match your search.' : 'No active advisors.'} onRetry={() => advisorRows.refetch()} />
                  ) : (
                    advisorList.slice(start, start + PAGE_SIZE).map((a) => (
                      <tr key={a.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                        <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">
                          {a.name}
                          <span className="block text-xs font-normal text-[#555f6f]">{a.email}</span>
                        </td>
                        <td className="px-3 py-4">
                          <LoadBadge count={loadOf(a.id)} limit={a.limit} />
                        </td>
                        <td className="px-3 py-4">
                          {a.chips.length === 0 ? (
                            <span className="text-[13px] text-[#98a2b3]">No cohort yet</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {a.chips.map((c) => (
                                <span key={c.key} className={cn('rounded-full px-2 py-0.5 text-xs font-medium', c.students > 0 ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'bg-gray-100 text-[#555f6f]')} title={c.inPool ? 'Configured for this cohort' : 'Has students, not in the cohort advisor list'}>
                                  {c.text} · {c.students}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex justify-end gap-2">
                            <button type="button" className={btn} onClick={() => setAssignCohortFor({ advisorId: a.id })}>
                              Assign cohort
                            </button>
                            <Link to={`/admin/assignments/advisors/${a.id}`} state={backState('/admin/assignments?tab=advisors', 'Advisor Assignments · Advisors tab')} className={btn}>
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun={tab === 'cohorts' ? 'cohorts' : 'advisors'} onChange={setPage} />
        </section>
      )}

      <CohortAssignModal open={!!assignCohortFor} onClose={() => setAssignCohortFor(null)} cohorts={cohorts} advisors={advisors.data ?? []} fixedCohortId={assignCohortFor?.cohortId} fixedAdvisorId={assignCohortFor?.advisorId} />
      <AutoAssignModal
        open={!!autoFor}
        cohort={autoFor}
        pool={autoPool.data ?? []}
        onClose={() => setAutoFor(null)}
        onConfigurePool={() => {
          setPoolFor(autoFor);
          setAutoFor(null);
        }}
      />
      <CohortPoolModal open={!!poolFor} cohort={poolFor} advisors={advisors.data ?? []} currentIds={(autoPool.data ?? []).map((a) => a.advisorId)} onClose={() => setPoolFor(null)} />

      <AssignToAdvisorModal
        open={!!bulkAssignStudents}
        onClose={() => setBulkAssignStudents(null)}
        students={bulkAssignStudents ?? []}
        advisors={advisors.data ?? []}
      />
    </div>
  );
}
