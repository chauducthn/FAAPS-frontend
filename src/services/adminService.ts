import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type {
  AdminPage,
  AiReportStatus,
  AdminUserDetail,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSummary,
  AiReportDetail,
  AiReportSummary,
  DashboardAccounts,
  MonthlyCount,
  UserSort,
} from '../types/admin';

export const adminService = {
  getDashboardAccounts: async (): Promise<DashboardAccounts> => {
    const { data } = await apiClient.get<DashboardAccounts>('/admin/dashboard/accounts');
    return data;
  },

  getMajorOptions: async (): Promise<{ id: string; code: string; name: string }[]> => {
    const { data } = await apiClient.get<{ id: string; code: string; name: string }[]>('/admin/majors');
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

  getAiReport: async (id: string): Promise<AiReportDetail> => {
    const { data } = await apiClient.get<AiReportDetail>(`/admin/ai-reports/${id}`);
    return data;
  },

  resolveAiReport: async (
    id: string,
    body: { status: 'RESOLVED' | 'DISMISSED'; resolutionNote: string }
  ): Promise<AiReportDetail> => {
    const { data } = await apiClient.post<AiReportDetail>(`/admin/ai-reports/${id}/resolve`, body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  getUsers: async (params: {
    role?: AdminUserRole;
    status?: AdminUserStatus;
    search?: string;
    page?: number;
    size?: number;
    sort?: UserSort;
  }): Promise<AdminPage<AdminUserSummary>> => {
    const { data } = await apiClient.get<AdminPage<AdminUserSummary>>('/admin/users', { params });
    return data;
  },

  getUser: async (id: string): Promise<AdminUserDetail> => {
    const { data } = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
    return data;
  },

  changeUserStatus: async (id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<AdminUserDetail> => {
    const { data } = await apiClient.patch<AdminUserDetail>(
      `/admin/users/${id}/status`,
      { status },
      { headers: await getCsrfHeaders() }
    );
    return data;
  },

  bulkChangeUserStatus: async (userIds: string[], status: 'ACTIVE' | 'SUSPENDED'): Promise<{ updated: number }> => {
    const { data } = await apiClient.post<{ updated: number }>(
      '/admin/users/status',
      { userIds, status },
      { headers: await getCsrfHeaders() }
    );
    return data;
  },
};
