import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AssignToAdvisorModal } from '../../components/AssignToAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortPickerModal } from '../../components/CohortPickerModal';
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
type Tab = 'advisors' | 'unassigned';
const TABS: { key: Tab; label: string }[] = [
  { key: 'advisors', label: 'Advisors' },
  { key: 'unassigned', label: 'Unassigned students' },
];
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';
const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

function StatCard({ label, value, sub, tone, action }: { label: string; value?: number; sub?: string; tone?: 'warn'; action?: React.ReactNode }) {
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
  const tab: Tab = TABS.some((t) => t.key === params.get('tab')) ? (params.get('tab') as Tab) : 'advisors';
  const pendingOnly = params.get('pending') === '1';
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [page, setPage] = useState(0);

  const [assignCohortFor, setAssignCohortFor] = useState<{ cohortId?: string; advisorId?: string } | null>(null);
  const [autoFor, setAutoFor] = useState<SummaryCohort | null>(null);
  const [poolFor, setPoolFor] = useState<SummaryCohort | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
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
  const waitingCohorts = cohorts.filter((c) => c.unassigned > 0).length;
  const term = search.trim().toLowerCase();

  const setTab = (next: Tab, extra: Record<string, string> = {}) => {
    setParams(next === 'advisors' && !Object.keys(extra).length ? {} : { tab: next, ...extra }, { replace: true });
    setSearch('');
    setCohortFilter('');
    setMajorFilter('');
    setPage(0);
  };

  const majors = useMemo(() => [...new Set(cohorts.map((c) => c.majorCode))].sort(), [cohorts]);
  // The cohort dropdown of the Advisors tab follows the chosen major.
  const advisorCohortOptions = majorFilter ? cohorts.filter((c) => c.majorCode === majorFilter) : cohorts;

  // One row per advisor; cohort chips collect the advisor's students and configured cohorts.
  const advisorList = useMemo(() => {
    const map = new Map<string, { id: string; email: string; name: string; limit: number | null; chips: { key: string; majorCode: string; text: string; inPool: boolean; students: number }[] }>();
    (advisorRows.data ?? []).forEach((r) => {
      const item = map.get(r.advisorId) ?? { id: r.advisorId, email: r.email, name: r.fullName, limit: r.maxAdvisees, chips: [] };
      if (r.cohortId) item.chips.push({ key: r.cohortId, majorCode: r.majorCode ?? '', text: `${r.majorCode} ${r.cohort}`, inPool: r.inPool, students: r.studentCount });
      map.set(r.advisorId, item);
    });
    return [...map.values()].filter(
      (a) =>
        (a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term)) &&
        (!majorFilter || a.chips.some((c) => c.majorCode === majorFilter)) &&
        (!cohortFilter || a.chips.some((c) => c.key === cohortFilter)),
    );
  }, [advisorRows.data, term, majorFilter, cohortFilter]);
  const loadOf = (id: string) => advisors.data?.find((a) => a.id === id)?.activeStudents ?? 0;

  const unassignedRows = useMemo(() => unassigned.data?.items ?? [], [unassigned.data]);

  const start = page * PAGE_SIZE;
  const pending = summary.data?.pendingAdvisorRequests;
  const hasFilter = !!search || !!cohortFilter || !!majorFilter || pendingOnly;
  const selectClass =
    'h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

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
  const runAutoAssign = async (students: Pick<UnassignedStudent, 'id' | 'cohortId'>[]) => {
    if (students.length === 0) return;
    try {
      const res = await autoAssign.mutateAsync({ students });
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total students" value={summary.data?.total} />
        <StatCard
          label="Unassigned"
          value={summary.data?.unassigned}
          sub={waitingCohorts > 0 ? `in ${waitingCohorts} cohort${waitingCohorts === 1 ? '' : 's'}` : undefined}
          tone="warn"
          action={
            waitingCohorts > 0 && (
              <button type="button" className={cn(btn, 'inline-flex shrink-0 items-center gap-1.5')} onClick={() => setPickerOpen(true)}>
                <WandSparkles className="size-4" aria-hidden />
                Auto assign
              </button>
            )
          }
        />
        <StatCard
          label="Waiting for an advisor"
          value={pending}
          tone="warn"
          action={
            (pending ?? 0) > 0 && (
              <button type="button" onClick={() => setTab('unassigned', { pending: '1' })} className="shrink-0 rounded-lg bg-[#f37021] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#d95f15]">
                Review requests
              </button>
            )
          }
        />
      </div>

      {(summary.data?.missingAcademicProfile ?? 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {summary.data?.missingAcademicProfile} student account(s) have no academic profile yet, so they do not appear in a cohort or assignment list. Complete their student details in{' '}
          <Link to="/admin/users?role=STUDENT" className="font-semibold underline">User Accounts</Link> before assigning an advisor.
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
              placeholder={tab === 'advisors' ? 'Search by advisor name or email...' : 'Search by student ID or name...'}
              aria-label="Search"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
          {tab === 'advisors' && (
            <>
              <select
                value={majorFilter}
                onChange={(e) => {
                  setMajorFilter(e.target.value);
                  setCohortFilter('');
                  setPage(0);
                }}
                aria-label="Filter by major"
                className={selectClass}
              >
                <option value="">Major: All</option>
                {majors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={cohortFilter}
                onChange={(e) => {
                  setCohortFilter(e.target.value);
                  setPage(0);
                }}
                aria-label="Filter by cohort"
                className={selectClass}
              >
                <option value="">Cohort: All</option>
                {advisorCohortOptions.map((c) => (
                  <option key={c.cohortId} value={c.cohortId}>
                    {c.majorCode} {c.cohort}
                  </option>
                ))}
              </select>
            </>
          )}
          {tab === 'unassigned' && (
            <>
              <select
                value={cohortFilter}
                onChange={(e) => {
                  setCohortFilter(e.target.value);
                  setPage(0);
                }}
                aria-label="Filter by cohort"
                className={selectClass}
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
              setMajorFilter('');
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
                  onClick={() => runAutoAssign(selectedRows)}
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
                    <TableState cols={4} loading={advisorRows.isLoading} error={advisorRows.isError && !advisorRows.data} empty={hasFilter ? 'No advisors match your filters.' : 'No active advisors.'} onRetry={() => advisorRows.refetch()} />
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
                              Details &amp; history
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
          <Pagination page={page} pageSize={PAGE_SIZE} total={advisorList.length} noun="advisors" onChange={setPage} />
        </section>
      )}

      <CohortAssignModal open={!!assignCohortFor} onClose={() => setAssignCohortFor(null)} cohorts={cohorts} advisors={advisors.data ?? []} fixedCohortId={assignCohortFor?.cohortId} fixedAdvisorId={assignCohortFor?.advisorId} />
      <CohortPickerModal
        open={pickerOpen}
        cohorts={cohorts}
        onClose={() => setPickerOpen(false)}
        onPick={(c) => {
          setPickerOpen(false);
          setAutoFor(c);
        }}
      />
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
