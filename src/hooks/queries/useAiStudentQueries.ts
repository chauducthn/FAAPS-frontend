// src/hooks/queries/useAiStudentQueries.ts
import { useQuery } from '@tanstack/react-query';
import { aiStudentService } from '../../services/aiStudentService';

export const AI_STUDENT_QUERY_KEYS = {
  all: ['student', 'ai'] as const,
  conversations: ['student', 'ai', 'conversations'] as const,
  messages: (conversationId: string) =>
    ['student', 'ai', 'conversations', conversationId, 'messages'] as const,
  roadmap: ['student', 'ai', 'roadmap'] as const,
};

/** Danh sách hội thoại chat AI của sinh viên. */
export const useAiConversations = () =>
  useQuery({
    queryKey: AI_STUDENT_QUERY_KEYS.conversations,
    queryFn: aiStudentService.listConversations,
  });

/** Tin nhắn trong một hội thoại. Chỉ fetch khi đã chọn hội thoại. */
export const useAiMessages = (conversationId: string | null) =>
  useQuery({
    queryKey: AI_STUDENT_QUERY_KEYS.messages(conversationId ?? ''),
    queryFn: () => aiStudentService.getMessages(conversationId as string),
    enabled: !!conversationId,
  });

/** Lộ trình học hiện tại do AI sinh (null nếu chưa có). */
export const useStudyRoadmap = () =>
  useQuery({
    queryKey: AI_STUDENT_QUERY_KEYS.roadmap,
    queryFn: aiStudentService.getRoadmap,
  });
