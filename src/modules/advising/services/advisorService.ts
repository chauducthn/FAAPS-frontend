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
  AdvisingRequestDetail,
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
 * Lọc danh sách ticket theo status và từ khoá (client-side).
 *
 * `status` = 'RESOLVED' gộp cả RESOLVED (đã đóng) và CANCELLED (SV hủy).
 * Không có filter theo advisor ở đây — xem `filterByOwner` trong RequestListTable.
 */
const filterRequests = (
  requests: AdvisingRequest[],
  params: { status?: AdvisingRequestStatus; search?: string },
): AdvisingRequest[] => {
  const keyword = params.search?.trim().toLowerCase();
  return requests.filter((request) => {
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

  /**
   * Danh sách ticket yêu cầu tư vấn.
   *
   * API trả về mảng thô `AdvisingRequest[]` — lọc status/từ khoá và phân trang
   * đều do client đảm nhiệm nên không gửi tham số phân trang lên URL.
   *
   * QUAN TRỌNG (hệ thống ticket):
   *   • KHÔNG bao giờ gửi `advisorId` cho tab "Chờ xử lý" (PENDING) — mọi cố vấn
   *     đều phải thấy toàn bộ ticket đang chờ trong hàng đợi.
   *   • `advisorId` chỉ được truyền khi lọc "Đang xử lý" (IN_PROGRESS) và chỉ
   *     với mục đích xem ticket của chính mình.
   */
  getAdvisingRequests: async (
    params: {
      status?: AdvisingRequestStatus;
      search?: string;
      /** Chỉ dùng cho tab IN_PROGRESS — lọc theo cố vấn đang giữ ticket. */
      advisorId?: string | null;
    } = {},
  ): Promise<AdvisingRequest[]> => {
    // PENDING / RESOLVED: không gửi bất kỳ filter cố vấn nào — cố vấn nào cũng
    // phải thấy ticket trong hàng đợi chung.
    const advisorId =
      params.status === 'IN_PROGRESS' && params.advisorId ? params.advisorId : undefined;

    const { data } = await apiClient.get<AdvisingRequest[]>('/advisor/advising-requests', {
      params: advisorId ? { advisorId } : undefined,
    });
    // Lọc phía client: API trả về toàn bộ danh sách.
    return filterRequests(data ?? [], params);
  },

  /**
   * Chi tiết 1 ticket + toàn bộ tin nhắn: `GET /advisor/advising-requests/{id}`.
   * Dùng cho màn hình chat của cố vấn.
   */
  getRequestDetail: async (id: string): Promise<AdvisingRequestDetail> => {
    return (await apiClient.get<AdvisingRequestDetail>(`/advisor/advising-requests/${id}`)).data;
  },

/**
 * Chuyển trạng thái ticket: `PATCH /advisor/advising-requests/{id}/status`.
 *
 * Ticket system (không phải chat 1-1 được assign):
 *   PENDING     → IN_PROGRESS : cố vấn bấm "Claim request" (nhận xử lý).
 *   IN_PROGRESS → RESOLVED    : cố vấn xử lý xong, bấm "Resolve request" (đóng yêu cầu).
 *
 * `resolutionSummary` CHỈ được gửi khi đóng yêu cầu (RESOLVED). Thao tác claim
 * gửi đúng `{ status: 'IN_PROGRESS' }` — không có field nào khác.
 */
updateRequestStatus: async (
  id: string,
  body: UpdateAdvisingRequestStatusDto,
): Promise<AdvisingRequest> => {
  // Chỉ gửi `resolutionSummary` khi người dùng thực sự nhập nội dung kết quả.
  // Claim (IN_PROGRESS) tuyệt đối không gửi field này.
  const payload: UpdateAdvisingRequestStatusDto = { ...body };
  if (body.resolutionSummary !== undefined) {
    const summary = body.resolutionSummary.trim();
    if (summary) payload.resolutionSummary = summary;
    else delete payload.resolutionSummary;
  }
  const { data } = await apiClient.patch<AdvisingRequest>(
    `/advisor/advising-requests/${id}/status`,
    payload,
    { headers: await getCsrfHeaders() },
  );
  return data;
},

  /**
   * Cố vấn "nhận xử lý" một ticket đang PENDING.
   * BE tự ghi `advisor_id = advisor đang đăng nhập` ⇒ không cần gửi advisorId.
   *
   * Body gửi đi CHỈ có `status` — KHÔNG gửi `resolutionSummary` (trường này chỉ
   * dùng cho bước đóng yêu cầu, không phải lúc nhận xử lý).
   */
  claimRequest: async (id: string): Promise<AdvisingRequest> => {
    const { data } = await apiClient.patch<AdvisingRequest>(
      `/advisor/advising-requests/${id}/status`,
      { status: 'IN_PROGRESS' },
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Gửi tin nhắn trong 1 ticket: `POST /advisor/advising-requests/{id}/messages`. */
  sendRequestMessage: async (id: string, content: string): Promise<void> => {
    await apiClient.post(
      `/advisor/advising-requests/${id}/messages`,
      { content, internal: false },
      { headers: await getCsrfHeaders() },
    );
  },
};
