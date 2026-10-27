// src/services/advisorService.ts
// API cho Advisor Portal.
// Advisor Portal uses the real backend endpoints.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { Page } from '../../../shared/types/api';
import type {
  AdviseeStudent,
  AdvisingRequest,
  AdvisingRequestStatus,
  UpdateAdvisingRequestStatusDto,
  StudentNotification,
} from '../types/advising';
import type { AcademicStudentProfile, Progress, TranscriptRow } from '../../academic/services/studentAcademicService';

export type AdvisorStudentDetail = { profile: AcademicStudentProfile; progress: Progress; transcript: TranscriptRow[] };
export type AdvisorProfile = { id: string; fullName: string; email: string; maxAdvisees: number;
  activeAdvisees: number; status: string; assignmentStartDate: string | null };

export const advisorService = {
  getProfile: async (): Promise<AdvisorProfile> =>
    (await apiClient.get<AdvisorProfile>('/advisor/profile')).data,
  updateProfile: async (fullName: string): Promise<AdvisorProfile> =>
    (await apiClient.put<AdvisorProfile>('/advisor/profile', { fullName },
      { headers: await getCsrfHeaders() })).data,
  /** Sinh viên được phân công cho advisor hiện tại (student_advisor_assignments.status = 'ACTIVE'). */
  getAdviseeStudents: async (
    params: { search?: string; page?: number; size?: number } = {},
  ): Promise<Page<AdviseeStudent>> => {
    const { data } = await apiClient.get<Page<AdviseeStudent>>('/advisor/students', { params });
    return data;
  },
  getStudentDetail: async (studentId: string): Promise<AdvisorStudentDetail> =>
    (await apiClient.get<AdvisorStudentDetail>(`/advisor/students/${studentId}`)).data,
  getNotifications: async (): Promise<Page<StudentNotification>> =>
    (await apiClient.get<Page<StudentNotification>>('/advisor/notifications',
      { params: { page: 0, size: 8 } })).data,
  getUnreadNotificationCount: async (): Promise<number> =>
    (await apiClient.get<{ unreadCount: number }>('/advisor/notifications/unread-count')).data.unreadCount,
  markNotificationRead: async (id: string): Promise<{ updated: boolean }> =>
    (await apiClient.patch<{ updated: boolean }>(`/advisor/notifications/${id}/read`, null,
      { headers: await getCsrfHeaders() })).data,
  markAllNotificationsRead: async (): Promise<{ updated: number }> =>
    (await apiClient.patch<{ updated: number }>('/advisor/notifications/read-all', null,
      { headers: await getCsrfHeaders() })).data,

  /** Yêu cầu tư vấn mà advisor nhận xử lý. */
  getAdvisingRequests: async (
    params: {
      status?: AdvisingRequestStatus;
      search?: string;
      page?: number;
      size?: number;
    } = {},
  ): Promise<Page<AdvisingRequest>> => {
    const { data } = await apiClient.get<Page<AdvisingRequest>>('/advisor/advising-requests', {
      params,
    });
    return data;
  },

  /** Chuyển trạng thái request: RESOLVED = Chấp nhận, CANCELLED = Từ chối. */
  updateRequestStatus: async (
    id: string,
    body: UpdateAdvisingRequestStatusDto,
  ): Promise<AdvisingRequest> => {
    const { data } = await apiClient.put<AdvisingRequest>(
      `/advisor/advising-requests/${id}/status`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
