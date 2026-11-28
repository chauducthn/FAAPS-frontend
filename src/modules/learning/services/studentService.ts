// src/services/studentService.ts
// API cho Student Portal.
// Student Portal uses the real backend endpoints.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { Page } from '../../../shared/types/api';
import type {
  AdvisorInfo,
  AdvisingRequest,
  AdvisingRequestDetail,
  CreateAdvisingRequestDto,
  StudentNotification,
  StudentProfile,
} from '../../advising/types/advising';

export const studentService = {
  /** Hồ sơ học tập của chính sinh viên. */
  getMyProfile: async (): Promise<StudentProfile> => {
    const { data } = await apiClient.get<StudentProfile>('/student/profile');
    return data;
  },

  /** Cố vấn phụ trách (student_advisor_assignments.is_primary = true). null nếu chưa được phân công. */
  getMyAdvisor: async (): Promise<AdvisorInfo | null> => {
    const { data } = await apiClient.get<AdvisorInfo | null>('/student/advisor');
    return data ?? null;
  },

  /** Thông báo của chính sinh viên. */
  getNotifications: async (
    params: { unreadOnly?: boolean; page?: number; size?: number } = {},
  ): Promise<Page<StudentNotification>> => {
    const { data } = await apiClient.get<Page<StudentNotification>>('/student/notifications', {
      params,
    });
    return data;
  },

  getUnreadNotificationCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ unreadCount: number }>(
      '/student/notifications/unread-count',
    );
    return data.unreadCount;
  },

  /** Đánh dấu 1 thông báo đã đọc. */
  markNotificationRead: async (id: string): Promise<{ updated: boolean }> => {
    const { data } = await apiClient.patch<{ updated: boolean }>(
      `/student/notifications/${id}/read`,
      null,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Đánh dấu toàn bộ thông báo đã đọc. */
  markAllNotificationsRead: async (): Promise<{ updated: number }> => {
    const { data } = await apiClient.patch<{ updated: number }>(
      '/student/notifications/read-all',
      null,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  clearAllNotifications: async (): Promise<{ deleted: number }> => {
    const { data } = await apiClient.delete<{ deleted: number }>('/student/notifications', {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  /** The student's own advising requests (the shared ticket queue, filtered to them). */
  getMyAdvisingRequests: async (): Promise<AdvisingRequest[]> => {
    const { data } = await apiClient.get<AdvisingRequest[]>('/student/advising-requests');
    return data ?? [];
  },

  /** Send a new advising request — it lands in the shared queue (PENDING). */
  createAdvisingRequest: async (body: CreateAdvisingRequestDto): Promise<AdvisingRequest> => {
    const { data } = await apiClient.post<AdvisingRequest>('/student/advising-requests', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  /** Detail of one of the student's tickets + all messages. */
  getAdvisingRequestDetail: async (id: string): Promise<AdvisingRequestDetail> => {
    const { data } = await apiClient.get<AdvisingRequestDetail>(`/student/advising-requests/${id}`);
    return data;
  },

  /** Reply to the advisor holding the ticket (only allowed while IN_PROGRESS). */
  sendAdvisingReply: async (id: string, content: string): Promise<AdvisingRequestDetail> => {
    const { data } = await apiClient.post<AdvisingRequestDetail>(
      `/student/advising-requests/${id}/messages`,
      { content },
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Cancel own ticket (student closes it before it is resolved). */
  cancelAdvisingRequest: async (id: string): Promise<AdvisingRequestDetail> => {
    const { data } = await apiClient.patch<AdvisingRequestDetail>(
      `/student/advising-requests/${id}/cancel`,
      null,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
