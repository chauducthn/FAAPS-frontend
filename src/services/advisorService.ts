// src/services/advisorService.ts
// API cho Advisor Portal.
// Khi scope mock "portal" đang bật, các hàm trả về dữ liệu giả (src/mocks/advising.ts).

import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import { isMockPortalEnabled } from '../mocks';
import {
  mockGetAdviseeStudents,
  mockGetAdvisorRequests,
  mockUpdateRequestStatus,
} from '../mocks/advising';
import type { Page } from '../types/api';
import type {
  AdviseeStudent,
  AdvisingRequest,
  AdvisingRequestStatus,
  UpdateAdvisingRequestStatusDto,
} from '../types/advising';

export const advisorService = {
  /** Sinh viên được phân công cho advisor hiện tại (student_advisor_assignments.status = 'ACTIVE'). */
  getAdviseeStudents: async (
    params: { search?: string; page?: number; size?: number } = {},
  ): Promise<Page<AdviseeStudent>> => {
    if (isMockPortalEnabled()) return mockGetAdviseeStudents(params);
    const { data } = await apiClient.get<Page<AdviseeStudent>>('/advisor/students', { params });
    return data;
  },

  /** Yêu cầu tư vấn mà advisor nhận xử lý. */
  getAdvisingRequests: async (
    params: {
      status?: AdvisingRequestStatus;
      search?: string;
      page?: number;
      size?: number;
    } = {},
  ): Promise<Page<AdvisingRequest>> => {
    if (isMockPortalEnabled()) return mockGetAdvisorRequests(params);
    const { data } = await apiClient.get<Page<AdvisingRequest>>('/advisor/advising-requests', {
      params,
    });
    return data;
  },

  /** Chuyển trạng thái request: RESOLVED = Chấp nhận, CANCELLED = Từ chối. */
  updateRequestStatus: async (
    id: string,
    body: UpdateAdvisingRequestStatusDto,
  ): Promise<AdvisingRequest> => {
    if (isMockPortalEnabled()) return mockUpdateRequestStatus(id, body);
    const { data } = await apiClient.put<AdvisingRequest>(
      `/advisor/advising-requests/${id}/status`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
