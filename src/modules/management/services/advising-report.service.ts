import { apiClient } from '@/shared/lib/apiClient';
import type { ApiResponse } from '@/shared/types/api';

export interface SchoolAdvisingOverview {
  semesterId: string | null;
  semesterCode: string;
  totalStudents: number;
  atRiskStudents: number;
  contactedAtRisk: number;
  coverageRate: number;
  totalSessions: number;
  onlineSessions: number;
  offlineSessions: number;
  emailSessions: number;
  completedSessions: number;
  noShowSessions: number;
}

export interface AdvisorEffectivenessRow {
  advisorId: string;
  fullName: string;
  email: string;
  assignedStudents: number;
  completedSessions: number;
  emailOutreaches: number;
  pendingRequests: number;
}

export interface SemesterOption {
  id: string;
  code: string;
  name: string;
  isCurrent?: boolean;
}

export const advisingReportService = {
  getSemesters: async (): Promise<SemesterOption[]> => {
    const { data } = await apiClient.get<ApiResponse<SemesterOption[]> | SemesterOption[]>('/admin/semesters');
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.data) ? data.data : [];
  },

  getOverview: async (semesterId?: string): Promise<SchoolAdvisingOverview> => {
    const { data } = await apiClient.get<SchoolAdvisingOverview>('/admin/reports/advising/overview', {
      params: semesterId ? { semesterId } : undefined,
    });
    return data;
  },

  getByAdvisor: async (semesterId?: string): Promise<AdvisorEffectivenessRow[]> => {
    const { data } = await apiClient.get<AdvisorEffectivenessRow[]>('/admin/reports/advising/by-advisor', {
      params: semesterId ? { semesterId, limit: 100 } : { limit: 100 },
    });
    return Array.isArray(data) ? data : [];
  },

  exportCsv: async (semesterId?: string): Promise<Blob> => {
    const { data } = await apiClient.get('/admin/reports/advising/export', {
      params: semesterId ? { semesterId } : undefined,
      responseType: 'blob',
    });
    return data as Blob;
  },
};
