import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, Search, Settings2, Sparkles } from 'lucide-react';
import { AssignAdvisorModal } from '../../components/AssignAdvisorModal';
import { UnassignAdvisorModal } from '../../components/UnassignAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import { LoadBadge } from '../../components/LoadBadge';
import { Pagination } from '../../components/Pagination';
import {
  useAssignmentAdvisors,
  useAssignmentSummary,
  useCohortPool,
  useCohortStudents,
  useUnassignedStudents,
} from '../../hooks/queries/useAdminAssignments';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { backState } from '../../../../shared/lib/backLink';
import { cn } from '@/shared/lib/utils';

const PAGE_SIZE = 10;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';
const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

interface Row {
  id: string;
  studentCode: string;
  fullName: string;
  advisorName: string | null;
  assignedDate: string | null;
  hasPendingRequest: boolean;
}

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#151c27]">{value}</p>
    </div>
  );
}

export default function CohortDetails() {
  const { cohortId = '' } = useParams();
  const summary = useAssignmentSummary();
  const pool = useCohortPool(cohortId);
  const advisors = useAssignmentAdvisors();

  const [search, setSearch] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [assignStudents, setAssignStudents] = useState<{ id: string; name: string }[] | null>(null);
  const [unassignStudents, setUnassignStudents] = useState<{ id: string; name: string }[] | null>(null);

  const debouncedSearch = useDebounce(search.trim());
  // All students of the cohort (assigned and unassigned), searched and paged by the server.
  const students = useCohortStudents({
    cohortId: pendingOnly ? undefined : cohortId,
    search: debouncedSearch || undefined,
    unassignedOnly,
    page,
    size: PAGE_SIZE,
  });
  // Students who asked for an advisor: used for the "Requested" badge, or as the list itself when filtered.
  const requested = useUnassignedStudents({
    cohortId,
    hasPendingRequest: true,
    search: pendingOnly ? debouncedSearch || undefined : undefined,
    page: pendingOnly ? page : 0,
    size: pendingOnly ? PAGE_SIZE : 100,
  });

  const cohort = summary.data?.cohorts.find((c) => c.cohortId === cohortId) ?? null;
  const title = cohort ? `${cohort.majorCode} ${cohort.cohort}` : 'Cohort';

  const requestedIds = useMemo(() => new Set((requested.data?.items ?? []).map((s) => s.id)), [requested.data]);
  const rows: Row[] = useMemo(
    () =>
      pendingOnly
        ? (requested.data?.items ?? []).map((s) => ({ id: s.id, studentCode: s.studentCode, fullName: s.fullName, advisorName: null, assignedDate: null, hasPendingRequest: true }))
        : (students.data?.items ?? []).map((s) => ({
            id: s.id,
            studentCode: s.studentCode,
            fullName: s.fullName,
            advisorName: s.advisorName,
            assignedDate: s.assignedDate,
            hasPendingRequest: requestedIds.has(s.id),
          })),
    [pendingOnly, requested.data, students.data, requestedIds]
  );
  const active = pendingOnly ? requested : students;
  const total = active.data?.totalElements ?? 0;
  const pageIds = rows.map((s) => s.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  useEffect(() => setSelected(new Set()), [debouncedSearch, unassignedOnly, pendingOnly, page, cohortId]);

  const toggleOne = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((cur) => {
      const next = new Set(cur);
      pageIds.forEach((id) => (allPageSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  const selectedStudents = rows.filter((s) => selected.has(s.id)).map((s) => ({ id: s.id, name: s.fullName }));
  const hasFilters = !!search || unassignedOnly || pendingOnly;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <Link to="/admin/assignments" className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
          <ChevronLeft className="size-4" />
          Back to Advisor Assignments
        </Link>
        <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold text-[#151c27]">Cohort Assignment Details — {title}</h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPoolOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50">
              <Settings2 className="size-4" />
              Configure advisors
            </button>
            {(cohort?.unassigned ?? 0) > 0 ? (
              <>
                <button type="button" onClick={() => setAssignOpen(true)} className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50">Assign advisor</button>
                <button type="button" onClick={() => setAutoOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]">
                  <Sparkles className="size-4" /> Auto Assign
                </button>
              </>
            ) : (
              <span className="text-sm text-[#555f6f]">All students are assigned. Use Reassign or Unassign in the student list below.</span>
            )}
          </div>
        </div>
      </div>

      {summary.isSuccess && !cohort && <div className="rounded-xl bg-white p-8 text-center text-sm text-[#555f6f]">This cohort does not exist.</div>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cohort" value={title} />
        <Stat label="Total students" value={cohort?.total ?? '–'} />
        <Stat label="With an advisor" value={cohort?.assigned ?? '–'} />
        <Stat label="Without an advisor" value={cohort?.unassigned ?? '–'} />
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-[#151c27]">Advisors of this cohort</h2>
        {pool.isLoading ? (
          <div className="mt-3 h-10 animate-pulse rounded bg-gray-100" />
        ) : (pool.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-[#555f6f]">
            No advisor is configured yet. Choose them with <strong>Configure advisors</strong>; Auto Assign distributes only among these advisors.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {pool.data?.map((a) => (
              <li key={a.advisorId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
                <Link to={`/admin/assignments/advisors/${a.advisorId}`} state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)} className="font-semibold text-[#151c27] hover:text-orange-600">
                  {a.fullName} <span className="font-normal text-[#555f6f]">· {a.email}</span>
                </Link>
                <span className="flex items-center gap-3 text-[#555f6f]">
                  {a.cohortStudents} in this cohort
                  <LoadBadge count={advisors.data?.find((x) => x.id === a.advisorId)?.activeStudents ?? 0} limit={a.maxAdvisees} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div>
        <h2 className="mb-3 text-base font-semibold text-[#151c27]">Students</h2>
        <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
          <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
            <Search className="size-4 text-[#98a2b3]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by student ID or full name..."
              aria-label="Search students"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
          <select
            value={unassignedOnly ? 'UNASSIGNED' : 'ALL'}
            disabled={pendingOnly}
            onChange={(e) => {
              setUnassignedOnly(e.target.value === 'UNASSIGNED');
              setPage(0);
            }}
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
              onChange={(e) => {
                setPendingOnly(e.target.checked);
                setPage(0);
              }}
              className="size-4 accent-[#f37021]"
            />
            Requested an advisor
          </label>
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => {
              setSearch('');
              setUnassignedOnly(false);
              setPendingOnly(false);
              setPage(0);
            }}
            className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
          >
            Clear filters
          </button>
        </section>
      </div>

      <section className="rounded-xl bg-white shadow-sm">
        {selected.size > 0 && (
          <div className="flex flex-col items-start justify-between gap-3 border-b border-[#e7eefe] p-4 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-[#151c27]">
              {selected.size} student{selected.size === 1 ? '' : 's'} selected
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelected(new Set())} className="px-2 text-sm font-semibold text-[#f37021] hover:underline">
                Clear selection
              </button>
              <button type="button" onClick={() => setAssignStudents(selectedStudents)} className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]">
                Assign / reassign
              </button>
              {rows.some((student) => selected.has(student.id) && student.advisorName) && (
                <button type="button" onClick={() => setUnassignStudents(rows.filter((student) => selected.has(student.id) && student.advisorName).map((student) => ({ id: student.id, name: student.fullName })))} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">
                  Unassign selected
                </button>
              )}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className="w-12 px-4 py-3.5">
                  <input type="checkbox" checked={allPageSelected} onChange={toggleAll} aria-label="Select all students on this page" className="size-4 accent-[#f37021]" />
                </th>
                <th className={th}>Student ID</th>
                <th className={th}>Full name</th>
                <th className={th}>Current advisor</th>
                <th className={th}>Assigned</th>
                <th className={th}>Request</th>
                <th className={cn(th, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={7} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : active.isError && !active.data ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load students.{' '}
                    <button type="button" onClick={() => active.refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {hasFilters ? 'No students match your filters.' : 'This cohort has no students.'}
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className={cn('border-t border-[#e7eefe] hover:bg-gray-50/60', selected.has(s.id) && 'bg-[#fff7ed]/50')}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} aria-label={`Select ${s.fullName}`} className="size-4 accent-[#f37021]" />
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-semibold text-[#151c27]">{s.studentCode}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">{s.fullName}</td>
                    <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.advisorName ?? 'No advisor assigned'}</td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{s.assignedDate ? formatDate(s.assignedDate) : '—'}</td>
                    <td className="px-3 py-3.5">
                      {s.hasPendingRequest ? (
                        <span className="rounded-full bg-[#fffbeb] px-2 py-0.5 text-[11px] font-bold uppercase text-[#b45309]">Requested</span>
                      ) : (
                        <span className="text-[13px] text-[#98a2b3]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button type="button" className={btn} onClick={() => setAssignStudents([{ id: s.id, name: s.fullName }])}>
                          {s.advisorName ? 'Reassign' : 'Assign'}
                        </button>
                        {s.advisorName && <button type="button" className={btn} onClick={() => setUnassignStudents([{ id: s.id, name: s.fullName }])}>Unassign</button>}
                        <Link to={`/admin/assignments/students/${s.id}/history`} state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)} className={btn}>
                          History
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="students" onChange={setPage} />
      </section>

      <CohortAssignModal open={assignOpen} onClose={() => setAssignOpen(false)} cohorts={summary.data?.cohorts ?? []} advisors={advisors.data ?? []} fixedCohortId={cohortId} />
      <AutoAssignModal
        open={autoOpen}
        cohort={cohort}
        pool={pool.data ?? []}
        onClose={() => setAutoOpen(false)}
        onConfigurePool={() => {
          setAutoOpen(false);
          setPoolOpen(true);
        }}
      />
      <CohortPoolModal open={poolOpen} cohort={cohort} advisors={advisors.data ?? []} currentIds={(pool.data ?? []).map((a) => a.advisorId)} onClose={() => setPoolOpen(false)} />
      <AssignAdvisorModal open={!!assignStudents} onClose={() => setAssignStudents(null)} students={assignStudents ?? []} advisors={advisors.data ?? []} onDone={() => setSelected(new Set())} />
      <UnassignAdvisorModal students={unassignStudents} onClose={() => setUnassignStudents(null)} onDone={() => setSelected(new Set())} />
    </div>
  );
}
