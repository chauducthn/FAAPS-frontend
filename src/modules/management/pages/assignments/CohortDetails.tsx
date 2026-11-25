import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, Settings2, Sparkles } from 'lucide-react';
import { AssignAdvisorModal } from '../../components/AssignAdvisorModal';
import { UnassignAdvisorModal } from '../../components/UnassignAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import {
  useAssignmentAdvisors,
  useAssignmentSummary,
  useCohortPool,
  useCohortStudents,
  useUnassignedStudents,
} from '../../hooks/queries/useAdminAssignments';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CohortPoolSection, CohortStudentsFilterBar } from './CohortHeaderAndPool';
import { CohortStudentsTable, type CohortStudentRow } from './CohortStudentsTable';

const PAGE_SIZE = 10;

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
  const students = useCohortStudents({
    cohortId: pendingOnly ? undefined : cohortId,
    search: debouncedSearch || undefined,
    unassignedOnly,
    page,
    size: PAGE_SIZE,
  });
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

  const rows: CohortStudentRow[] = useMemo(
    () =>
      pendingOnly
        ? (requested.data?.items ?? []).map((s) => ({
            id: s.id, studentCode: s.studentCode, fullName: s.fullName,
            advisorName: null, assignedDate: null, hasPendingRequest: true,
          }))
        : (students.data?.items ?? []).map((s) => ({
            id: s.id, studentCode: s.studentCode, fullName: s.fullName,
            advisorName: s.advisorName, assignedDate: s.assignedDate,
            hasPendingRequest: requestedIds.has(s.id),
          })),
    [pendingOnly, requested.data, students.data, requestedIds],
  );

  const active = pendingOnly ? requested : students;
  const total = active.data?.totalElements ?? 0;
  const pageIds = rows.map((s) => s.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  useEffect(() => setSelected(new Set()), [debouncedSearch, unassignedOnly, pendingOnly, page, cohortId]);

  const toggleOne = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Link to="/admin/assignments" className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#F26F21]">
            <ChevronLeft className="size-3.5" /> Back to Advisor Assignments
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-gray-900">Cohort {title}</h1>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 tabular-nums">
              Total {cohort?.total ?? '–'}
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 tabular-nums">
              Assigned {cohort?.assigned ?? '–'}
            </span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 tabular-nums">
              Unassigned {cohort?.unassigned ?? '–'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPoolOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
          >
            <Settings2 className="size-3.5" /> Configure advisors
          </button>
          {(cohort?.unassigned ?? 0) > 0 && (
            <>
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
              >
                Assign advisor
              </button>
              <button
                type="button"
                onClick={() => setAutoOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14]"
              >
                <Sparkles className="size-3.5" /> Auto Assign
              </button>
            </>
          )}
        </div>
      </div>

      {summary.isSuccess && !cohort && (
        <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center text-sm text-gray-500">
          This cohort does not exist.
        </div>
      )}

      <CohortPoolSection cohortId={cohortId} title={title} isLoading={pool.isLoading} pool={pool.data ?? []} advisors={advisors.data ?? []} />

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <CohortStudentsFilterBar
          search={search}
          unassignedOnly={unassignedOnly}
          pendingOnly={pendingOnly}
          hasFilters={hasFilters}
          onSearchChange={(val) => { setSearch(val); setPage(0); }}
          onUnassignedChange={(val) => { setUnassignedOnly(val); setPage(0); }}
          onPendingChange={(val) => { setPendingOnly(val); setPage(0); }}
          onClear={() => {
            setSearch('');
            setUnassignedOnly(false);
            setPendingOnly(false);
            setPage(0);
          }}
        />
        <CohortStudentsTable
          cohortId={cohortId} title={title} rows={rows} total={total} page={page} pageSize={PAGE_SIZE}
          isLoading={active.isLoading} isError={active.isError && !active.data} hasFilters={hasFilters}
          selected={selected} allPageSelected={allPageSelected} onToggleAll={toggleAll} onToggleOne={toggleOne}
          onClearSelection={() => setSelected(new Set())} onAssignSelected={() => setAssignStudents(selectedStudents)}
          onUnassignSelected={() =>
            setUnassignStudents(rows.filter((s) => selected.has(s.id) && s.advisorName).map((s) => ({ id: s.id, name: s.fullName })))
          }
          onAssignOne={(student) => setAssignStudents([student])}
          onUnassignOne={(student) => setUnassignStudents([student])}
          onRetry={() => active.refetch()} onPageChange={setPage}
        />
      </section>

      <CohortAssignModal open={assignOpen} onClose={() => setAssignOpen(false)} cohorts={summary.data?.cohorts ?? []} advisors={advisors.data ?? []} fixedCohortId={cohortId} />
      <AutoAssignModal open={autoOpen} cohort={cohort} pool={pool.data ?? []} onClose={() => setAutoOpen(false)} onConfigurePool={() => { setAutoOpen(false); setPoolOpen(true); }} />
      <CohortPoolModal open={poolOpen} cohort={cohort} advisors={advisors.data ?? []} currentIds={(pool.data ?? []).map((a) => a.advisorId)} onClose={() => setPoolOpen(false)} />
      <AssignAdvisorModal open={!!assignStudents} onClose={() => setAssignStudents(null)} students={assignStudents ?? []} advisors={advisors.data ?? []} onDone={() => setSelected(new Set())} />
      <UnassignAdvisorModal students={unassignStudents} onClose={() => setUnassignStudents(null)} onDone={() => setSelected(new Set())} />
    </div>
  );
}
