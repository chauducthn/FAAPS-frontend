import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../../services/assignmentService';

const KEY = ['admin', 'assignments'] as const;
const cohortStudentsKey = (cohort: string) => [...KEY, 'cohort-students', cohort] as const;

export const useAssignmentAdvisors = () =>
  useQuery({ queryKey: [...KEY, 'advisors'], queryFn: assignmentService.getAdvisors });

export const useAssignmentCohorts = () =>
  useQuery({ queryKey: [...KEY, 'cohorts'], queryFn: assignmentService.getCohorts });

export const useCohortStudents = (cohort: string | undefined) =>
  useQuery({
    queryKey: cohortStudentsKey(cohort ?? ''),
    queryFn: () => assignmentService.getCohortStudents(cohort as string),
    enabled: !!cohort,
  });

/** Students of every cohort, used to compute assigned/unassigned totals for the overview. */
export const useCohortStudentLists = (cohorts: string[]) =>
  useQueries({
    queries: cohorts.map((cohort) => ({
      queryKey: cohortStudentsKey(cohort),
      queryFn: () => assignmentService.getCohortStudents(cohort),
    })),
  });

export const useAdvisorAssignment = (advisorId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'advisor', advisorId],
    queryFn: () => assignmentService.getAdvisorAssignment(advisorId as string),
    enabled: !!advisorId,
  });

export const useStudentHistory = (studentId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'history', studentId],
    queryFn: () => assignmentService.getStudentHistory(studentId as string),
    enabled: !!studentId,
  });

export const useAssignStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { studentIds: string[]; advisorId: string }) =>
      assignmentService.assign(input.studentIds, input.advisorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const usePreviewAutoAssign = () =>
  useMutation({
    mutationFn: (input: { cohort: string; advisorIds: string[] }) =>
      assignmentService.previewAutoAssign(input.cohort, input.advisorIds),
  });

export const useConfirmAutoAssign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { cohort: string; advisorIds: string[] }) =>
      assignmentService.confirmAutoAssign(input.cohort, input.advisorIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
