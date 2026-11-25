import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../../shared/lib/csrf';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import {
  useAdvisorAssignment,
  useAssignmentAdvisors,
  useAssignmentSummary,
  useUpdateAdvisorLimit,
} from '../../hooks/queries/useAdminAssignments';

export const ADVISOR_PAGE_SIZE = 10;

export function useAdvisorDetailsState(advisorId?: string) {
  const assignmentQuery = useAdvisorAssignment(advisorId);
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
    apiClient
      .get<{ assignmentStartDate: string | null }>(`/admin/advisors/${advisorId}/schedule`)
      .then(({ data: schedule }) => {
        setAssignmentStartDate(schedule.assignmentStartDate ?? '');
        setScheduleError(null);
      })
      .catch(() => setScheduleError('Could not load work schedule. Apply the database migration first.'));
  }, [advisorId]);

  const students = useMemo(() => assignmentQuery.data?.students ?? [], [assignmentQuery.data]);
  const myCohorts = useMemo(() => {
    const map = new Map<string, { cohortId: string; label: string; students: number; configured: boolean }>();
    (assignmentQuery.data?.configuredCohorts ?? []).forEach((c) =>
      map.set(c.cohortId, { cohortId: c.cohortId, label: `${c.majorCode} ${c.cohort}`, students: 0, configured: true }),
    );
    students.forEach((s) => {
      const entry = map.get(s.cohortId) ?? { cohortId: s.cohortId, label: `${s.majorCode} ${s.cohort}`, students: 0, configured: false };
      entry.students += 1;
      map.set(s.cohortId, entry);
    });
    return [...map.values()];
  }, [assignmentQuery.data, students]);

  const term = search.trim().toLowerCase();
  const filtered = students.filter((s) => s.studentCode.toLowerCase().includes(term) || s.fullName.toLowerCase().includes(term));
  const pageRows = filtered.slice(page * ADVISOR_PAGE_SIZE, (page + 1) * ADVISOR_PAGE_SIZE);
  const pageIds = pageRows.map((s) => s.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  useEffect(() => setSelected(new Set()), [search, page, advisorId]);

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

  const saveLimit = async () => {
    const advisor = assignmentQuery.data?.advisor;
    if (!advisor) return;
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

  const saveDate = async () => {
    if (!assignmentStartDate) return setScheduleError('Select an assignment start date.');
    try {
      await apiClient.put(`/admin/advisors/${advisorId}/schedule`, { assignmentStartDate }, { headers: await getCsrfHeaders() });
      setScheduleError(null);
      toast.success('Advisor schedule saved.');
    } catch (error) {
      setScheduleError(apiErrorMessage(error));
    }
  };

  return {
    assignmentQuery, advisors, summary, updateLimit,
    search, setSearch, page, setPage, selected, setSelected,
    reassign, setReassign, unassign, setUnassign, assignCohortOpen, setAssignCohortOpen,
    editingLimit, setEditingLimit, limitValue, setLimitValue, limitError, setLimitError,
    assignmentStartDate, setAssignmentStartDate, scheduleError,
    students, myCohorts, filtered, pageRows, allPageSelected,
    toggleOne, toggleAll, saveLimit, saveDate,
  };
}
