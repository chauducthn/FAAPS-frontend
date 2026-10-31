// src/hooks/queries/useAdvisorQueries.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { advisorService } from '../../services/advisorService';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { IS_MOCK_MODE } from '@/config/mockConfig';
import type { AcademicStatus, AdvisingRequestStatus } from '../../types/advising';

export const ADVISOR_QUERY_KEYS = {
  all: ['advisor'] as const,
  notifications: ['advisor', 'notifications'] as const,
  unreadNotifications: ['advisor', 'notifications', 'unread-count'] as const,
  students: (params: { search?: string; status?: AcademicStatus | 'ALL'; page: number; size: number }) =>
    ['advisor', 'students', params] as const,
  advisingRequests: (params: { status?: AdvisingRequestStatus; search?: string }) =>
    ['advisor', 'advising-requests', params] as const,
};

export const useAdvisorNotifications = () => {
  const user = useAuth((state) => state.user);

  return useQuery({
    queryKey: ADVISOR_QUERY_KEYS.notifications,
    queryFn: advisorService.getNotifications,
    // Chưa đăng nhập thì không gọi API (tránh spam 401). Ở mock mode thì luôn chạy.
    enabled: IS_MOCK_MODE || !!user?.id,
  });
};

export const useUnreadAdvisorNotificationCount = () => {
  const user = useAuth((state) => state.user);

  return useQuery({
    queryKey: ADVISOR_QUERY_KEYS.unreadNotifications,
    queryFn: advisorService.getUnreadNotificationCount,
    enabled: IS_MOCK_MODE || !!user?.id,
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
 * Yêu cầu tư vấn mà advisor nhận xử lý.
 * API trả về mảng thô — lọc theo status/search ở server khi có, phân trang do client đảm nhiệm.
 */
export const useAdvisorAdvisingRequests = (params: {
  status?: AdvisingRequestStatus;
  search?: string;
}) =>
  useQuery({
    queryKey: ADVISOR_QUERY_KEYS.advisingRequests(params),
    queryFn: () => advisorService.getAdvisingRequests(params),
    placeholderData: keepPreviousData,
  });
