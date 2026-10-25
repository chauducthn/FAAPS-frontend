import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type { AcademicAdvisingDetail, AcademicAdvisingRequest } from './studentAcademicService';

/** API backed by the current advisor-conversation endpoints. */
export const advisorConversationService = {
  requests: async (): Promise<AcademicAdvisingRequest[]> =>
    (await apiClient.get<AcademicAdvisingRequest[]>('/advisor/advising-requests')).data,
  detail: async (id: string): Promise<AcademicAdvisingDetail> =>
    (await apiClient.get<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}`)).data,
  reply: async (id: string, content: string, internal = false): Promise<AcademicAdvisingDetail> =>
    (await apiClient.post<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/messages`,
      { content, internal }, { headers: await getCsrfHeaders() })).data,
  status: async (id: string, status: 'IN_PROGRESS' | 'RESOLVED', resolutionSummary?: string): Promise<AcademicAdvisingDetail> =>
    (await apiClient.patch<AcademicAdvisingDetail>(`/advisor/advising-requests/${id}/status`,
      { status, resolutionSummary }, { headers: await getCsrfHeaders() })).data,
};
