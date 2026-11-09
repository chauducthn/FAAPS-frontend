// src/hooks/queries/useAiStudentQueries.ts
import { useQuery } from '@tanstack/react-query';
import { aiStudentService } from '../../services/aiStudentService';
import type { AiChatMessage } from '../../types/ai-student';

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

/**
 * Oldest first. A question and its answer are stored within the same second and the backend breaks that
 * tie with a random id, so on equal timestamps the student's message always comes first.
 */
export const sortChatMessages = (messages: AiChatMessage[]): AiChatMessage[] =>
  [...messages].sort((a, b) => {
    const byTime = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (byTime !== 0) return byTime;
    if (a.sender === b.sender) return 0;
    return a.sender === 'USER' ? -1 : 1;
  });

/** Tin nhắn trong một hội thoại. Chỉ fetch khi đã chọn hội thoại. */
export const useAiMessages = (conversationId: string | null) =>
  useQuery({
    queryKey: AI_STUDENT_QUERY_KEYS.messages(conversationId ?? ''),
    queryFn: () => aiStudentService.getMessages(conversationId as string),
    select: sortChatMessages,
    enabled: !!conversationId,
  });

/** Lộ trình học hiện tại do AI sinh (null nếu chưa có). */
export const useStudyRoadmap = () =>
  useQuery({
    queryKey: AI_STUDENT_QUERY_KEYS.roadmap,
    queryFn: aiStudentService.getRoadmap,
  });
