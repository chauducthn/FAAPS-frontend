import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../../advising/services/assignmentService';

const NOTIFICATIONS = ['admin', 'notifications'] as const;

export const useAdminNotifications = (page = 0, size = 20) =>
  useQuery({
    queryKey: [...NOTIFICATIONS, 'list', page, size],
    queryFn: () => notificationService.list({ page, size }),
    placeholderData: keepPreviousData,
  });

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: [...NOTIFICATIONS, 'unread-count'],
    queryFn: notificationService.unreadCount,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS }),
  });
};

export const useClearAllNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS }),
  });
};
