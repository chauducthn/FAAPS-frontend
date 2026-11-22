// src/services/advisorService.ts
// API cho Advisor Portal.
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
export type AdvisorProfile = { id: string; fullName: string; email: string; phone: string | null; specialization: string | null; maxAdvisees: number; activeAdvisees: number; status: string; assignmentStartDate: string | null };

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

/**
 * BE yêu cầu `resolutionSummary` non-blank cho MỌI lần chuyển trạng thái request
 * (xem `BE_BACKLOG.md` → "Ràng buộc kỹ thuật bắt buộc cho BE").
 *
 * Thao tác "Mark in progress" không có ô nhập nội dung, nên default được gắn ở tầng
 * service — body mà toast đọc vẫn giữ nguyên (không có `resolutionSummary`) nên
 * phân biệt "Request rejected" vs "Request is now in progress" không bị ảnh hưởng.
 */
export const DEFAULT_RESOLUTION_SUMMARY = 'Your advisor is now processing this request.';

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
      request.title?.toLowerCase().includes(keyword) ||
      request.studentName?.toLowerCase().includes(keyword) ||
      (request.studentCode ?? '').toLowerCase().includes(keyword)
    );
  });
};

export const advisorService = {
  getProfile: async (): Promise<AdvisorProfile> => {
    return (await apiClient.get<AdvisorProfile>('/advisor/profile')).data;
  },

  updateProfile: async (input: Pick<AdvisorProfile, 'fullName' | 'phone' | 'specialization'>): Promise<AdvisorProfile> => {
    return (await apiClient.put<AdvisorProfile>('/advisor/profile', input,
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

  /** Chuyển trạng thái request: RESOLVED = Chấp nhận, IN_PROGRESS = Từ chối (kèm lý do). */
  updateRequestStatus: async (
    id: string,
    body: UpdateAdvisingRequestStatusDto,
  ): Promise<AdvisingRequest> => {
    // BE validate `resolutionSummary` non-blank cho mọi lần chuyển trạng thái.
    // Đảm bảo payload luôn có giá trị ⇒ không bao giờ nhận 400 vì thiếu trường này.
    const payload: UpdateAdvisingRequestStatusDto = {
      ...body,
      resolutionSummary: body.resolutionSummary?.trim()
        ? body.resolutionSummary.trim()
        : DEFAULT_RESOLUTION_SUMMARY,
    };
    const { data } = await apiClient.put<AdvisingRequest>(
      `/advisor/advising-requests/${id}/status`,
      payload,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
