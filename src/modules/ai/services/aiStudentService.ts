// src/services/aiStudentService.ts
// API cho Sprint 3: Chat AI + Lộ trình học phía sinh viên.
// Uses the real Student AI backend endpoints.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type {
  AiChatMessage,
  AiConversation,
  AiMessageFeedbackDto,
  CreateAiConversationDto,
  GenerateRoadmapDto,
  SendAiMessageDto,
  SendAiMessageResult,
  StudyRoadmap,
} from '../types/ai-student';

export const aiStudentService = {
  /** Danh sách hội thoại chat AI của chính sinh viên. */
  listConversations: async (): Promise<AiConversation[]> => {
    const { data } = await apiClient.get<AiConversation[]>('/student/ai/conversations');
    return data ?? [];
  },

  /** Tạo hội thoại mới. */
  createConversation: async (body: CreateAiConversationDto = {}): Promise<AiConversation> => {
    const { data } = await apiClient.post<AiConversation>('/student/ai/conversations', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  /** Tin nhắn trong một hội thoại. */
  getMessages: async (conversationId: string): Promise<AiChatMessage[]> => {
    const { data } = await apiClient.get<AiChatMessage[]>(
      `/student/ai/conversations/${conversationId}/messages`,
    );
    return data ?? [];
  },

  /** Gửi tin nhắn — backend lưu tin USER, gọi SDK AI rồi trả về cả cặp USER + ASSISTANT. */
  sendMessage: async (
    conversationId: string,
    body: SendAiMessageDto,
  ): Promise<SendAiMessageResult> => {
    const { data } = await apiClient.post<SendAiMessageResult>(
      `/student/ai/conversations/${conversationId}/messages`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Đánh giá câu trả lời (was_helpful + feedback). */
  sendFeedback: async (
    messageId: string,
    body: AiMessageFeedbackDto,
  ): Promise<{ updated: boolean }> => {
    const { data } = await apiClient.patch<{ updated: boolean }>(
      `/student/ai/messages/${messageId}/feedback`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Lộ trình học hiện tại (null nếu AI chưa sinh lần nào). */
  getRoadmap: async (): Promise<StudyRoadmap | null> => {
    const { data } = await apiClient.get<StudyRoadmap | null>('/student/ai/roadmap');
    return data ?? null;
  },

  /** Yêu cầu AI sinh lại lộ trình từ JSON cấu trúc. */
  generateRoadmap: async (body: GenerateRoadmapDto = {}): Promise<StudyRoadmap> => {
    const { data } = await apiClient.post<StudyRoadmap>('/student/ai/roadmap', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },
};
