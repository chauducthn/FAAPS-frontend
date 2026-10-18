import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type {
  AdminNotification,
  AdminPage,
  AdvisorAssignmentDetail,
  AdvisorCohortRow,
  AdvisorLimitResult,
  AssignPreview,
  AssignResult,
  AssignmentAdvisor,
  AssignmentHistoryRecord,
  AssignmentStudent,
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

/**
 * Paged responses carry items, page, size and totalElements. Some endpoints leave out totalPages,
 * so callers derive it from totalElements and size when they need it.
 */
export type PageParams = { page?: number; size?: number; search?: string };

export const assignmentService = {
  // ---- reads
  getSummary: async (): Promise<AssignmentSummary> => (await apiClient.get<AssignmentSummary>(`${BASE}/summary`)).data,

  getUnassigned: async (params: PageParams & { cohortId?: string; hasPendingRequest?: boolean }): Promise<AdminPage<UnassignedStudent>> =>
    (await apiClient.get<AdminPage<UnassignedStudent>>(`${BASE}/unassigned`, { params })).data,

  /** All students of one cohort (assigned and unassigned), paged and searchable. */
  getCohortStudents: async (params: PageParams & { cohortId: string; unassignedOnly?: boolean }): Promise<AdminPage<AssignmentStudent>> =>
    (await apiClient.get<AdminPage<AssignmentStudent>>(`${BASE}/students`, { params })).data,

  /** Every active advisor with its current load (activeStudents) and limit. */
  getAdvisors: async (): Promise<AssignmentAdvisor[]> => (await apiClient.get<AssignmentAdvisor[]>(`${BASE}/advisors`)).data,

  getAdvisorCohortsPage: async (params: PageParams & { cohortId?: string }): Promise<AdminPage<AdvisorCohortRow>> =>
    (await apiClient.get<AdminPage<AdvisorCohortRow>>(`${BASE}/advisors/by-cohort`, { params })).data,

  /** The by-cohort rows are paged one row per advisor and cohort, so grouping per advisor needs every page. */
  getAllAdvisorCohorts: async (): Promise<AdvisorCohortRow[]> => {
    const size = 100;
    const rows: AdvisorCohortRow[] = [];
    for (let page = 0; page < 50; page += 1) {
      const result = await assignmentService.getAdvisorCohortsPage({ page, size });
      rows.push(...result.items);
      if ((page + 1) * size >= result.totalElements) break;
    }
    return rows;
  },

  getAdvisorAssignment: async (advisorId: string): Promise<AdvisorAssignmentDetail> =>
    (await apiClient.get<AdvisorAssignmentDetail>(`${BASE}/advisors/${advisorId}`)).data,

  getCohortPool: async (cohortId: string): Promise<CohortPoolAdvisor[]> =>
    (await apiClient.get<CohortPoolAdvisor[]>(`${BASE}/cohorts/${cohortId}/advisors`)).data,

  getStudentHistory: async (studentId: string): Promise<AssignmentHistoryRecord[]> =>
    (await apiClient.get<AssignmentHistoryRecord[]>(`${BASE}/students/${studentId}/history`)).data,

  // ---- configuration
  replaceCohortPool: async (cohortId: string, advisorIds: string[]): Promise<CohortPoolAdvisor[]> =>
    (await apiClient.put<CohortPoolAdvisor[]>(`${BASE}/cohorts/${cohortId}/advisors`, { advisorIds }, { headers: await getCsrfHeaders() })).data,

  updateLimit: async (advisorId: string, maxAdvisees: number): Promise<AdvisorLimitResult> =>
    (await apiClient.patch<AdvisorLimitResult>(`${BASE}/advisors/${advisorId}/limit`, { maxAdvisees }, { headers: await getCsrfHeaders() })).data,

  // ---- assigning students (single / bulk / reassignment)
  previewAssign: (studentIds: string[], advisorId: string) => post<AssignPreview>(`${BASE}/assign/preview`, { studentIds, advisorId }),

  assign: (studentIds: string[], advisorId: string, acknowledgeAppointmentCancellation: boolean, notes?: string) =>
    post<AssignResult>(`${BASE}/assign`, { studentIds, advisorId, acknowledgeAppointmentCancellation, notes: notes || undefined }),

  // ---- one advisor takes the unassigned students of a cohort
  previewCohortAssign: (cohortId: string, advisorId: string) =>
    post<CohortAssignPreview>(`${BASE}/cohorts/${cohortId}/preview`, { advisorId }),

  assignCohort: (cohortId: string, advisorId: string, notes?: string) =>
    post<CohortAssignResult>(`${BASE}/cohorts/${cohortId}/assign`, { advisorId, notes: notes || undefined }),

  // ---- auto assign across the cohort's advisor pool
  previewAutoAssign: (cohortId: string, advisorIds?: string[]) =>
    post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/preview`, { cohortId, advisorIds }),

  confirmAutoAssign: (cohortId: string, advisorIds?: string[], notes?: string) =>
    post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/confirm`, { cohortId, advisorIds, notes: notes || undefined }),
};

export const notificationService = {
  list: async (params: { unreadOnly?: boolean; page?: number; size?: number } = {}): Promise<AdminPage<AdminNotification>> =>
    (await apiClient.get<AdminPage<AdminNotification>>('/admin/notifications', { params })).data,

  markRead: async (id: string): Promise<{ updated: boolean }> =>
    (await apiClient.patch<{ updated: boolean }>(`/admin/notifications/${id}/read`, null, { headers: await getCsrfHeaders() })).data,

  markAllRead: async (): Promise<{ updated: number }> =>
    (await apiClient.patch<{ updated: number }>('/admin/notifications/read-all', null, { headers: await getCsrfHeaders() })).data,
};
