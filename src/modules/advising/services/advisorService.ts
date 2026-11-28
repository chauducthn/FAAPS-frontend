// Advisor Portal API: profile, advisees, notifications, plus the ticket queue from advisorTicketApi.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { Page } from '../../../shared/types/api';
import type { AcademicStatus, AdviseeStudent, StudentNotification } from '../types/advising';
import type { AcademicStudentProfile, Progress, TranscriptRow } from '../../academic/services/studentAcademicService';
import { advisorTicketApi } from './advisorTicketApi';

export type AdvisorStudentDetail = { profile: AcademicStudentProfile; progress: Progress; transcript: TranscriptRow[] };
export type AdvisorProfile = {
  id: string; advisorCode?: string | null; fullName: string; email: string; phone: string | null; specialization: string | null;
  /** Major Group the advisor is responsible for; set by the Admin, read-only here. */
  majorGroupId?: string | null; majorGroupCode?: string | null; majorGroupName?: string | null;
  status: string;
  /** Fields of the old fixed 1-1 advisor assignment; no longer shown in My Profile. */
  maxAdvisees?: number; activeAdvisees?: number; assignmentStartDate?: string | null;
};

/**
 * Kết quả kiểm tra điều kiện tốt nghiệp — `GET /advisor/students/{studentId}/graduation-check`.
 * `ojtStatus` là chuỗi do BE quyết định (NOT_STARTED / IN_PROGRESS / COMPLETED).
 */
export interface GraduationCheck {
  eligible: boolean;
  requiredCredits: number;
  earnedCredits: number;
  ojtStatus: string;
  unmetPrerequisites: string[];
}

export const advisorService = {
  getProfile: async (): Promise<AdvisorProfile> => {
    return (await apiClient.get<AdvisorProfile>('/advisor/profile')).data;
  },

  /** Writes the advisor-specific field only; the identity fields belong to the shared /api/profile endpoint. */
  updateSpecialization: async (specialization: string | null): Promise<AdvisorProfile> => {
    return (await apiClient.put<AdvisorProfile>('/advisor/profile/specialization', { specialization },
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

  /** Điều kiện tốt nghiệp — BE tự tính, không suy ra từ progress/transcript ở client. */
  getGraduationCheck: async (studentId: string): Promise<GraduationCheck> => {
    return (await apiClient.get<GraduationCheck>(`/advisor/students/${studentId}/graduation-check`)).data;
  },

  /** 5 thông báo mới nhất dùng cho dropdown chuông ở header. */
  getNotifications: async (): Promise<Page<StudentNotification>> => {
    return (await apiClient.get<Page<StudentNotification>>('/advisor/notifications',
      { params: { page: 0, size: 5 } })).data;
  },

  /**
   * Danh sách thông báo có phân trang + lọc "chỉ chưa đọc" — server-side.
   * BE: `GET /advisor/notifications?unreadOnly=&page=&size=`.
   */
  getNotificationList: async (params: {
    unreadOnly?: boolean;
    page?: number;
    size?: number;
  } = {}): Promise<Page<StudentNotification>> => {
    const { data } = await apiClient.get<Page<StudentNotification>>('/advisor/notifications', {
      params: {
        unreadOnly: params.unreadOnly ?? false,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    });
    return data;
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

  clearAllNotifications: async (): Promise<{ deleted: number }> => {
    return (await apiClient.delete<{ deleted: number }>('/advisor/notifications',
      { headers: await getCsrfHeaders() })).data;
  },

  ...advisorTicketApi,
};
