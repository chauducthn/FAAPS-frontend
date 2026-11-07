import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { isAdvisorMockEnabled, mockDelay } from '../../../shared/lib/mockMode';
import type { AcademicAdvisingDetail, AcademicAdvisingRequest } from '../../academic/services/studentAcademicService';
import {
  mockGetConversationDetail,
  mockGetConversationRequests,
  mockReplyToConversation,
  mockSetConversationStatus,
} from '../mocks/advisorMockApi';

/**
 * API của advisor-conversation.
 *
 * Khi mock advisor bật, mọi thao tác (gửi reply, gửi internal note, resolve)
 * ghi thẳng vào mock store — UI invalidate là thấy tin nhắn mới ngay.
 */
export const advisorConversationService = {
  requests: async (): Promise<AcademicAdvisingRequest[]> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetConversationRequests();
    }
    const { data } = await apiClient.get<AcademicAdvisingRequest[]>('/advisor/advising-requests');
    return data ?? [];
  },

  detail: async (id: string): Promise<AcademicAdvisingDetail> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockGetConversationDetail(id);
    }
    return (await apiClient.get<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}`)).data;
  },

  reply: async (id: string, content: string, internal = false): Promise<AcademicAdvisingDetail> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockReplyToConversation(id, content, internal);
    }
    return (await apiClient.post<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/messages`,
      { content, internal }, { headers: await getCsrfHeaders() })).data;
  },

  status: async (
    id: string,
    status: 'IN_PROGRESS' | 'RESOLVED',
    resolutionSummary?: string,
  ): Promise<AcademicAdvisingDetail> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockSetConversationStatus(id, status, resolutionSummary);
    }
    return (await apiClient.patch<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/status`,
      { status, resolutionSummary }, { headers: await getCsrfHeaders() })).data;
  },
};
