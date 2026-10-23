import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import type { AiReportStatus } from '../../types/admin';

export const useDashboardAccounts = () =>
  useQuery({
    queryKey: ['admin', 'dashboard', 'accounts'],
    queryFn: adminService.getDashboardAccounts,
  });

export const useMajorOptions = () =>
  useQuery({
    queryKey: ['admin', 'majors', 'options'],
    queryFn: adminService.getMajorOptions,
    staleTime: 5 * 60_000,
  });

export const useNewStudents = (startMonth: string, endMonth: string, enabled = true, majorId?: string) =>
  useQuery({
    queryKey: ['admin', 'dashboard', 'new-students', startMonth, endMonth, majorId ?? null],
    queryFn: () => adminService.getNewStudents({ startMonth, endMonth, majorId: majorId || undefined }),
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
