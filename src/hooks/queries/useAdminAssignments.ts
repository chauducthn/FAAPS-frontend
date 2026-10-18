import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentService, notificationService, type PageParams } from '../../services/assignmentService';

const KEY = ['admin', 'assignments'] as const;

export const useAssignmentSummary = () =>
  useQuery({ queryKey: [...KEY, 'summary'], queryFn: assignmentService.getSummary });

export const useUnassignedStudents = (params: PageParams & { cohortId?: string; hasPendingRequest?: boolean }) =>
  useQuery({
    queryKey: [...KEY, 'unassigned', params],
    queryFn: () => assignmentService.getUnassigned(params),
    placeholderData: keepPreviousData,
  });

export const useCohortStudents = (params: PageParams & { cohortId: string | undefined; unassignedOnly?: boolean }) =>
  useQuery({
    queryKey: [...KEY, 'cohort-students', params],
    queryFn: () => assignmentService.getCohortStudents({ ...params, cohortId: params.cohortId as string }),
    enabled: !!params.cohortId,
    placeholderData: keepPreviousData,
  });

export const useAssignmentAdvisors = () =>
  useQuery({ queryKey: [...KEY, 'advisors'], queryFn: assignmentService.getAdvisors });

export const useAdvisorCohortRows = () =>
  useQuery({ queryKey: [...KEY, 'advisors-by-cohort'], queryFn: assignmentService.getAllAdvisorCohorts });

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
    mutationFn: (input: { studentIds: string[]; advisorId: string }) => assignmentService.previewAssign(input.studentIds, input.advisorId),
  });

export const useAssignStudents = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { studentIds: string[]; advisorId: string; acknowledge: boolean; notes?: string }) =>
      assignmentService.assign(input.studentIds, input.advisorId, input.acknowledge, input.notes),
    onSuccess: invalidate,
  });
};

export const usePreviewCohortAssign = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; advisorId: string }) => assignmentService.previewCohortAssign(input.cohortId, input.advisorId),
  });

export const useAssignCohort = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorId: string; notes?: string }) =>
      assignmentService.assignCohort(input.cohortId, input.advisorId, input.notes),
    onSuccess: invalidate,
  });
};

export const usePreviewAutoAssign = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; advisorIds?: string[] }) => assignmentService.previewAutoAssign(input.cohortId, input.advisorIds),
  });

export const useConfirmAutoAssign = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorIds?: string[]; notes?: string }) =>
      assignmentService.confirmAutoAssign(input.cohortId, input.advisorIds, input.notes),
    onSuccess: invalidate,
  });
};

export const useReplaceCohortPool = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { cohortId: string; advisorIds: string[] }) => assignmentService.replaceCohortPool(input.cohortId, input.advisorIds),
    onSuccess: invalidate,
  });
};

export const useUpdateAdvisorLimit = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { advisorId: string; maxAdvisees: number }) => assignmentService.updateLimit(input.advisorId, input.maxAdvisees),
    onSuccess: invalidate,
  });
};

// ---- notifications (paged list, unread badge, mark read). Live updates arrive over the WebSocket.
const NOTIFICATIONS = ['admin', 'notifications'] as const;

export const useAdminNotifications = (page = 0, size = 20) =>
  useQuery({
    queryKey: [...NOTIFICATIONS, 'list', page, size],
    queryFn: () => notificationService.list({ page, size }),
    placeholderData: keepPreviousData,
  });

/** Unread count for the bell badge: a one-row page whose totalElements is the number of unread notifications. */
export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: [...NOTIFICATIONS, 'unread-count'],
    queryFn: async () => (await notificationService.list({ unreadOnly: true, page: 0, size: 1 })).totalElements,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS }),
  });
};
