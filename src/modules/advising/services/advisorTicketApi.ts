// Advisor ticket queue API. GET /advisor/advising-requests returns a plain array (not a Page), so status and
// keyword filtering happen on the client.

import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type {
  AdvisingRequest,
  AdvisingRequestDetail,
  AdvisingRequestScope,
  AdvisingRequestStatus,
  UpdateAdvisingRequestStatusDto,
} from '../types/advising';

/** RESOLVED also covers REJECTED (declined by an advisor) and CANCELLED (withdrawn by the student). */
const filterRequests = (
  requests: AdvisingRequest[],
  params: { status?: AdvisingRequestStatus; search?: string },
): AdvisingRequest[] => {
  const keyword = params.search?.trim().toLowerCase();
  return requests.filter((request) => {
    if (params.status === 'RESOLVED') {
      if (request.status !== 'RESOLVED' && request.status !== 'REJECTED' && request.status !== 'CANCELLED') return false;
    } else if (params.status && request.status !== params.status) {
      return false;
    }
    if (!keyword) return true;
    return (
      request.title?.toLowerCase().includes(keyword) ||
      request.studentName?.toLowerCase().includes(keyword) ||
      (request.studentCode ?? '').toLowerCase().includes(keyword)
    );
  });
};

/** The status endpoint answers with either `{ request, messages }` or the bare request. */
const unwrapRequest = (data: AdvisingRequestDetail | AdvisingRequest | null | undefined): AdvisingRequest => {
  if (!data) throw new Error('The API returned an empty response.');
  if ('request' in data && data.request) return data.request;
  return data as AdvisingRequest;
};

const patchStatus = async (id: string, body: UpdateAdvisingRequestStatusDto): Promise<AdvisingRequest> => {
  const { data } = await apiClient.patch<AdvisingRequestDetail | AdvisingRequest>(
    `/advisor/advising-requests/${id}/status`,
    body,
    { headers: await getCsrfHeaders() },
  );
  return unwrapRequest(data);
};

export const advisorTicketApi = {
  /** The shared queue (scope ALL) or the tickets the advisor holds or has replied in (scope MINE). */
  getAdvisingRequests: async (
    params: { status?: AdvisingRequestStatus; search?: string; scope?: AdvisingRequestScope } = {},
  ): Promise<AdvisingRequest[]> => {
    const { data } = await apiClient.get<AdvisingRequest[]>('/advisor/advising-requests', {
      params: { scope: params.scope ?? 'ALL' },
    });
    return filterRequests(data ?? [], params);
  },

  /** One ticket with its whole thread. */
  getRequestDetail: async (id: string): Promise<AdvisingRequestDetail> => {
    return (await apiClient.get<AdvisingRequestDetail>(`/advisor/advising-requests/${id}`)).data;
  },

  /**
   * Moves a ticket: claim (IN_PROGRESS), resolve (RESOLVED) or reject (REJECTED). The backend requires a summary
   * to resolve or reject, so a blank summary is dropped rather than sent.
   */
  updateRequestStatus: async (id: string, body: UpdateAdvisingRequestStatusDto): Promise<AdvisingRequest> => {
    const payload: UpdateAdvisingRequestStatusDto = { ...body };
    if (body.resolutionSummary !== undefined) {
      const summary = body.resolutionSummary.trim();
      if (summary) payload.resolutionSummary = summary;
      else delete payload.resolutionSummary;
    }
    return patchStatus(id, payload);
  },

  /** Claims a pending ticket for the signed-in advisor; the body carries the status only. */
  claimRequest: (id: string): Promise<AdvisingRequest> => patchStatus(id, { status: 'IN_PROGRESS' }),

  sendRequestMessage: async (id: string, content: string): Promise<void> => {
    await apiClient.post(
      `/advisor/advising-requests/${id}/messages`,
      { content, internal: false },
      { headers: await getCsrfHeaders() },
    );
  },
};
