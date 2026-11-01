import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { AcademicAdvisingDetail, AcademicAdvisingRequest } from '../../academic/services/studentAcademicService';

/** API backed by the current advisor-conversation endpoints. */
export const advisorConversationService = {
  requests: async (): Promise<AcademicAdvisingRequest[]> => {
    const { data } = await apiClient.get<AcademicAdvisingRequest[]>('/advisor/advising-requests');
    return data ?? [];
  },

  detail: async (id: string): Promise<AcademicAdvisingDetail> => {
    return (await apiClient.get<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}`)).data;
  },

  reply: async (id: string, content: string, internal = false): Promise<AcademicAdvisingDetail> => {
    return (await apiClient.post<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/messages`,
      { content, internal }, { headers: await getCsrfHeaders() })).data;
  },

  status: async (
    id: string,
    status: 'IN_PROGRESS' | 'RESOLVED',
    resolutionSummary?: string,
  ): Promise<AcademicAdvisingDetail> => {
    return (await apiClient.patch<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/status`,
      { status, resolutionSummary }, { headers: await getCsrfHeaders() })).data;
  },
};
