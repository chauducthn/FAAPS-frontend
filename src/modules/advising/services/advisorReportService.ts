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

  /**
   * Phan bo trang thai hoc vu: { ACTIVE: 10, PROBATION: 2, ... }.
   *
   * KHÔNG nuốt lỗi: response rỗng / sai shape sẽ throw, để hook báo `isError` và UI
   * hiển thị trạng thái lỗi + nút retry. Trước đây `data ?? {}` khiến BE lỗi hoặc
   * trả body rỗng bị hiển thị như "không có sinh viên nào" — một con số sai âm thầm.
   */
  getStatusDistribution: async (): Promise<StatusDistribution> => {
    const { data } = await apiClient.get<StatusDistribution>(`${base}/status-distribution`);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid status distribution payload: expected an object of { status: count }.');
    }
    return data;
  },
};
