// src/services/admin/ai-report.service.ts
// Khi mock AI đang bật, dữ liệu báo cáo đến từ src/mocks/ai.ts thay vì gọi API.

import { apiClient } from '../../lib/apiClient';
import { isMockAiEnabled } from '../../mocks';
import {
  mockAiReportDetail,
  mockAiReports,
  mockResolveAiReport,
} from '../../mocks/ai';
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
    if (isMockAiEnabled()) return mockAiReports(params);

    const { data } = await apiClient.get<AdminPage<AiReportSummary>>('/admin/ai-reports', { params });
    return data;
  },

  getReport: async (id: string): Promise<AiReportDetail> => {
    if (isMockAiEnabled()) {
      const detail = mockAiReportDetail(id);
      if (!detail) throw new Error('Report not found');
      return detail;
    }

    const { data } = await apiClient.get<AiReportDetail>(`/admin/ai-reports/${id}`);
    return data;
  },

  resolveReport: async (
    id: string,
    body: { status: 'RESOLVED' | 'DISMISSED'; resolutionNote: string },
  ): Promise<AiReportDetail> => {
    if (isMockAiEnabled()) {
      const detail = mockResolveAiReport(id, body.status, body.resolutionNote);
      if (!detail) throw new Error('Report not found');
      return detail;
    }

    const { data } = await apiClient.post<AiReportDetail>(`/admin/ai-reports/${id}/resolve`, body);
    return data;
  },
};
