// src/hooks/queries/useAdvisorQueries.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { advisorService } from '../../services/advisorService';
import { useAuth } from '@/modules/auth/stores/useAuth';
import type { AcademicStatus, AdvisingRequestScope, AdvisingRequestStatus } from '../../types/advising';

export const ADVISOR_QUERY_KEYS = {
  all: ['advisor'] as const,
  notifications: ['advisor', 'notifications'] as const,
  unreadNotifications: ['advisor', 'notifications', 'unread-count'] as const,
  /** Danh sách thông báo có phân trang — dùng cho trang /advisor/notifications. */
  notificationList: (params: { unreadOnly: boolean; page: number; size: number }) =>
    ['advisor', 'notifications', 'list', params] as const,
  students: (params: { search?: string; status?: AcademicStatus | 'ALL'; page: number; size: number }) =>
    ['advisor', 'students', params] as const,
  advisingRequests: (params: { status?: AdvisingRequestStatus; search?: string; scope?: AdvisingRequestScope }) =>
    ['advisor', 'advising-requests', params] as const,
};

/**
 * Chuông thông báo — poll mỗi 30s.
 *
 * BE chưa có WebSocket cho advisor, nên dùng polling. `refetchInterval` bị tắt khi tab
 * ẩn (mặc định của react-query) để không đốt băng thông khi người dùng đang ở tab khác.
 */
export const ADVISOR_NOTIFICATION_POLL_MS = 30_000;

export const useAdvisorNotifications = () => {
  const user = useAuth((state) => state.user);

  return useQuery({
    queryKey: ADVISOR_QUERY_KEYS.notifications,
    queryFn: advisorService.getNotifications,
    // Chưa đăng nhập thì không gọi API (tránh spam 401).
    enabled: !!user?.id,
    refetchInterval: ADVISOR_NOTIFICATION_POLL_MS,
  });
};

export const useUnreadAdvisorNotificationCount = () => {
  const user = useAuth((state) => state.user);

  return useQuery({
    queryKey: ADVISOR_QUERY_KEYS.unreadNotifications,
    queryFn: advisorService.getUnreadNotificationCount,
    enabled: !!user?.id,
    refetchInterval: ADVISOR_NOTIFICATION_POLL_MS,
  });
};

/** Sinh viên được phân công cho advisor hiện tại. */
export const useAdviseeStudents = (params: {
  search?: string;
  status?: AcademicStatus | 'ALL';
  page: number;
  size: number;
}) =>
  useQuery({
    queryKey: ADVISOR_QUERY_KEYS.students(params),
    queryFn: () => advisorService.getAdviseeStudents(params),
    placeholderData: keepPreviousData,
  });

/**
 * Danh sách ticket yêu cầu tư vấn.
 *
 * Hệ thống TICKET (helpdesk) với mô hình SHARED MULTI-ADVISOR: API trả về mảng
 * thô — lọc theo status/search ở client, phân trang do client đảm nhiệm.
 *
 * `scope`:
 *   • 'ALL'  (mặc định) → toàn bộ hàng đợi chung, mọi cố vấn đều thấy.
 *   • 'MINE' → chỉ ticket mình đang phụ trách HOẶC từng tham gia trả lời.
 */
export const useAdvisorAdvisingRequests = (params: {
  status?: AdvisingRequestStatus;
  search?: string;
  scope?: AdvisingRequestScope;
}) =>
  useQuery({
    queryKey: ADVISOR_QUERY_KEYS.advisingRequests(params),
    queryFn: () => advisorService.getAdvisingRequests(params),
    placeholderData: keepPreviousData,
  });

/**
 * Danh sách thông báo có phân trang + lọc "chỉ chưa đọc" (server-side).
 *
 * Dùng cho trang `/advisor/notifications`. Vẫn poll 30s để danh sách không bị cũ
 * khi advisor để tab mở trong lúc chờ sinh viên phản hồi.
 */
export const useAdvisorNotificationList = (params: {
  unreadOnly: boolean;
  page: number;
  size: number;
}) =>
  useQuery({
    queryKey: ADVISOR_QUERY_KEYS.notificationList(params),
    queryFn: () => advisorService.getNotificationList(params),
    enabled: !!useAuth.getState().user?.id,
    placeholderData: keepPreviousData,
    refetchInterval: ADVISOR_NOTIFICATION_POLL_MS,
  });
