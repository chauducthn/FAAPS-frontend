import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AlertTriangle, ChevronLeft, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AssignAdvisorModal } from '../../../components/management/AssignAdvisorModal';
import { UnassignAdvisorModal } from '../../../components/management/UnassignAdvisorModal';
import { CohortAssignModal } from '../../../components/management/CohortAssignModal';
import { LoadBadge } from '../../../components/management/LoadBadge';
import { backState, useBackTarget } from '../../../lib/backLink';
import { Pagination } from '../../../components/management/Pagination';
import { StatusBadge } from '../../../components/management/StatusBadge';
import { UserInitials } from '../../../components/management/UserInitials';
import { apiClient } from '../../../lib/apiClient';
import { getCsrfHeaders } from '../../../lib/csrf';
import {
  useAdvisorAssignment,
  useAssignmentAdvisors,
  useAssignmentSummary,
  useUpdateAdvisorLimit,
} from '../../../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../lib/apiError';
import type { AdminUserStatus } from '../../../types/admin';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

export default function AdvisorDetails() {
  const { advisorId } = useParams();
  const backTarget = useBackTarget('/admin/assignments?tab=advisors', 'Advisor Assignments · Advisors tab');
  const { data, isLoading, isError, refetch } = useAdvisorAssignment(advisorId);
  const advisors = useAssignmentAdvisors();
  const summary = useAssignmentSummary();
  const updateLimit = useUpdateAdvisorLimit();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reassign, setReassign] = useState<{ id: string; name: string }[] | null>(null);
  const [unassign, setUnassign] = useState<{ id: string; name: string }[] | null>(null);
  const [assignCohortOpen, setAssignCohortOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [limitValue, setLimitValue] = useState('');
  const [limitError, setLimitError] = useState<string | null>(null);
  const [assignmentStartDate, setAssignmentStartDate] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (!advisorId) return;
    apiClient.get<{ assignmentStartDate: string | null }>(`/admin/advisors/${advisorId}/schedule`)
      .then(({ data: schedule }) => {
        setAssignmentStartDate(schedule.assignmentStartDate ?? '');
        setScheduleError(null);
      })
      .catch(() => setScheduleError('Could not load work schedule. Apply the database migration first.'));
  }, [advisorId]);

  const students = useMemo(() => data?.students ?? [], [data]);
  // Cohorts the advisor is configured for plus every cohort they already have students in.
  const myCohorts = useMemo(() => {
    const map = new Map<string, { cohortId: string; label: string; students: number; configured: boolean }>();
    (data?.configuredCohorts ?? []).forEach((c) => map.set(c.cohortId, { cohortId: c.cohortId, label: `${c.majorCode} ${c.cohort}`, students: 0, configured: true }));
    students.forEach((s) => {
      const entry = map.get(s.cohortId) ?? { cohortId: s.cohortId, label: `${s.majorCode} ${s.cohort}`, students: 0, configured: false };
      entry.students += 1;
      map.set(s.cohortId, entry);
    });
    return [...map.values()];
  }, [data, students]);
  const term = search.trim().toLowerCase();
  const filtered = students.filter((s) => s.studentCode.toLowerCase().includes(term) || s.fullName.toLowerCase().includes(term));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageIds = pageRows.map((s) => s.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  useEffect(() => setSelected(new Set()), [search, page, advisorId]);

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

  const back = (
    <Link to={backTarget.to} className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
      <ChevronLeft className="size-4" />
      Back to {backTarget.label}
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#555f6f]">
          Could not load this advisor. They may be inactive or no longer exist.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { advisor } = data;
  const overBy = advisor.maxAdvisees !== null ? Math.max(0, advisor.activeStudents - advisor.maxAdvisees) : 0;

  const saveLimit = async () => {
    const n = Number(limitValue);
    if (!Number.isInteger(n) || n < 1) return setLimitError('Enter a whole number of at least 1.');
    setLimitError(null);
    try {
      const res = await updateLimit.mutateAsync({ advisorId: advisor.id, maxAdvisees: n });
      toast.success(`Advisory limit set to ${res.maxAdvisees}.`);
      if (res.overLimitBy > 0) toast.warning(`${advisor.fullName} is ${res.overLimitBy} over the new limit.`);
      setEditingLimit(false);
    } catch (err) {
      setLimitError(apiErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        {back}
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Advisor Assignment Details</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Current student assignments for {advisor.fullName} · {advisor.email}
        </p>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 rounded-lg border border-[#e5e7eb] p-4">
          <h3 className="text-sm font-semibold text-[#151c27]">Assignment start date</h3>
          <label className="mt-3 flex items-center gap-3 text-sm">Start date
            <input type="date" value={assignmentStartDate} onChange={event => setAssignmentStartDate(event.target.value)}
              className="rounded-md border border-[#e5e7eb] p-1" /></label>
          {scheduleError && <p className="mt-2 text-sm text-red-600">{scheduleError}</p>}
          <button type="button" className="mt-3 rounded-md bg-[#f37021] px-3 py-1.5 text-sm font-semibold text-white"
            onClick={async () => {
              if (!assignmentStartDate) return setScheduleError('Select an assignment start date.');
              try {
                await apiClient.put(`/admin/advisors/${advisorId}/schedule`, { assignmentStartDate },
                  { headers: await getCsrfHeaders() });
                setScheduleError(null);
                toast.success('Advisor schedule saved.');
              } catch (error) { setScheduleError(apiErrorMessage(error)); }
            }}>Save date</button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserInitials name={advisor.fullName} className="size-12" />
            <div>
              <h2 className="text-xl font-semibold text-[#151c27]">{advisor.fullName}</h2>
              <p className="text-sm text-[#555f6f]">{data.email ?? ' '}</p>
            </div>
          </div>
          <StatusBadge status={data.status as AdminUserStatus} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Email</p>
            <p className="mt-1 text-base font-semibold text-[#151c27]">{advisor.email}</p>
          </div>
          <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Students</p>
            <p className="mt-1">
              <LoadBadge count={advisor.activeStudents} limit={advisor.maxAdvisees} />
            </p>
          </div>
          <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Advisory limit</p>
            {editingLimit ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  aria-label="Advisory limit"
                  className="h-8 w-20 rounded-md border border-[#e5e7eb] px-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button type="button" disabled={updateLimit.isPending} onClick={saveLimit} className="rounded-md bg-[#f37021] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60">
                  Save
                </button>
                <button type="button" onClick={() => setEditingLimit(false)} className="text-xs font-semibold text-[#555f6f] hover:underline">
                  Cancel
                </button>
              </div>
            ) : (
              <p className="mt-1 flex items-center gap-2 text-base font-semibold text-[#151c27]">
                {advisor.maxAdvisees ?? 'No limit'}
                <button
                  type="button"
                  onClick={() => {
                    setLimitValue(String(advisor.maxAdvisees ?? ''));
                    setLimitError(null);
                    setEditingLimit(true);
                  }}
                  aria-label="Edit advisory limit"
                  className="rounded-md p-1 text-[#555f6f] hover:bg-gray-200"
                >
                  <Pencil className="size-3.5" />
                </button>
              </p>
            )}
            {limitError && <p className="mt-1 text-xs text-red-600">{limitError}</p>}
          </div>
        </div>
        {overBy > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            This advisor is {overBy} over the advisory limit. The limit is a warning, not a block; raise it or move some students to another advisor.
          </p>
        )}
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#151c27]">Cohorts</h2>
          <button type="button" onClick={() => setAssignCohortOpen(true)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50">
            Assign cohort
          </button>
        </div>
        {myCohorts.length === 0 ? (
          <p className="mt-3 text-sm text-[#555f6f]">This advisor has no cohort yet: none configured and no students assigned.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {myCohorts.map((c) => (
              <li key={c.cohortId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
                <Link to={`/admin/assignments/cohorts/${c.cohortId}`} className="font-semibold text-[#151c27] hover:text-orange-600">
                  {c.label}
                </Link>
                <span className="flex items-center gap-3 text-[#555f6f]">
                  {c.students} assigned student{c.students === 1 ? '' : 's'}
                  {c.configured ? <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-semibold text-[#047857]">Configured</span> : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-[#555f6f]">Not configured</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#151c27]">Assigned students</h2>
          <p className="text-[13px] text-[#555f6f]">Each student has only one active advisor.</p>
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
              placeholder="Search by student ID or name..."
              aria-label="Search students"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
          <button type="button" disabled={!search} onClick={() => setSearch('')} className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40">
            Clear filters
          </button>
        </section>
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
                <button
                  type="button"
                  onClick={() => setReassign(students.filter((s) => selected.has(s.id)).map((s) => ({ id: s.id, name: s.fullName })))}
                  className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]"
                >
                  Reassign
                </button>
                <button type="button" onClick={() => setUnassign(students.filter((student) => selected.has(student.id)).map((student) => ({ id: student.id, name: student.fullName })))} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Unassign</button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-[rgba(240,243,255,0.7)]">
                <tr>
                  <th className="w-12 px-4 py-3.5">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleAll} aria-label="Select all students on this page" className="size-4 accent-[#f37021]" />
                  </th>
                  <th className={th}>Student ID</th>
                  <th className={th}>Name</th>
                  <th className={th}>Major</th>
                  <th className={th}>Cohort</th>
                  <th className={th}>Assigned</th>
                  <th className={cn(th, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr className="border-t border-[#e7eefe]">
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                      {search ? 'No students match your search.' : 'No assigned students.'}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((s) => (
                    <tr key={s.id} className={cn('border-t border-[#e7eefe] hover:bg-gray-50/60', selected.has(s.id) && 'bg-[#fff7ed]/50')}>
                      <td className="px-4 py-3.5">
                        <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} aria-label={`Select ${s.fullName}`} className="size-4 accent-[#f37021]" />
                      </td>
                      <td className="px-3 py-3.5 text-[13px] font-semibold text-[#151c27]">{s.studentCode}</td>
                      <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">{s.fullName}</td>
                      <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.majorCode}</td>
                      <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.cohort}</td>
                      <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{s.assignedDate ? new Date(`${s.assignedDate}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : '—'}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setReassign([{ id: s.id, name: s.fullName }])} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50">
                            Reassign
                          </button>
                          <button type="button" onClick={() => setUnassign([{ id: s.id, name: s.fullName }])} className="rounded-lg border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-50">Unassign</button>
                          <Link to={`/admin/assignments/students/${s.id}/history`} state={backState(`/admin/assignments/advisors/${advisorId}`, `Advisor ${data?.advisor.fullName ?? 'details'}`)} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50">
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
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="students" onChange={setPage} />
        </section>
      </div>

      <AssignAdvisorModal open={!!reassign} onClose={() => setReassign(null)} students={reassign ?? []} advisors={advisors.data ?? []} excludeAdvisorId={advisor.id} onDone={() => setSelected(new Set())} />
      <UnassignAdvisorModal students={unassign} onClose={() => setUnassign(null)} onDone={() => setSelected(new Set())} />
      <CohortAssignModal open={assignCohortOpen} onClose={() => setAssignCohortOpen(false)} cohorts={summary.data?.cohorts ?? []} advisors={advisors.data ?? []} fixedAdvisorId={advisor.id} />
    </div>
  );
}
