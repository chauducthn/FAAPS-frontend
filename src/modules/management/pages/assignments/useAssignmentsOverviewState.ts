import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  useAdvisorCohortRows,
  useAssignedStudents,
  useAssignmentAdvisors,
  useAssignmentSummary,
  useAutoAssignStudents,
  useCohortPool,
  useUnassignedStudents,
} from '../../hooks/queries/useAdminAssignments';
import type { SummaryCohort, UnassignedStudent } from '../../types/admin';
import type { AdvisoryLimitTarget } from '../../components/AdvisoryLimitModal';
import type { HistoryStudentTarget } from '../../components/StudentHistoryPanel';
import type { UnassignAllTarget } from '../../components/UnassignAllModal';
import { ASSIGNMENT_TABS, UNASSIGNED_FILTER, type AssignmentTab } from './AssignmentsToolbar';
import type { AdvisorRowItem } from './AssignmentsTables';

export const OVERVIEW_PAGE_SIZE = 10;

export function useAssignmentsOverviewState() {
  const [params, setParams] = useSearchParams();
  const tab: AssignmentTab = ASSIGNMENT_TABS.some((t) => t.key === params.get('tab'))
    ? (params.get('tab') as AssignmentTab)
    : 'advisors';
  const pendingOnly = params.get('pending') === '1';
  const advisorFilter = tab === 'assigned' ? (params.get('advisorId') ?? '') : '';
  const [search, setSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [page, setPage] = useState(0);

  const [assignCohortFor, setAssignCohortFor] = useState<{
    cohortId?: string;
    advisorId?: string;
    initialCohortIds?: string[];
    bulkAdvisors?: { id: string; name: string }[];
  } | null>(null);
  const [selectedAdvisorIds, setSelectedAdvisorIds] = useState<Set<string>>(new Set());
  const [limitTarget, setLimitTarget] = useState<AdvisoryLimitTarget | null>(null);
  const [autoFor, setAutoFor] = useState<SummaryCohort | null>(null);
  const [poolFor, setPoolFor] = useState<SummaryCohort | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bulkAssignStudents, setBulkAssignStudents] = useState<{ id: string; name: string; cohortId?: string }[] | null>(null);
  const [reassignStudents, setReassignStudents] = useState<
    { id: string; name: string; cohortId?: string; advisorId?: string | null }[] | null
  >(null);
  const [unassignStudents, setUnassignStudents] = useState<{ id: string; name: string }[] | null>(null);
  const [historyStudent, setHistoryStudent] = useState<HistoryStudentTarget | null>(null);
  const [unassignAllTarget, setUnassignAllTarget] = useState<UnassignAllTarget | null>(null);

  const summary = useAssignmentSummary();
  const advisors = useAssignmentAdvisors();
  const advisorRows = useAdvisorCohortRows();
  const autoAssign = useAutoAssignStudents();
  const debouncedSearch = useDebounce(search.trim());

  const realCohortFilter = cohortFilter && cohortFilter !== UNASSIGNED_FILTER ? cohortFilter : undefined;
  const realMajorFilter = majorFilter && majorFilter !== UNASSIGNED_FILTER ? majorFilter : undefined;

  const assigned = useAssignedStudents(
    {
      advisorId: advisorFilter || undefined,
      cohortId: realCohortFilter,
      majorCode: realMajorFilter,
      search: debouncedSearch || undefined,
      page,
      size: OVERVIEW_PAGE_SIZE,
    },
    tab === 'assigned',
  );

  const unassigned = useUnassignedStudents({
    search: tab === 'unassigned' ? debouncedSearch || undefined : undefined,
    cohortId: tab === 'unassigned' ? realCohortFilter : undefined,
    hasPendingRequest: pendingOnly ? true : undefined,
    page: tab === 'unassigned' ? page : 0,
    size: OVERVIEW_PAGE_SIZE,
  });

  const autoPool = useCohortPool(autoFor?.cohortId ?? poolFor?.cohortId);

  const cohorts = useMemo(() => summary.data?.cohorts ?? [], [summary.data]);
  const waitingCohorts = cohorts.filter((c) => c.unassigned > 0).length;
  const term = search.trim().toLowerCase();

  const setTab = (next: AssignmentTab, extra: Record<string, string> = {}) => {
    setParams(next === 'advisors' && !Object.keys(extra).length ? {} : { tab: next, ...extra }, { replace: true });
    setSearch('');
    setCohortFilter('');
    setMajorFilter('');
    setPage(0);
  };

  const setAdvisorFilter = (advisorId: string) => {
    setParams(advisorId ? { tab: 'assigned', advisorId } : { tab: 'assigned' }, { replace: true });
    setPage(0);
  };

  const openAdvisorStudents = (advisorId: string) => {
    setTab('assigned', { advisorId });
  };

  const majors = useMemo(() => [...new Set(cohorts.map((c) => c.majorCode))].sort(), [cohorts]);
  const advisorCohortOptions =
    majorFilter === UNASSIGNED_FILTER ? [] : majorFilter ? cohorts.filter((c) => c.majorCode === majorFilter) : cohorts;

  const advisorList = useMemo(() => {
    const map = new Map<string, AdvisorRowItem>();
    (advisorRows.data ?? []).forEach((r) => {
      const item = map.get(r.advisorId) ?? { id: r.advisorId, email: r.email, name: r.fullName, avatarUrl: r.avatarUrl, limit: r.maxAdvisees, chips: [] };
      if (r.cohortId) {
        item.chips.push({ key: r.cohortId, majorCode: r.majorCode ?? '', cohort: r.cohort ?? '', inPool: r.inPool, students: r.studentCount });
      }
      map.set(r.advisorId, item);
    });
    return [...map.values()].filter((a) => {
      const matchesTerm = a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term);
      const matchesMajor =
        !majorFilter ||
        (majorFilter === UNASSIGNED_FILTER
          ? a.chips.length === 0 || a.chips.every((c) => !c.majorCode)
          : a.chips.some((c) => c.majorCode === majorFilter));
      const matchesCohort =
        !cohortFilter ||
        (cohortFilter === UNASSIGNED_FILTER ? a.chips.length === 0 : a.chips.some((c) => c.key === cohortFilter));
      return matchesTerm && matchesMajor && matchesCohort;
    });
  }, [advisorRows.data, term, majorFilter, cohortFilter]);

  const poolAdvisorsByCohort = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (advisorRows.data ?? []).forEach((r) => {
      if (r.cohortId && r.inPool) {
        const set = map.get(r.cohortId) ?? new Set<string>();
        set.add(r.advisorId);
        map.set(r.cohortId, set);
      }
    });
    return map;
  }, [advisorRows.data]);

  const poolCountByCohort = useMemo(() => {
    const counts = new Map<string, number>();
    poolAdvisorsByCohort.forEach((set, cohortId) => counts.set(cohortId, set.size));
    return counts;
  }, [poolAdvisorsByCohort]);

  const loadOf = (id: string) => advisors.data?.find((a) => a.id === id)?.activeStudents ?? 0;
  const unassignedRows = useMemo(() => {
    const items = unassigned.data?.items ?? [];
    return majorFilter && !cohortFilter ? items.filter((s) => s.majorCode === majorFilter) : items;
  }, [unassigned.data, majorFilter, cohortFilter]);
  const assignedRows = useMemo(() => assigned.data?.items ?? [], [assigned.data]);
  const hasFilter = !!search || !!cohortFilter || !!majorFilter || !!advisorFilter || pendingOnly;

  const runAutoAssign = async (students: Pick<UnassignedStudent, 'id' | 'cohortId'>[]) => {
    if (students.length === 0) return;
    try {
      const res = await autoAssign.mutateAsync({ students });
      toast.success(`${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned automatically.`);
    } catch {
      return;
    }
  };

  return {
    tab, pendingOnly, advisorFilter, setAdvisorFilter, openAdvisorStudents, setParams,
    search, setSearch, cohortFilter, setCohortFilter,
    majorFilter, setMajorFilter, page, setPage,
    assignCohortFor, setAssignCohortFor, selectedAdvisorIds, setSelectedAdvisorIds,
    limitTarget, setLimitTarget,
    autoFor, setAutoFor, poolFor, setPoolFor,
    pickerOpen, setPickerOpen, bulkAssignStudents, setBulkAssignStudents,
    reassignStudents, setReassignStudents, unassignStudents, setUnassignStudents,
    historyStudent, setHistoryStudent,
    unassignAllTarget, setUnassignAllTarget,
    summary, advisors, advisorRows, autoAssign, assigned, unassigned, autoPool,
    cohorts, waitingCohorts, majors, advisorCohortOptions, advisorList, poolCountByCohort, poolAdvisorsByCohort,
    loadOf, assignedRows, unassignedRows, hasFilter, setTab, runAutoAssign,
  };
}
