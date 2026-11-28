// src/hooks/mutations/useAdvisingMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { advisorService } from '../../services/advisorService';
import { studentService } from '../../../learning/services/studentService';
import { STUDENT_QUERY_KEYS } from '../../../learning/hooks/queries/useStudentQueries';
import { ADVISOR_QUERY_KEYS } from '../queries/useAdvisorQueries';
import type { UpdateAdvisingRequestStatusDto } from '../../types/advising';

/** Marks one of the student's notifications as read. */
export const useMarkStudentNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.notificationsRoot });
    },
  });
};

/** Đánh dấu toàn bộ thông báo của sinh viên đã đọc. */
export const useMarkAllStudentNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => studentService.markAllNotificationsRead(),
    onSuccess: (result) => {
      toast.success(`${result.updated} notification(s) marked as read`);
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to update notifications.'));
    },
  });
};

export const useClearAllStudentNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => studentService.clearAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.notificationsRoot });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to clear notifications.'));
    },
  });
};

export const useMarkAdvisorNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advisorService.markNotificationRead,
    // Phải invalidate cả danh sách lẫn badge số chưa đọc.
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['advisor', 'notifications'],
      }),
    onError: (error) => toast.error(apiErrorMessage(error, 'Unable to update notifications.')),
  });
};

export const useMarkAllAdvisorNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advisorService.markAllNotificationsRead,
    // Phải invalidate cả danh sách lẫn badge số chưa đọc.
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['advisor', 'notifications'],
      }),
    onError: (error) => toast.error(apiErrorMessage(error, 'Unable to update notifications.')),
  });
};

export const useClearAllAdvisorNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advisorService.clearAllNotifications,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['advisor', 'notifications'],
      }),
    onError: (error) => toast.error(apiErrorMessage(error, 'Unable to clear notifications.')),
  });
};
