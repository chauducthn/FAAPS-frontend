import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type {
  AdminPage,
  AiReportStatus,
  AdminUserDetail,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSummary,
  AiReportDetail,
  AiReportSummary,
  CohortLite,
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

  /** Every cohort in the system, for the cohort filter dropdown. */
  getCohortOptions: async (): Promise<CohortLite[]> => {
    const { data } = await apiClient.get<CohortLite[]>('/admin/assignments/cohorts');
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
    /** Narrow the list to one major (uuid). */
    majorId?: string;
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

  createUser: async (body: {
    role: AdminUserRole;
    email: string;
    fullName: string;
    phone?: string;
    studentCode?: string;
    curriculumVersionId?: string;
    enrollmentSemesterId?: string;
    expectedGraduationSemesterId?: string;
    currentSemester?: number;
    maxAdvisees?: number;
  }): Promise<AdminUserDetail> => {
    const { data } = await apiClient.post<AdminUserDetail>('/admin/users', body, {
      headers: await getCsrfHeaders(),
    });
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

  changeUserRole: async (id: string, body: {
    role: AdminUserRole;
    studentCode?: string;
    curriculumVersionId?: string;
    enrollmentSemesterId?: string;
    maxAdvisees?: number;
  }): Promise<AdminUserDetail> => {
    const { data } = await apiClient.patch<AdminUserDetail>(`/admin/users/${id}/role`, body, {
      headers: await getCsrfHeaders(),
    });
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
