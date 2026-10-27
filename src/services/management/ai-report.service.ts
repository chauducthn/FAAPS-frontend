// src/services/management/ai-report.service.ts
import { apiClient } from '../../lib/apiClient';
import type {
  AdminPage,
  AiReportDetail,
  AiReportStatus,
  AiReportSummary,
} from '../../types/admin';

export const aiReportService = {
  getReports: async (params: {
    status?: AiReportStatus;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<AdminPage<AiReportSummary>> => {
    const { data } = await apiClient.get<AdminPage<AiReportSummary>>('/admin/ai-reports', { params });
    return data;
  },

  getReport: async (id: string): Promise<AiReportDetail> => {
    const { data } = await apiClient.get<AiReportDetail>(`/admin/ai-reports/${id}`);
    return data;
  },

  resolveReport: async (
    id: string,
    body: { status: 'RESOLVED' | 'DISMISSED'; resolutionNote: string },
  ): Promise<AiReportDetail> => {
    const { data } = await apiClient.post<AiReportDetail>(`/admin/ai-reports/${id}/resolve`, body);
    return data;
  },
};
