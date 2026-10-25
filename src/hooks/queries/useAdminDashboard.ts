import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';

// The AI report queries live in useAdminAiReports; re-exported here so the dashboard
// table and the reports page share one cache entry.
export { useAiReports } from './useAdminAiReports';

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
