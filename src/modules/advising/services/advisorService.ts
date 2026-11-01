// src/services/advisorService.ts
// API cho Advisor Portal — dùng backend thật, không còn nhánh mock.
//
// LƯU Ý SHAPE: theo Swagger, `GET /advisor/advising-requests` trả về mảng thô
// `AdvisingRequest[]` (KHÔNG phải object Page). Phân trang được thực hiện phía client.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { Page } from '../../../shared/types/api';
import type {
  AcademicStatus,
  AdviseeStudent,
  AdvisingRequest,
  AdvisingRequestStatus,
  UpdateAdvisingRequestStatusDto,
  StudentNotification,
} from '../types/advising';
import type { AcademicStudentProfile, Progress, TranscriptRow } from '../../academic/services/studentAcademicService';

export type AdvisorStudentDetail = { profile: AcademicStudentProfile; progress: Progress; transcript: TranscriptRow[] };
export type AdvisorProfile = { id: string; fullName: string; email: string; maxAdvisees: number; activeAdvisees: number; status: string; assignmentStartDate: string | null };

/** Lọc danh sách yêu cầu theo status và từ khoá (client-side). */
const filterRequests = (
  requests: AdvisingRequest[],
  params: { status?: AdvisingRequestStatus; search?: string },
): AdvisingRequest[] => {
  const keyword = params.search?.trim().toLowerCase();
  return requests.filter((request) => {
    if (params.status && request.status !== params.status) return false;
    if (!keyword) return true;
    return (
      request.title.toLowerCase().includes(keyword) ||
      request.studentName.toLowerCase().includes(keyword) ||
      (request.studentCode ?? '').toLowerCase().includes(keyword)
    );
  });
};

export const advisorService = {
  getProfile: async (): Promise<AdvisorProfile> => {
    return (await apiClient.get<AdvisorProfile>('/advisor/profile')).data;
  },

  updateProfile: async (fullName: string): Promise<AdvisorProfile> => {
    return (await apiClient.put<AdvisorProfile>('/advisor/profile', { fullName },
      { headers: await getCsrfHeaders() })).data;
  },

  /** Sinh viên được phân công cho advisor hiện tại (student_advisor_assignments.status = 'ACTIVE'). */
  getAdviseeStudents: async (
    params: { search?: string; status?: AcademicStatus | 'ALL'; page?: number; size?: number } = {},
  ): Promise<Page<AdviseeStudent>> => {
    const { data } = await apiClient.get<Page<AdviseeStudent>>('/advisor/students', { params });
    return data;
  },

  getStudentDetail: async (studentId: string): Promise<AdvisorStudentDetail> => {
    return (await apiClient.get<AdvisorStudentDetail>(`/advisor/students/${studentId}`)).data;
  },

  getNotifications: async (): Promise<Page<StudentNotification>> => {
    return (await apiClient.get<Page<StudentNotification>>('/advisor/notifications',
      { params: { page: 0, size: 8 } })).data;
  },

  getUnreadNotificationCount: async (): Promise<number> => {
    return (await apiClient.get<{ unreadCount: number }>('/advisor/notifications/unread-count')).data.unreadCount;
  },

  markNotificationRead: async (id: string): Promise<{ updated: boolean }> => {
    return (await apiClient.patch<{ updated: boolean }>(`/advisor/notifications/${id}/read`, null,
      { headers: await getCsrfHeaders() })).data;
  },

  markAllNotificationsRead: async (): Promise<{ updated: number }> => {
    return (await apiClient.patch<{ updated: number }>('/advisor/notifications/read-all', null,
      { headers: await getCsrfHeaders() })).data;
  },

  /**
   * Yêu cầu tư vấn mà advisor nhận xử lý.
   * API trả về mảng thô `AdvisingRequest[]` — lọc status/từ khoá và phân trang
   * đều do client đảm nhiệm nên không gửi tham số phân trang lên URL.
   */
  getAdvisingRequests: async (
    params: {
      status?: AdvisingRequestStatus;
      search?: string;
    } = {},
  ): Promise<AdvisingRequest[]> => {
    const { data } = await apiClient.get<AdvisingRequest[]>('/advisor/advising-requests');
    // Lọc phía client: API trả về toàn bộ danh sách.
    return filterRequests(data ?? [], params);
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
