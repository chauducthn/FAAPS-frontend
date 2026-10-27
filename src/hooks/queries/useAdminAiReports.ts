// src/hooks/queries/useAdminAiReports.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiReportService } from '../../services/management/ai-report.service';
import type { AiReportStatus } from '../../types/admin';

export const AI_REPORT_QUERY_KEYS = {
  all: ['admin', 'ai-reports'] as const,
  list: (params?: object) => [...AI_REPORT_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...AI_REPORT_QUERY_KEYS.all, 'detail', id] as const,
};

export const useAiReports = (params: {
  status?: AiReportStatus;
  search?: string;
  page?: number;
  size?: number;
}) =>
  useQuery({
    queryKey: AI_REPORT_QUERY_KEYS.list(params),
    queryFn: () => aiReportService.getReports(params),
    placeholderData: (prev) => prev,
  });

export const useAiReport = (id: string | undefined) =>
  useQuery({
    queryKey: AI_REPORT_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => aiReportService.getReport(id as string),
    enabled: !!id,
  });

export const useResolveAiReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: 'RESOLVED' | 'DISMISSED'; resolutionNote: string }) =>
      aiReportService.resolveReport(input.id, { status: input.status, resolutionNote: input.resolutionNote }),
    onSuccess: (detail, input) => {
      qc.setQueryData(AI_REPORT_QUERY_KEYS.detail(input.id), detail);
      // Refreshes the lists, the dashboard table and the sidebar badge (all share this prefix).
      qc.invalidateQueries({ queryKey: AI_REPORT_QUERY_KEYS.all });
    },
  });
};
