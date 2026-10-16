import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type {
  AdvisorAssignmentDetail,
  AssignmentAdvisor,
  AssignmentCohort,
  AssignmentHistoryRecord,
  AssignmentStudent,
  AutoAssignPreview,
  AutoAssignResult,
} from '../types/admin';

export const assignmentService = {
  getAdvisors: async (): Promise<AssignmentAdvisor[]> =>
    (await apiClient.get<AssignmentAdvisor[]>('/admin/assignments/advisors')).data,

  getCohorts: async (): Promise<AssignmentCohort[]> =>
    (await apiClient.get<AssignmentCohort[]>('/admin/assignments/cohorts')).data,

  getCohortStudents: async (cohort: string, unassignedOnly = false): Promise<AssignmentStudent[]> =>
    (await apiClient.get<AssignmentStudent[]>('/admin/assignments/students', { params: { cohort, unassignedOnly } }))
      .data,

  getAdvisorAssignment: async (advisorId: string): Promise<AdvisorAssignmentDetail> =>
    (await apiClient.get<AdvisorAssignmentDetail>(`/admin/assignments/advisors/${advisorId}`)).data,

  getStudentHistory: async (studentId: string): Promise<AssignmentHistoryRecord[]> =>
    (await apiClient.get<AssignmentHistoryRecord[]>(`/admin/assignments/students/${studentId}/history`)).data,

  assign: async (studentIds: string[], advisorId: string): Promise<{ assigned: number }> =>
    (
      await apiClient.post<{ assigned: number }>(
        '/admin/assignments/assign',
        { studentIds, advisorId },
        { headers: await getCsrfHeaders() }
      )
    ).data,

  previewAutoAssign: async (cohort: string, advisorIds: string[]): Promise<AutoAssignPreview> =>
    (
      await apiClient.post<AutoAssignPreview>(
        '/admin/assignments/auto-assign/preview',
        { cohort, advisorIds },
        { headers: await getCsrfHeaders() }
      )
    ).data,

  confirmAutoAssign: async (cohort: string, advisorIds: string[]): Promise<AutoAssignResult> =>
    (
      await apiClient.post<AutoAssignResult>(
        '/admin/assignments/auto-assign/confirm',
        { cohort, advisorIds },
        { headers: await getCsrfHeaders() }
      )
    ).data,
};
