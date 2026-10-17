import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type {
  AdminNotification,
  AdvisorAssignmentDetail,
  AdvisorCohortRow,
  AdvisorLimitResult,
  AssignPreview,
  AssignResult,
  AssignmentAdvisor,
  AssignmentHistoryRecord,
  AssignmentSummary,
  CohortAssignPreview,
  CohortAssignResult,
  CohortAutoAssignResponse,
  CohortPoolAdvisor,
  UnassignedStudent,
} from '../types/admin';

const BASE = '/admin/assignments';

const post = async <T>(url: string, body: unknown): Promise<T> =>
  (await apiClient.post<T>(url, body, { headers: await getCsrfHeaders() })).data;

export const assignmentService = {
  // ---- reads
  getSummary: async (): Promise<AssignmentSummary> => (await apiClient.get<AssignmentSummary>(`${BASE}/summary`)).data,

  getUnassigned: async (cohortId?: string): Promise<UnassignedStudent[]> =>
    (await apiClient.get<UnassignedStudent[]>(`${BASE}/unassigned`, { params: cohortId ? { cohortId } : undefined })).data,

  /** Every active advisor with its current load (activeStudents) and limit. */
  getAdvisors: async (): Promise<AssignmentAdvisor[]> =>
    (await apiClient.get<AssignmentAdvisor[]>(`${BASE}/advisors`)).data,

  getAdvisorCohorts: async (): Promise<AdvisorCohortRow[]> =>
    (await apiClient.get<AdvisorCohortRow[]>(`${BASE}/advisors/by-cohort`)).data,

  getAdvisorAssignment: async (advisorId: string): Promise<AdvisorAssignmentDetail> =>
    (await apiClient.get<AdvisorAssignmentDetail>(`${BASE}/advisors/${advisorId}`)).data,

  getCohortPool: async (cohortId: string): Promise<CohortPoolAdvisor[]> =>
    (await apiClient.get<CohortPoolAdvisor[]>(`${BASE}/cohorts/${cohortId}/advisors`)).data,

  getStudentHistory: async (studentId: string): Promise<AssignmentHistoryRecord[]> =>
    (await apiClient.get<AssignmentHistoryRecord[]>(`${BASE}/students/${studentId}/history`)).data,

  // ---- configuration
  replaceCohortPool: async (cohortId: string, advisorIds: string[]): Promise<CohortPoolAdvisor[]> =>
    (await apiClient.put<CohortPoolAdvisor[]>(`${BASE}/cohorts/${cohortId}/advisors`, { advisorIds }, { headers: await getCsrfHeaders() }))
      .data,

  updateLimit: async (advisorId: string, maxAdvisees: number): Promise<AdvisorLimitResult> =>
    (await apiClient.patch<AdvisorLimitResult>(`${BASE}/advisors/${advisorId}/limit`, { maxAdvisees }, { headers: await getCsrfHeaders() }))
      .data,

  // ---- assigning students (single / bulk / reassignment)
  // The backend rejects this request (400) unless the acknowledgement flag is present, even though a preview never cancels anything.
  previewAssign: (studentIds: string[], advisorId: string) =>
    post<AssignPreview>(`${BASE}/assign/preview`, { studentIds, advisorId, acknowledgeAppointmentCancellation: false }),

  assign: (studentIds: string[], advisorId: string, acknowledgeAppointmentCancellation: boolean) =>
    post<AssignResult>(`${BASE}/assign`, { studentIds, advisorId, acknowledgeAppointmentCancellation }),

  // ---- one advisor takes the unassigned students of a cohort
  previewCohortAssign: (cohortId: string, advisorId: string) =>
    post<CohortAssignPreview>(`${BASE}/cohorts/${cohortId}/preview`, { advisorId }),

  assignCohort: (cohortId: string, advisorId: string) =>
    post<CohortAssignResult>(`${BASE}/cohorts/${cohortId}/assign`, { advisorId }),

  // ---- auto assign across the cohort's advisor pool
  previewAutoAssign: (cohortId: string, advisorIds?: string[]) =>
    post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/preview`, { cohortId, advisorIds }),

  confirmAutoAssign: (cohortId: string, advisorIds?: string[]) =>
    post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/confirm`, { cohortId, advisorIds }),
};

export const notificationService = {
  list: async (unreadOnly = false): Promise<AdminNotification[]> =>
    (await apiClient.get<AdminNotification[]>('/admin/notifications', { params: { unreadOnly } })).data,

  markRead: async (id: string): Promise<{ updated: boolean }> =>
    (await apiClient.patch<{ updated: boolean }>(`/admin/notifications/${id}/read`, null, { headers: await getCsrfHeaders() })).data,
};
