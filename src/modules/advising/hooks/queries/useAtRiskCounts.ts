// src/modules/advising/hooks/queries/useAtRiskCounts.ts
// Query số lượng sinh viên có nguy cơ theo mức độ (High / Medium / Low)
// cho widget tổng quan trên Advisor Dashboard.

import { useQuery } from '@tanstack/react-query';
import { advisorAtRiskApi } from '../../services/advisorAtRiskApi';

export const AT_RISK_COUNTS_QUERY_KEY = ['advisor', 'at-risk-students', 'counts'] as const;

/**
 * GET /advisor/at-risk-students/counts
 * - staleTime 2 phút: số đếm thay đổi chậm, tránh gọi lại mỗi lần mount.
 * - retry false: lỗi mạng tạm thời không đáng retry liên tục, widget tự hiển thị trạng thái lỗi.
 */
export const useAtRiskCounts = () =>
  useQuery({
    queryKey: AT_RISK_COUNTS_QUERY_KEY,
    queryFn: advisorAtRiskApi.getAtRiskCounts,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
