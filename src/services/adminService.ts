import axios from 'axios';
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

  updateUser: async (
    id: string,
    body: { fullName: string; phone?: string | null; avatarUrl?: string | null }
  ): Promise<AdminUserDetail> => {
    const { data } = await apiClient.patch<AdminUserDetail>(`/admin/users/${id}`, body, {
      headers: await getCsrfHeaders(),
    });
    return data;
  },

  uploadAvatar: async (id: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await apiClient.post<{ avatarUrl: string }>(`/admin/users/${id}/avatar`, form, {
        headers: { ...(await getCsrfHeaders()), 'Content-Type': 'multipart/form-data' },
      });
      return data.avatarUrl;
    } catch (error) {
      // The backend only registers this endpoint when avatar storage (S3) is enabled.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Avatar upload is not available on this server.');
      }
      throw error;
    }
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
