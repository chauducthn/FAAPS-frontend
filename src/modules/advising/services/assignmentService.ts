import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { chunkArray, fetchAllPages } from '../../../shared/lib/fetchAllPages';
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
  AutoAssignResult,
  CohortAssignPreview,
  CohortAssignResult,
  CohortAutoAssignResponse,
  CohortPoolAdvisor,
  SmartBatchAssignResult,
  UnassignAllResult,
  UnassignedStudent,
} from '../../management/types/admin';

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

  getAssigned: async (
    params: PageParams & { advisorId?: string; cohortId?: string; majorCode?: string },
  ): Promise<AdminPage<AssignmentStudent>> =>
    (await apiClient.get<AdminPage<AssignmentStudent>>(`${BASE}/assigned`, { params })).data,

  getUnassigned: async (params: PageParams & { cohortId?: string; hasPendingRequest?: boolean }): Promise<AdminPage<UnassignedStudent>> =>
    (await apiClient.get<AdminPage<UnassignedStudent>>(`${BASE}/unassigned`, { params })).data,

  /** All students of one cohort (assigned and unassigned), paged and searchable. */
  getCohortStudents: async (params: PageParams & { cohortId: string; unassignedOnly?: boolean }): Promise<AdminPage<AssignmentStudent>> =>
    (await apiClient.get<AdminPage<AssignmentStudent>>(`${BASE}/students`, { params })).data,

  /** Every active advisor with its current load (activeStudents) and limit. */
  getAdvisors: async (): Promise<AssignmentAdvisor[]> =>
    (await apiClient.get<AssignmentAdvisor[]>(`${BASE}/advisors`)).data,

  getAdvisorCohortsPage: async (params: PageParams & { cohortId?: string }): Promise<AdminPage<AdvisorCohortRow>> =>
    (await apiClient.get<AdminPage<AdvisorCohortRow>>(`${BASE}/advisors/by-cohort`, { params })).data,

  /** The by-cohort rows are paged one row per advisor and cohort, so grouping per advisor needs every page. */
  getAllAdvisorCohorts: async (): Promise<AdvisorCohortRow[]> =>
    fetchAllPages((page, size) => assignmentService.getAdvisorCohortsPage({ page, size })),

  getAdvisorAssignment: async (advisorId: string): Promise<AdvisorAssignmentDetail> =>
    (await apiClient.get<AdvisorAssignmentDetail>(`${BASE}/advisors/${advisorId}`)).data,

  getCohortPool: async (cohortId: string): Promise<CohortPoolAdvisor[]> =>
    (await apiClient.get<CohortPoolAdvisor[]>(`${BASE}/cohorts/${cohortId}/advisors`)).data,

  getStudentHistory: async (studentId: string): Promise<AssignmentHistoryRecord[]> =>
    (await apiClient.get<AssignmentHistoryRecord[]>(`${BASE}/students/${studentId}/history`)).data,

  // ---- configuration
  replaceCohortPool: async (cohortId: string, advisorIds: string[]): Promise<CohortPoolAdvisor[]> =>
    (await apiClient.put<CohortPoolAdvisor[]>(`${BASE}/cohorts/${cohortId}/advisors`, { advisorIds }, { headers: await getCsrfHeaders() })).data,

  replaceAdvisorCohorts: async (advisorId: string, cohortIds: string[]): Promise<{ advisorId: string; cohorts: number }> =>
    (await apiClient.put<{ advisorId: string; cohorts: number }>(`${BASE}/advisors/${advisorId}/cohorts`, { cohortIds }, { headers: await getCsrfHeaders() })).data,

  bulkAssignAdvisorCohorts: async (advisorIds: string[], cohortIds: string[]) => {
    let advisors = 0;
    for (const batch of chunkArray(advisorIds, 100)) {
      const res = await post<{ advisors: number; cohorts: number }>(`${BASE}/advisors/cohorts`, { advisorIds: batch, cohortIds });
      advisors += res.advisors;
    }
    return { advisors, cohorts: cohortIds.length };
  },

  autoAssignAdvisorCohorts: async (advisorIds: string[]) => {
    let assigned = 0;
    let skippedAlreadyAssigned = 0;
    let skippedNoNeed = 0;
    let cohortsConfigured = 0;
    for (const batch of chunkArray(advisorIds, 500)) {
      const res = await post<{
        assigned: number;
        skippedAlreadyAssigned: number;
        skippedNoNeed: number;
        cohortsConfigured: number;
      }>(`${BASE}/advisors/cohorts/auto`, { advisorIds: batch });
      assigned += res.assigned;
      skippedAlreadyAssigned += res.skippedAlreadyAssigned;
      skippedNoNeed += res.skippedNoNeed;
      cohortsConfigured += res.cohortsConfigured;
    }
    return { assigned, skippedAlreadyAssigned, skippedNoNeed, cohortsConfigured };
  },

  updateLimit: async (advisorId: string, maxAdvisees: number): Promise<AdvisorLimitResult> =>
    (await apiClient.patch<AdvisorLimitResult>(`${BASE}/advisors/${advisorId}/limit`, { maxAdvisees }, { headers: await getCsrfHeaders() })).data,

  // ---- assigning students (single / bulk / reassignment)
  previewAssign: (studentIds: string[], advisorId: string) =>
    post<AssignPreview>(`${BASE}/assign/preview`, { studentIds, advisorId }),

  assign: (studentIds: string[], advisorId: string, acknowledgeAppointmentCancellation: boolean, notes?: string) =>
    post<AssignResult>(`${BASE}/assign`, { studentIds, advisorId, acknowledgeAppointmentCancellation, notes: notes || undefined }),

  previewUnassign: (studentIds: string[]) =>
    post<AssignPreview>(`${BASE}/unassign/preview`, { studentIds }),

  unassign: (studentIds: string[], acknowledgeAppointmentCancellation: boolean, notes?: string) =>
    post<{ unassigned: number }>(`${BASE}/unassign`, { studentIds, acknowledgeAppointmentCancellation, notes: notes || undefined }),

  // ---- one advisor takes the unassigned students of a cohort
  previewCohortAssign: (cohortId: string, advisorId: string) =>
    post<CohortAssignPreview>(`${BASE}/cohorts/${cohortId}/preview`, { advisorId }),

  assignCohort: (cohortId: string, advisorId: string, notes?: string) =>
    post<CohortAssignResult>(`${BASE}/cohorts/${cohortId}/assign`, { advisorId, notes: notes || undefined }),

  // ---- auto assign across the cohort's advisor pool
  previewAutoAssign: (cohortId: string, advisorIds?: string[], allowOverLimit = false) =>
    post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/preview`, { cohortId, advisorIds, allowOverLimit }),

  confirmAutoAssign: (cohortId: string, advisorIds?: string[], notes?: string, allowOverLimit = false) =>
    post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/confirm`, {
      cohortId,
      advisorIds,
      notes: notes || undefined,
      allowOverLimit,
    }),

  smartAutoAssignAll: (input: {
    cohortIds?: string[];
    autoConfigurePools?: boolean;
    allowOverLimit?: boolean;
    notes?: string;
  }) => post<SmartBatchAssignResult>(`${BASE}/auto-assign/smart-all`, input),

  unassignAll: (input: { advisorIds?: string[]; clearPools?: boolean; notes?: string }) =>
    post<UnassignAllResult>(`${BASE}/unassign-all`, input),

  /** Assign selected students through each cohort's configured advisor pool. */
  autoAssignStudents: async (students: Pick<UnassignedStudent, 'id' | 'cohortId'>[]): Promise<AutoAssignResult> => {
    const byCohort = new Map<string, string[]>();
    for (const student of students) {
      byCohort.set(student.cohortId, [...(byCohort.get(student.cohortId) ?? []), student.id]);
    }
    const results = await Promise.all(
      [...byCohort].map(([cohortId, studentIds]) =>
        post<CohortAutoAssignResponse>(`${BASE}/auto-assign/cohort/confirm`, { cohortId, studentIds }),
      ),
    );
    return { assigned: results.reduce((total, result) => total + result.assigned, 0), allocation: {} };
  },
};

export const notificationService = {
  list: async (params: { unreadOnly?: boolean; page?: number; size?: number } = {}): Promise<AdminPage<AdminNotification>> =>
    (await apiClient.get<AdminPage<AdminNotification>>('/admin/notifications', { params })).data,

  unreadCount: async (): Promise<number> =>
    (await apiClient.get<{ unreadCount: number }>('/admin/notifications/unread-count')).data.unreadCount,

  markRead: async (id: string): Promise<{ updated: boolean }> =>
    (await apiClient.patch<{ updated: boolean }>(`/admin/notifications/${id}/read`, null, { headers: await getCsrfHeaders() })).data,

  markAllRead: async (): Promise<{ updated: number }> =>
    (await apiClient.patch<{ updated: number }>('/admin/notifications/read-all', null, { headers: await getCsrfHeaders() })).data,

  clearAll: async (): Promise<{ deleted: number }> =>
    (await apiClient.delete<{ deleted: number }>('/admin/notifications', { headers: await getCsrfHeaders() })).data,
};
