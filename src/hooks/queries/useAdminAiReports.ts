import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';

export const useAiReport = (id: string | undefined) =>
  useQuery({
    queryKey: ['admin', 'ai-reports', 'detail', id],
    queryFn: () => adminService.getAiReport(id as string),
    enabled: !!id,
  });

export const useResolveAiReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: 'RESOLVED' | 'DISMISSED'; resolutionNote: string }) =>
      adminService.resolveAiReport(input.id, { status: input.status, resolutionNote: input.resolutionNote }),
    onSuccess: (detail, input) => {
      qc.setQueryData(['admin', 'ai-reports', 'detail', input.id], detail);
      // Refreshes the lists, the dashboard table and the sidebar badge (all share this prefix).
      qc.invalidateQueries({ queryKey: ['admin', 'ai-reports'] });
    },
  });
};
