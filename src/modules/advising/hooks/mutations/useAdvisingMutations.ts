// src/hooks/mutations/useAdvisingMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { advisorService } from '../../services/advisorService';
import { studentService } from '../../../learning/services/studentService';
import { STUDENT_QUERY_KEYS } from '../../../learning/hooks/queries/useStudentQueries';
import { ADVISOR_QUERY_KEYS } from '../queries/useAdvisorQueries';
import type { CreateAdvisingRequestDto, UpdateAdvisingRequestStatusDto } from '../../types/advising';

/** Gửi yêu cầu tư vấn mới. */
export const useCreateAdvisingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdvisingRequestDto) => studentService.createAdvisingRequest(body),
    onSuccess: () => {
      toast.success('Advising request submitted');
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to submit the request.'));
    },
  });
};

/**
 * Advisor chuyển trạng thái yêu cầu.
 * RESOLVED = Chấp nhận, CANCELLED = Từ chối, IN_PROGRESS = Tiếp nhận xử lý.
 */
export const useUpdateAdvisingRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAdvisingRequestStatusDto }) =>
      advisorService.updateRequestStatus(id, body),
    onSuccess: (_data, variables) => {
      const { status } = variables.body;
      if (status === 'RESOLVED') toast.success('Request accepted');
      else if (status === 'CANCELLED') toast.success('Request rejected');
      else toast.success('Request is now in progress');
      queryClient.invalidateQueries({ queryKey: ADVISOR_QUERY_KEYS.all });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to update the request.'));
    },
  });
};

/** Đánh dấu 1 thông báo của sinh viên đã đọc. */
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
