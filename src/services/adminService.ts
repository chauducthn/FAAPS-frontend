import { apiClient } from '../lib/apiClient';
import type {
  AdminPage,
  AiReportStatus,
  AiReportSummary,
  DashboardAccounts,
  MonthlyCount,
} from '../types/admin';

export const adminService = {
  getDashboardAccounts: async (): Promise<DashboardAccounts> => {
    const { data } = await apiClient.get<DashboardAccounts>('/admin/dashboard/accounts');
    return data;
  },

  getNewStudents: async (params: {
    startMonth: string;
    endMonth: string;
    majorId?: string;
  }): Promise<MonthlyCount[]> => {
    const { data } = await apiClient.get<MonthlyCount[]>('/admin/dashboard/new-students', { params });
    return data;
  },

  getAiReports: async (params: {
    status?: AiReportStatus;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<AdminPage<AiReportSummary>> => {
    const { data } = await apiClient.get<AdminPage<AiReportSummary>>('/admin/ai-reports', { params });
    return data;
  },
};
