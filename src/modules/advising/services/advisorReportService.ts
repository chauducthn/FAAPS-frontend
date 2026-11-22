// src/modules/advising/services/advisorReportService.ts
// API cho trang "Reports & Analytics" cua advisor (Flow 5).
// BE: AdvisorReportController — /api/advisor/reports/{overview,gpa-trend,status-distribution}

import { apiClient } from '../../../shared/lib/apiClient';
import type { AdvisorReportOverview, GpaTrendReport, StatusDistribution } from '../types/reports';

const base = '/advisor/reports';

export const advisorReportService = {
  /** KPI tong quan: tong SV, active, at-risk, GPA trung binh... */
  getOverview: async (): Promise<AdvisorReportOverview> => {
    const { data } = await apiClient.get<AdvisorReportOverview>(`${base}/overview`);
    return data;
  },

  /** Duong xu huong GPA theo tung hoc ky. */
  getGpaTrend: async (): Promise<GpaTrendReport> => {
    const { data } = await apiClient.get<GpaTrendReport>(`${base}/gpa-trend`);
    return { semesters: data?.semesters ?? [] };
  },

  /** Phan bo trang thai hoc vu: { ACTIVE: 10, PROBATION: 2, ... }. */
  getStatusDistribution: async (): Promise<StatusDistribution> => {
    const { data } = await apiClient.get<StatusDistribution>(`${base}/status-distribution`);
    return data ?? {};
  },
};
