import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { assignmentService } from '../../../advising/services/assignmentService';
import { fetchAllPages } from '../../../../shared/lib/fetchAllPages';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { AssignAdvisorModal } from '../../components/AssignAdvisorModal';
import { UnassignAdvisorModal } from '../../components/UnassignAdvisorModal';
import { AutoAssignModal } from '../../components/AutoAssignModal';
import { CohortAssignModal } from '../../components/CohortAssignModal';
import { CohortPoolModal } from '../../components/CohortPoolModal';
import {
  useAssignmentAdvisors, useAssignmentSummary, useCohortPool, useCohortStudents, useUnassignedStudents,
} from '../../hooks/queries/useAdminAssignments';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CohortPoolSection, CohortStudentsFilterBar } from './CohortHeaderAndPool';
import { CohortDetailsHeader } from './CohortDetailsHeader';
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
  const [allSelectedRows, setAllSelectedRows] = useState<CohortStudentRow[] | null>(null);
  const [selectingAll, setSelectingAll] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  const [assignStudents, setAssignStudents] = useState<{ id: string; name: string }[] | null>(null);
  const [unassignStudents, setUnassignStudents] = useState<{ id: string; name: string }[] | null>(null);

  const debouncedSearch = useDebounce(search.trim());
  const students = useCohortStudents({
    cohortId: pendingOnly ? undefined : cohortId, search: debouncedSearch || undefined,
    unassignedOnly, page, size: PAGE_SIZE,
  });
  const requested = useUnassignedStudents({
    cohortId, hasPendingRequest: true, search: pendingOnly ? debouncedSearch || undefined : undefined,
    page: pendingOnly ? page : 0, size: pendingOnly ? PAGE_SIZE : 100,
  });

  const cohort = summary.data?.cohorts.find((c) => c.cohortId === cohortId) ?? null;
  const title = cohort ? `${cohort.majorCode} ${cohort.cohort}` : 'Cohort';
  const requestedIds = useMemo(() => new Set((requested.data?.items ?? []).map((s) => s.id)), [requested.data]);

  const rows: CohortStudentRow[] = useMemo(
    () => pendingOnly
      ? (requested.data?.items ?? []).map((s) => ({
          id: s.id, studentCode: s.studentCode, fullName: s.fullName,
          advisorName: null, assignedDate: null, hasPendingRequest: true,
        }))
      : (students.data?.items ?? []).map((s) => ({
          id: s.id, studentCode: s.studentCode, fullName: s.fullName,
          advisorName: s.advisorName, assignedDate: s.assignedDate, hasPendingRequest: requestedIds.has(s.id),
        })),
    [pendingOnly, requested.data, students.data, requestedIds],
  );

  const active = pendingOnly ? requested : students;
  const total = active.data?.totalElements ?? 0;
  const pageIds = rows.map((s) => s.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  useEffect(() => {
    setSelected(new Set()); setAllSelectedRows(null);
  }, [debouncedSearch, unassignedOnly, pendingOnly, page, cohortId]);

  const toggleOne = (id: string) => {
    setAllSelectedRows(null);
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setAllSelectedRows(null);
    setSelected((cur) => {
      const next = new Set(cur);
      pageIds.forEach((id) => (allPageSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const selectAllMatching = async () => {
    setSelectingAll(true);
    try {
      const all: CohortStudentRow[] = pendingOnly
        ? (await fetchAllPages((p, size) => assignmentService.getUnassigned({ cohortId, hasPendingRequest: true, search: debouncedSearch || undefined, page: p, size })))
            .map((s) => ({ id: s.id, studentCode: s.studentCode, fullName: s.fullName, advisorName: null, assignedDate: null, hasPendingRequest: true }))
        : (await fetchAllPages((p, size) => assignmentService.getCohortStudents({ cohortId, search: debouncedSearch || undefined, unassignedOnly, page: p, size })))
            .map((s) => ({ id: s.id, studentCode: s.studentCode, fullName: s.fullName, advisorName: s.advisorName, assignedDate: s.assignedDate, hasPendingRequest: requestedIds.has(s.id) }));
      setAllSelectedRows(all);
      setSelected(new Set(all.map((s) => s.id)));
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setSelectingAll(false); }
  };

  const selectedPool = allSelectedRows ?? rows.filter((s) => selected.has(s.id));
  const selectedStudents = selectedPool.map((s) => ({ id: s.id, name: s.fullName }));
  const assignedSelected = selectedPool.filter((s) => s.advisorName).map((s) => ({ id: s.id, name: s.fullName }));
  const clearSelection = () => {
    setSelected(new Set()); setAllSelectedRows(null);
  };
  const hasFilters = !!search || unassignedOnly || pendingOnly;

  return (
    <div className="flex w-full flex-col gap-4">
      <CohortDetailsHeader
        title={title} cohort={cohort}
        onOpenPool={() => setPoolOpen(true)} onOpenAssign={() => setAssignOpen(true)} onOpenAuto={() => setAutoOpen(true)}
      />

      {summary.isSuccess && !cohort && (
        <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center text-sm text-gray-500">
          This cohort does not exist.
        </div>
      )}

      <CohortPoolSection cohortId={cohortId} title={title} isLoading={pool.isLoading} pool={pool.data ?? []} advisors={advisors.data ?? []} />

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <CohortStudentsFilterBar
          search={search} unassignedOnly={unassignedOnly} pendingOnly={pendingOnly} hasFilters={hasFilters}
          onSearchChange={(val) => { setSearch(val); setPage(0); }}
          onUnassignedChange={(val) => { setUnassignedOnly(val); setPage(0); }}
          onPendingChange={(val) => { setPendingOnly(val); setPage(0); }}
          onClear={() => {
            setSearch(''); setUnassignedOnly(false);
            setPendingOnly(false); setPage(0);
          }}
        />
        <CohortStudentsTable
          cohortId={cohortId} title={title} rows={rows} total={total} page={page} pageSize={PAGE_SIZE}
          isLoading={active.isLoading} isError={active.isError && !active.data} hasFilters={hasFilters}
          selected={selected} allPageSelected={allPageSelected} selectingAll={selectingAll}
          hasAssignedSelected={assignedSelected.length > 0}
          onToggleAll={toggleAll} onToggleOne={toggleOne} onSelectAll={() => void selectAllMatching()}
          onClearSelection={clearSelection} onAssignSelected={() => setAssignStudents(selectedStudents)}
          onUnassignSelected={() => setUnassignStudents(assignedSelected)}
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
