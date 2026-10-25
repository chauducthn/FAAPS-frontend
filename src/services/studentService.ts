// src/services/studentService.ts
// API cho Student Portal.
// Khi scope mock "portal" đang bật, các hàm trả về dữ liệu giả (src/mocks/advising.ts) để UI chạy được khi backend chưa có endpoint.

import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import { isMockPortalEnabled } from '../mocks';
import {
  mockCreateAdvisingRequest,
  mockGetMyAdvisingRequests,
  mockGetMyAdvisor,
  mockGetMyProfile,
  mockGetNotifications,
  mockMarkAllNotificationsRead,
  mockMarkNotificationRead,
} from '../mocks/advising';
import type { Page } from '../types/api';
import type {
  AdvisorInfo,
  AdvisingRequest,
  CreateAdvisingRequestDto,
  StudentNotification,
  StudentProfile,
} from '../types/advising';

export const studentService = {
  /** Hồ sơ học tập của chính sinh viên. */
  getMyProfile: async (): Promise<StudentProfile> => {
    if (isMockPortalEnabled()) return mockGetMyProfile();
    const { data } = await apiClient.get<StudentProfile>('/student/profile');
    return data;
  },

  /** Cố vấn phụ trách (student_advisor_assignments.is_primary = true). null nếu chưa được phân công. */
  getMyAdvisor: async (): Promise<AdvisorInfo | null> => {
    if (isMockPortalEnabled()) return mockGetMyAdvisor();
    const { data } = await apiClient.get<AdvisorInfo | null>('/student/advisor');
    return data ?? null;
  },

  /** Thông báo của chính sinh viên. */
  getNotifications: async (
    params: { unreadOnly?: boolean; page?: number; size?: number } = {},
  ): Promise<Page<StudentNotification>> => {
    if (isMockPortalEnabled()) return mockGetNotifications(params);
    const { data } = await apiClient.get<Page<StudentNotification>>('/student/notifications', {
      params,
    });
    return data;
  },

  /** Đánh dấu 1 thông báo đã đọc. */
  markNotificationRead: async (id: string): Promise<{ updated: boolean }> => {
    if (isMockPortalEnabled()) return mockMarkNotificationRead(id);
    const { data } = await apiClient.patch<{ updated: boolean }>(
      `/student/notifications/${id}/read`,
      null,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Đánh dấu toàn bộ thông báo đã đọc. */
  markAllNotificationsRead: async (): Promise<{ updated: number }> => {
    if (isMockPortalEnabled()) return mockMarkAllNotificationsRead();
    const { data } = await apiClient.patch<{ updated: number }>(
      '/student/notifications/read-all',
      null,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Các yêu cầu tư vấn của chính sinh viên. */
  getMyAdvisingRequests: async (): Promise<AdvisingRequest[]> => {
    if (isMockPortalEnabled()) return mockGetMyAdvisingRequests();
    const { data } = await apiClient.get<AdvisingRequest[]>('/student/advising-requests');
    return data ?? [];
  },

  /** Gửi yêu cầu tư vấn mới. */
  createAdvisingRequest: async (body: CreateAdvisingRequestDto): Promise<AdvisingRequest> => {
    if (isMockPortalEnabled()) return mockCreateAdvisingRequest(body);
    const { data } = await apiClient.post<AdvisingRequest>('/student/advising-requests', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },
};
