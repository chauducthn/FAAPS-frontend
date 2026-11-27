import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { assignmentService, type PageParams } from '../../../advising/services/assignmentService';

export {
  useAdminNotifications,
  useClearAllNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from './useAdminNotifications';

export {
  useAssignCohort,
  useAssignStudents,
  useAutoAssignAdvisorCohorts,
  useAutoAssignStudents,
  useBulkAssignAdvisorCohorts,
  useConfirmAutoAssign,
  usePreviewAssign,
  usePreviewAutoAssign,
  usePreviewCohortAssign,
  usePreviewUnassign,
  useReplaceAdvisorCohorts,
  useReplaceCohortPool,
  useSmartAutoAssignAll,
  useUnassignAll,
  useUnassignStudents,
  useUpdateAdvisorLimit,
} from './useAdminAssignmentMutations';

const KEY = ['admin', 'assignments'] as const;

export const useAssignmentSummary = () =>
  useQuery({ queryKey: [...KEY, 'summary'], queryFn: assignmentService.getSummary });

export const useAssignedStudents = (
  params: PageParams & { advisorId?: string; cohortId?: string; cohort?: string; majorCode?: string },
  enabled = true,
) =>
  useQuery({
    queryKey: [...KEY, 'assigned', params],
    queryFn: () => assignmentService.getAssigned(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useUnassignedStudents = (params: PageParams & { cohortId?: string; cohort?: string; hasPendingRequest?: boolean }) =>
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
