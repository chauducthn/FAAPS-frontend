// src/services/advisorService.ts
// API cho Advisor Portal.
//
// Khi mock advisor đang bật (mặc định ở dev), các hàm đọc/ghi chạy trên mock
// store in-memory nên mọi thao tác cập nhật UI ngay lập tức (xem
// `../mocks/advisorMockApi.ts`). Tắt mock bằng `VITE_MOCK_ADVISOR=false`.
//
// LƯU Ý SHAPE: theo Swagger, `GET /advisor/advising-requests` trả về mảng thô
// `AdvisingRequest[]` (KHÔNG phải object Page). Phân trang được thực hiện phía client.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { isAdvisorMockEnabled, mockDelay } from '../../../shared/lib/mockMode';
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
import {
  mockGetAdviseeStudents,
  mockGetAdvisorNotifications,
  mockGetAdvisorProfile,
  mockGetAdvisingRequests,
  mockGetStudentDetail,
  mockGetUnreadNotificationCount,
  mockMarkAllNotificationsRead,
  mockMarkNotificationRead,
  mockUpdateAdvisorProfile,
  mockUpdateRequestStatus,
} from '../mocks/advisorMockApi';

export type AdvisorStudentDetail = { profile: AcademicStudentProfile; progress: Progress; transcript: TranscriptRow[] };
export type AdvisorProfile = { id: string; fullName: string; email: string; maxAdvisees: number; activeAdvisees: number; status: string; assignmentStartDate: string | null };

/** Lọc danh sách yêu cầu theo status và từ khoá (client-side). */
const filterRequests = (
  requests: AdvisingRequest[],
  params: { status?: AdvisingRequestStatus; search?: string },
): AdvisingRequest[] => {
  const keyword = params.search?.trim().toLowerCase();
  return requests.filter((request) => {
    // "Resolved" gộp cả request đã chấp nhận (RESOLVED) và đã từ chối
    // (CANCELLED): cả hai đều đã đóng nên không còn việc cho advisor xử lý.
    if (params.status === 'RESOLVED') {
      if (request.status !== 'RESOLVED' && request.status !== 'CANCELLED') return false;
    } else if (params.status && request.status !== params.status) {
      return false;
    }
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
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetAdvisorProfile();
    }
    return (await apiClient.get<AdvisorProfile>('/advisor/profile')).data;
  },

  updateProfile: async (fullName: string): Promise<AdvisorProfile> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockUpdateAdvisorProfile(fullName);
    }
    return (await apiClient.put<AdvisorProfile>('/advisor/profile', { fullName },
      { headers: await getCsrfHeaders() })).data;
  },

  /** Sinh viên được phân công cho advisor hiện tại (student_advisor_assignments.status = 'ACTIVE'). */
  getAdviseeStudents: async (
    params: { search?: string; status?: AcademicStatus | 'ALL'; page?: number; size?: number } = {},
  ): Promise<Page<AdviseeStudent>> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetAdviseeStudents(params);
    }
    const { data } = await apiClient.get<Page<AdviseeStudent>>('/advisor/students', { params });
    return data;
  },

  getStudentDetail: async (studentId: string): Promise<AdvisorStudentDetail> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetStudentDetail(studentId);
    }
    return (await apiClient.get<AdvisorStudentDetail>(`/advisor/students/${studentId}`)).data;
  },

  getNotifications: async (): Promise<Page<StudentNotification>> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetAdvisorNotifications();
    }
    return (await apiClient.get<Page<StudentNotification>>('/advisor/notifications',
      { params: { page: 0, size: 8 } })).data;
  },

  getUnreadNotificationCount: async (): Promise<number> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetUnreadNotificationCount();
    }
    return (await apiClient.get<{ unreadCount: number }>('/advisor/notifications/unread-count')).data.unreadCount;
  },

  markNotificationRead: async (id: string): Promise<{ updated: boolean }> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockMarkNotificationRead(id);
    }
    return (await apiClient.patch<{ updated: boolean }>(`/advisor/notifications/${id}/read`, null,
      { headers: await getCsrfHeaders() })).data;
  },

  markAllNotificationsRead: async (): Promise<{ updated: number }> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockMarkAllNotificationsRead();
    }
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
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return filterRequests(mockGetAdvisingRequests(), params);
    }
    const { data } = await apiClient.get<AdvisingRequest[]>('/advisor/advising-requests');
    // Lọc phía client: API trả về toàn bộ danh sách.
    return filterRequests(data ?? [], params);
  },

  /** Chuyển trạng thái request: RESOLVED = Chấp nhận, CANCELLED = Từ chối. */
  updateRequestStatus: async (
    id: string,
    body: UpdateAdvisingRequestStatusDto,
  ): Promise<AdvisingRequest> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockUpdateRequestStatus(id, body);
    }
    const { data } = await apiClient.put<AdvisingRequest>(
      `/advisor/advising-requests/${id}/status`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
