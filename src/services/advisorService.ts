// src/services/advisorService.ts
// API cho Advisor Portal.
// Advisor Portal uses the real backend endpoints.

import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type { Page } from '../types/api';
import type {
  AdviseeStudent,
  AdvisingRequest,
  AdvisingRequestStatus,
  UpdateAdvisingRequestStatusDto,
} from '../types/advising';
import type { AcademicStudentProfile, Progress, TranscriptRow } from './studentAcademicService';

export type AdvisorStudentDetail = { profile: AcademicStudentProfile; progress: Progress; transcript: TranscriptRow[] };

export const advisorService = {
  /** Sinh viên được phân công cho advisor hiện tại (student_advisor_assignments.status = 'ACTIVE'). */
  getAdviseeStudents: async (
    params: { search?: string; page?: number; size?: number } = {},
  ): Promise<Page<AdviseeStudent>> => {
    const { data } = await apiClient.get<Page<AdviseeStudent>>('/advisor/students', { params });
    return data;
  },
  getStudentDetail: async (studentId: string): Promise<AdvisorStudentDetail> =>
    (await apiClient.get<AdvisorStudentDetail>(`/advisor/students/${studentId}`)).data,

  /** Yêu cầu tư vấn mà advisor nhận xử lý. */
  getAdvisingRequests: async (
    params: {
      status?: AdvisingRequestStatus;
      search?: string;
      page?: number;
      size?: number;
    } = {},
  ): Promise<Page<AdvisingRequest>> => {
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
    const { data } = await apiClient.put<AdvisingRequest>(
      `/advisor/advising-requests/${id}/status`,
      body,
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
