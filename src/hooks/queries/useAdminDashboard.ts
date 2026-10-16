import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import type { AiReportStatus } from '../../types/admin';

export const useDashboardAccounts = () =>
  useQuery({
    queryKey: ['admin', 'dashboard', 'accounts'],
    queryFn: adminService.getDashboardAccounts,
  });

export const useNewStudents = (startMonth: string, endMonth: string, enabled = true) =>
  useQuery({
    queryKey: ['admin', 'dashboard', 'new-students', startMonth, endMonth],
    queryFn: () => adminService.getNewStudents({ startMonth, endMonth }),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useAiReports = (params: {
  status?: AiReportStatus;
  search?: string;
  page?: number;
  size?: number;
}) =>
  useQuery({
    queryKey: ['admin', 'ai-reports', params],
    queryFn: () => adminService.getAiReports(params),
    placeholderData: keepPreviousData,
  });
