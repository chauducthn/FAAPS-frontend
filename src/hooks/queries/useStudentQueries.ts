// src/hooks/queries/useStudentQueries.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';

export const STUDENT_QUERY_KEYS = {
  all: ['student'] as const,
  profile: ['student', 'profile'] as const,
  advisor: ['student', 'advisor'] as const,
  /** Prefix chung của mọi query thông báo — dùng để invalidate toàn bộ. */
  notificationsRoot: ['student', 'notifications'] as const,
  notifications: (page: number, size: number, unreadOnly: boolean) =>
    ['student', 'notifications', page, size, unreadOnly] as const,
  advisingRequests: ['student', 'advising-requests'] as const,
};

/** Hồ sơ học tập của chính sinh viên. */
export const useMyProfile = () =>
  useQuery({
    queryKey: STUDENT_QUERY_KEYS.profile,
    queryFn: studentService.getMyProfile,
  });

/** Cố vấn phụ trách. Trả null nếu sinh viên chưa được phân công cố vấn. */
export const useMyAdvisor = () =>
  useQuery({
    queryKey: STUDENT_QUERY_KEYS.advisor,
    queryFn: studentService.getMyAdvisor,
  });

/** Thông báo của chính sinh viên, có phân trang. */
export const useStudentNotifications = (
  page: number,
  size: number,
  unreadOnly = false,
) =>
  useQuery({
    queryKey: STUDENT_QUERY_KEYS.notifications(page, size, unreadOnly),
    queryFn: () => studentService.getNotifications({ page, size, unreadOnly }),
    placeholderData: keepPreviousData,
  });

/** Số thông báo chưa đọc — gọi list unread với size = 1 để lấy totalElements. */
export const useUnreadStudentNotificationCount = () =>
  useQuery({
    queryKey: STUDENT_QUERY_KEYS.notifications(0, 1, true),
    queryFn: () => studentService.getNotifications({ page: 0, size: 1, unreadOnly: true }),
    placeholderData: keepPreviousData,
  });

/** Các yêu cầu tư vấn của chính sinh viên. */
export const useMyAdvisingRequests = () =>
  useQuery({
    queryKey: STUDENT_QUERY_KEYS.advisingRequests,
    queryFn: studentService.getMyAdvisingRequests,
  });
