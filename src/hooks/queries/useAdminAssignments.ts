import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentService, notificationService } from '../../services/assignmentService';

const KEY = ['admin', 'assignments'] as const;

export const useAssignmentSummary = () =>
  useQuery({ queryKey: [...KEY, 'summary'], queryFn: assignmentService.getSummary });

export const useUnassignedStudents = (cohortId?: string) =>
  useQuery({ queryKey: [...KEY, 'unassigned', cohortId ?? 'all'], queryFn: () => assignmentService.getUnassigned(cohortId) });

export const useAssignmentAdvisors = () =>
  useQuery({ queryKey: [...KEY, 'advisors'], queryFn: assignmentService.getAdvisors });

export const useAdvisorCohortRows = () =>
  useQuery({ queryKey: [...KEY, 'advisors-by-cohort'], queryFn: assignmentService.getAdvisorCohorts });

export const useAdvisorAssignment = (advisorId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'advisor', advisorId],
    queryFn: () => assignmentService.getAdvisorAssignment(advisorId as string),
    enabled: !!advisorId,
  });

export const useCohortPool = (cohortId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'pool', cohortId],
    queryFn: () => assignmentService.getCohortPool(cohortId as string),
    enabled: !!cohortId,
  });

export const useStudentHistory = (studentId: string | undefined) =>
  useQuery({
    queryKey: [...KEY, 'history', studentId],
    queryFn: () => assignmentService.getStudentHistory(studentId as string),
    enabled: !!studentId,
  });

/** Everything that depends on who is assigned to whom (and the bell badge) must refresh after a change. */
const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    qc.invalidateQueries({ queryKey: ['admin', 'appointments'] });
  };
};

export const usePreviewAssign = () =>
  useMutation({
    mutationFn: (input: { studentIds: string[]; advisorId: string }) =>
      assignmentService.previewAssign(input.studentIds, input.advisorId),
  });

export const useAssignStudents = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { studentIds: string[]; advisorId: string; acknowledge: boolean }) =>
      assignmentService.assign(input.studentIds, input.advisorId, input.acknowledge),
    onSuccess: invalidate,
  });
};

export const usePreviewCohortAssign = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; advisorId: string }) =>
      assignmentService.previewCohortAssign(input.cohortId, input.advisorId),
  });

export const useAssignCohort = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorId: string }) =>
      assignmentService.assignCohort(input.cohortId, input.advisorId),
    onSuccess: invalidate,
  });
};

export const usePreviewAutoAssign = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; advisorIds?: string[] }) =>
      assignmentService.previewAutoAssign(input.cohortId, input.advisorIds),
  });

export const useConfirmAutoAssign = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorIds?: string[] }) =>
      assignmentService.confirmAutoAssign(input.cohortId, input.advisorIds),
    onSuccess: invalidate,
  });
};

export const useReplaceCohortPool = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorIds: string[] }) =>
      assignmentService.replaceCohortPool(input.cohortId, input.advisorIds),
    onSuccess: invalidate,
  });
};

export const useUpdateAdvisorLimit = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorId: string; maxAdvisees: number }) =>
      assignmentService.updateLimit(input.advisorId, input.maxAdvisees),
    onSuccess: invalidate,
  });
};

export const useAdminNotifications = () =>
  useQuery({
    queryKey: ['admin', 'notifications', 'list'],
    queryFn: () => notificationService.list(false),
    refetchInterval: 30_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
  });
};
