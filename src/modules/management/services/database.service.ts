import { apiClient } from '@/shared/lib/apiClient';
import { getCsrfHeaders } from '@/shared/lib/csrf';
import type { ApiResponse } from '@/shared/types/api';

export interface DatabaseOverview {
  totalTables: number;
  users: number;
  students: number;
  advisors: number;
  majors: number;
  cohorts: number;
  courses: number;
  semesters: number;
  preservedAdminEmail: string;
}

export interface DatabaseResetResult {
  clearedTables: number;
  deletedRows: number;
  preservedAdminEmail: string;
}

export const databaseService = {
  getOverview: async (): Promise<DatabaseOverview> => {
    const { data } = await apiClient.get<ApiResponse<DatabaseOverview>>('/admin/database/overview');
    if (!data.data) throw new Error('Could not load database overview');
    return data.data;
  },
  resetDatabase: async (confirmation: string): Promise<DatabaseResetResult> => {
    const { data } = await apiClient.post<ApiResponse<DatabaseResetResult>>(
      '/admin/database/reset',
      { confirmation },
      { headers: await getCsrfHeaders() },
    );
    if (!data.data) throw new Error(data.message || 'Could not reset database');
    return data.data;
  },
};
