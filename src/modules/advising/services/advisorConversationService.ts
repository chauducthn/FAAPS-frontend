import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import { IS_MOCK_MODE } from '../../../config/mockConfig';
import type { AcademicAdvisingDetail, AcademicAdvisingRequest } from '../../academic/services/studentAcademicService';
import { mockAdvisingRequests, mockRequestDetail, mockDelay } from '../../../mocks/advisorMockData';

/** API backed by the current advisor-conversation endpoints. */
export const advisorConversationService = {
  requests: async (): Promise<AcademicAdvisingRequest[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockAdvisingRequests.map((request) => ({
        id: request.id,
        studentId: request.studentId,
        studentName: request.studentName,
        advisorId: request.advisorId,
        advisorName: request.advisorName,
        title: request.title,
        description: request.description ?? '',
        requestType: request.requestType,
        status: request.status,
        resolutionSummary: request.resolutionSummary,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      }));
    }
    return (await apiClient.get<AcademicAdvisingRequest[]>('/advisor/advising-requests')).data;
  },

  detail: async (id: string): Promise<AcademicAdvisingDetail> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockRequestDetail(id);
    }
    return (await apiClient.get<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}`)).data;
  },

  reply: async (id: string, content: string, internal = false): Promise<AcademicAdvisingDetail> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const detail = mockRequestDetail(id);
      detail.messages.push({
        id: `msg-${id}-${detail.messages.length + 1}`,
        senderId: 'adv-001',
        senderName: 'Trần Minh Khoa',
        content,
        internal,
        createdAt: new Date().toISOString(),
      });
      return detail;
    }
    return (await apiClient.post<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/messages`,
      { content, internal }, { headers: await getCsrfHeaders() })).data;
  },

  status: async (
    id: string,
    status: 'IN_PROGRESS' | 'RESOLVED',
    resolutionSummary?: string,
  ): Promise<AcademicAdvisingDetail> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const detail = mockRequestDetail(id);
      detail.request.status = status;
      if (resolutionSummary !== undefined) detail.request.resolutionSummary = resolutionSummary;
      detail.request.updatedAt = new Date().toISOString();
      const source = mockAdvisingRequests.find((request) => request.id === id);
      if (source) {
        source.status = status;
        source.updatedAt = detail.request.updatedAt;
        if (resolutionSummary !== undefined) source.resolutionSummary = resolutionSummary;
      }
      return detail;
    }
    return (await apiClient.patch<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/status`,
      { status, resolutionSummary }, { headers: await getCsrfHeaders() })).data;
  },
};
