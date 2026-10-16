import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AutoAssignModal } from '../../../components/admin/AutoAssignModal';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { Pagination } from '../../../components/admin/Pagination';
import {
  useAssignStudents,
  useAssignmentAdvisors,
  useCohortStudents,
} from '../../../hooks/queries/useAdminAssignments';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

type AssignFilter = '' | 'ASSIGNED' | 'UNASSIGNED';

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#151c27]">{value}</p>
    </div>
  );
}

export default function CohortDetails() {
  const { cohort = '' } = useParams();
  const studentsQuery = useCohortStudents(cohort);
  const advisorsQuery = useAssignmentAdvisors();
  const assign = useAssignStudents();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AssignFilter>('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [advisorId, setAdvisorId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  const students = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);
  const advisors = useMemo(() => advisorsQuery.data ?? [], [advisorsQuery.data]);

  const assignedCount = students.filter((s) => s.advisorId).length;
  const unassignedCount = students.length - assignedCount;

  const term = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      students.filter((s) => {
        if (filter === 'ASSIGNED' && !s.advisorId) return false;
        if (filter === 'UNASSIGNED' && s.advisorId) return false;
        return !term || s.studentCode.toLowerCase().includes(term) || s.fullName.toLowerCase().includes(term);
      }),
    [students, filter, term]
  );
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Per-advisor allocation inside this cohort.
  const allocation = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    students.forEach((s) => {
      if (!s.advisorId) return;
      const entry = map.get(s.advisorId) ?? { name: s.advisorName ?? s.advisorId, count: 0 };
      entry.count += 1;
      map.set(s.advisorId, entry);
    });
    return [...map.entries()];
  }, [students]);

  useEffect(() => setSelected(new Set()), [search, filter, page, cohort]);

  const pageIds = pageRows.map((s) => s.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const togglePage = () =>
    setSelected((cur) => {
      const next = new Set(cur);
      pageIds.forEach((id) => (allPageSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectedStudents = students.filter((s) => selected.has(s.id));
  const reassigning = selectedStudents.filter((s) => s.advisorId && s.advisorId !== advisorId);
  const alreadyWithAdvisor = selectedStudents.filter((s) => s.advisorId === advisorId).length;
  const targetAdvisor = advisors.find((a) => a.id === advisorId);
  const toMove = selectedStudents.length - alreadyWithAdvisor;
  const overCapacity =
    targetAdvisor?.maxAdvisees != null && targetAdvisor.activeStudents + toMove > targetAdvisor.maxAdvisees;

  const startAssign = () => {
    if (!advisorId) return toast.error('Choose an advisor first.');
    if (toMove === 0) return toast.info('The selected students already have this advisor.');
    if (overCapacity) {
      return toast.error(`${targetAdvisor?.fullName} would exceed their limit of ${targetAdvisor?.maxAdvisees} students.`);
    }
    setConfirmOpen(true);
  };

  const runAssign = async () => {
    try {
      const res = await assign.mutateAsync({ studentIds: selectedStudents.map((s) => s.id), advisorId });
      toast.success(`${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned to ${targetAdvisor?.fullName}.`);
      setSelected(new Set());
    } catch {
      // The global API error handler already shows a toast.
    } finally {
      setConfirmOpen(false);
    }
  };

  const hasFilters = !!search || !!filter;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <Link to="/admin/assignments" className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
          <ChevronLeft className="size-4" />
          Back to Advisor Assignments
        </Link>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#fff7ed] px-4 py-2.5 text-xs font-medium text-[#f37021]">
          <Sparkles className="mt-0.5 size-3.5 shrink-0" />
          Auto Assign distributes newly joined students without an advisor to existing advisors, balancing their assigned counts without reassigning existing students.
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Cohort Assignment Details — {cohort}</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cohort code" value={cohort} />
        <Stat label="Total students" value={studentsQuery.isLoading ? '–' : students.length} />
        <Stat label="Assigned students" value={studentsQuery.isLoading ? '–' : assignedCount} />
        <Stat label="Unassigned students" value={studentsQuery.isLoading ? '–' : unassignedCount} />
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
            placeholder="Search by student ID or full name..."
            aria-label="Search students"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as AssignFilter);
            setPage(0);
          }}
          aria-label="Filter by assignment status"
          className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="">Assignment status: All</option>
          <option value="ASSIGNED">Assignment status: Assigned</option>
          <option value="UNASSIGNED">Assignment status: Unassigned</option>
        </select>
        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearch('');
            setFilter('');
            setPage(0);
          }}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e7eefe] p-4 sm:flex-row sm:items-center sm:justify-between">
          {selected.size > 0 ? (
            <>
              <div>
                <p className="text-sm font-semibold text-[#151c27]">
                  {selected.size} student{selected.size === 1 ? '' : 's'} selected
                </p>
                <p className="text-xs text-[#555f6f]">
                  {reassigning.length > 0
                    ? `${reassigning.length} already ha${reassigning.length === 1 ? 's' : 've'} an advisor and will be reassigned.`
                    : 'Choose an advisor to assign them to.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={advisorId}
                  onChange={(e) => setAdvisorId(e.target.value)}
                  aria-label="Advisor to assign"
                  className="h-[38px] max-w-[240px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Advisor: choose...</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.activeStudents}
                      {a.maxAdvisees !== null ? `/${a.maxAdvisees}` : ''})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={startAssign}
                  className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]"
                >
                  {reassigning.length > 0 ? 'Assign / Reassign' : 'Assign Advisor'}
                </button>
                <button type="button" onClick={() => setSelected(new Set())} className="text-sm font-semibold text-[#f37021] hover:underline">
                  Clear selection
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#555f6f]">
                Select students to assign or reassign an advisor, or use Auto Assign for all {unassignedCount} unassigned student
                {unassignedCount === 1 ? '' : 's'}.
              </p>
              <button
                type="button"
                disabled={unassignedCount === 0 || advisors.length === 0}
                onClick={() => setAutoOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                Auto Assign
              </button>
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className="w-12 px-4 py-3.5">
                  <input type="checkbox" checked={allPageSelected} onChange={togglePage} aria-label="Select all students on this page" className="size-4 accent-[#f37021]" />
                </th>
                <th className={th}>Student ID</th>
                <th className={th}>Full name</th>
                <th className={th}>Current advisor</th>
                <th className={th}>Assignment status</th>
                <th className={cn(th, 'text-right')}>History</th>
              </tr>
            </thead>
            <tbody>
              {studentsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={6} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : studentsQuery.isError ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load students.{' '}
                    <button type="button" onClick={() => studentsQuery.refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {hasFilters ? 'No students match your filters.' : 'This cohort has no students.'}
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
                    <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.advisorName ?? 'No advisor assigned'}</td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]',
                          s.advisorId ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#fffbeb] text-[#b45309]'
                        )}
                      >
                        {s.advisorId ? 'Assigned' : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <Link
                        to={`/admin/assignments/students/${s.id}/history`}
                        className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                      >
                        View history
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > pageIds.length && selected.size > 0 && selected.size === pageIds.length && (
          <div className="border-t border-[#e7eefe] px-4 py-2 text-right text-xs">
            <button type="button" onClick={() => setSelected(new Set(filtered.map((s) => s.id)))} className="font-semibold text-[#f37021] hover:underline">
              Select all {filtered.length} matching students across all pages
            </button>
          </div>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="students" onChange={setPage} />
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-[#151c27]">Current Advisor Allocation — {cohort}</h2>
        {allocation.length === 0 ? (
          <p className="mt-3 text-sm text-[#555f6f]">No advisor is assigned to this cohort yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {allocation.map(([id, { name, count }]) => (
              <li key={id} className="flex items-center justify-between rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
                <Link to={`/admin/assignments/advisors/${id}`} className="font-semibold text-[#151c27] hover:text-orange-600">
                  {name}
                </Link>
                <span className="text-[#555f6f]">
                  {count} student{count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={reassigning.length > 0 ? 'Assign / reassign advisor?' : 'Assign advisor?'}
        message={
          `${toMove} student${toMove === 1 ? '' : 's'} will be assigned to ${targetAdvisor?.fullName ?? 'the advisor'}.` +
          (reassigning.length > 0
            ? ` ${reassigning.length} will leave their current advisor: open advising requests move to the new advisor, future scheduled sessions with the old advisor are cancelled, and the students are notified.`
            : '')
        }
        confirmLabel="Confirm"
        isLoading={assign.isPending}
        onConfirm={runAssign}
        onCancel={() => setConfirmOpen(false)}
      />

      <AutoAssignModal
        open={autoOpen}
        cohort={cohort}
        unassignedCount={unassignedCount}
        advisors={advisors}
        defaultAdvisorIds={allocation.map(([id]) => id).filter((id) => advisors.some((a) => a.id === id))}
        onClose={() => setAutoOpen(false)}
      />
    </div>
  );
}
