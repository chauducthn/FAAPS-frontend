// src/modules/advising/hooks/queries/useAdvisorReports.ts
// Ba query cho trang "Reports & Analytics" cua advisor (Flow 5).
// Tach rieng tung endpoint de mot endpoint loi khong lam hong cac phan con lai.

import { useQuery } from '@tanstack/react-query';
import { advisorReportService } from '../../services/advisorReportService';

export const ADVISOR_REPORT_KEYS = {
  overview: ['advisor', 'reports', 'overview'] as const,
  gpaTrend: ['advisor', 'reports', 'gpa-trend'] as const,
  statusDistribution: ['advisor', 'reports', 'status-distribution'] as const,
};

/** KPI tong quan. */
export const useAdvisorReportOverview = () =>
  useQuery({
    queryKey: ADVISOR_REPORT_KEYS.overview,
    queryFn: advisorReportService.getOverview,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

/** Duong xu huong GPA theo hoc ky. */
export const useAdvisorGpaTrend = () =>
  useQuery({
    queryKey: ADVISOR_REPORT_KEYS.gpaTrend,
    queryFn: advisorReportService.getGpaTrend,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

/** Phan bo trang thai hoc vu. */
export const useAdvisorStatusDistribution = () =>
  useQuery({
    queryKey: ADVISOR_REPORT_KEYS.statusDistribution,
    queryFn: advisorReportService.getStatusDistribution,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
