// src/hooks/mutations/useAiStudentMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiStudentService } from '../../services/aiStudentService';
import { apiErrorMessage } from '../../lib/apiError';
import { AI_STUDENT_QUERY_KEYS } from '../queries/useAiStudentQueries';
import type {
  AiMessageFeedbackDto,
  CreateAiConversationDto,
  GenerateRoadmapDto,
  SendAiMessageDto,
} from '../../types/ai-student';

/** Tạo hội thoại chat mới. */
export const useCreateAiConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAiConversationDto = {}) =>
      aiStudentService.createConversation(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_STUDENT_QUERY_KEYS.conversations });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to create a new conversation.'));
    },
  });
};

/** Gửi tin nhắn trong hội thoại — backend trả về cặp USER + ASSISTANT. */
export const useSendAiMessage = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SendAiMessageDto) =>
      aiStudentService.sendMessage(conversationId as string, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_STUDENT_QUERY_KEYS.messages(conversationId ?? ''),
      });
      queryClient.invalidateQueries({ queryKey: AI_STUDENT_QUERY_KEYS.conversations });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to send the message.'));
    },
  });
};

/** Đánh giá câu trả lời của AI (hữu ích / không hữu ích). */
export const useSendAiFeedback = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: AiMessageFeedbackDto }) =>
      aiStudentService.sendFeedback(messageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_STUDENT_QUERY_KEYS.messages(conversationId ?? ''),
      });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to submit feedback.'));
    },
  });
};

/** Yêu cầu AI sinh lại lộ trình học (JSON cấu trúc). */
export const useGenerateRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: GenerateRoadmapDto = {}) => aiStudentService.generateRoadmap(body),
    onSuccess: () => {
      toast.success('A new study roadmap has been generated');
      queryClient.invalidateQueries({ queryKey: AI_STUDENT_QUERY_KEYS.roadmap });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Unable to generate a study roadmap.'));
    },
  });
};
