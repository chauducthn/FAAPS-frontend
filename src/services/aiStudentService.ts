// src/services/aiStudentService.ts
// API cho Sprint 3: Chat AI + Lộ trình học phía sinh viên.
// Khi scope mock "portal" đang bật, các hàm trả về dữ liệu giả (src/mocks/ai-student.ts)
// để UI chạy được khi backend chưa có endpoint.

import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import { isMockPortalEnabled } from '../mocks';
import {
  mockCreateConversation,
  mockGenerateRoadmap,
  mockGetMessages,
  mockGetRoadmap,
  mockListConversations,
  mockSendFeedback,
  mockSendMessage,
} from '../mocks/ai-student';
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
    if (isMockPortalEnabled()) return mockListConversations();
    const { data } = await apiClient.get<AiConversation[]>('/student/ai/conversations');
    return data ?? [];
  },

  /** Tạo hội thoại mới. */
  createConversation: async (body: CreateAiConversationDto = {}): Promise<AiConversation> => {
    if (isMockPortalEnabled()) return mockCreateConversation(body);
    const { data } = await apiClient.post<AiConversation>('/student/ai/conversations', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  /** Tin nhắn trong một hội thoại. */
  getMessages: async (conversationId: string): Promise<AiChatMessage[]> => {
    if (isMockPortalEnabled()) return mockGetMessages(conversationId);
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
    if (isMockPortalEnabled()) return mockSendMessage(conversationId, body);
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
    if (isMockPortalEnabled()) return mockSendFeedback(messageId, body);
    const { data } = await apiClient.patch<{ updated: boolean }>(
      `/student/ai/messages/${messageId}/feedback`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },

  /** Lộ trình học hiện tại (null nếu AI chưa sinh lần nào). */
  getRoadmap: async (): Promise<StudyRoadmap | null> => {
    if (isMockPortalEnabled()) return mockGetRoadmap();
    const { data } = await apiClient.get<StudyRoadmap | null>('/student/ai/roadmap');
    return data ?? null;
  },

  /** Yêu cầu AI sinh lại lộ trình từ JSON cấu trúc. */
  generateRoadmap: async (body: GenerateRoadmapDto = {}): Promise<StudyRoadmap> => {
    if (isMockPortalEnabled()) return mockGenerateRoadmap(body);
    const { data } = await apiClient.post<StudyRoadmap>('/student/ai/roadmap', body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },
};
