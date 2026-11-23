// src/modules/advising/hooks/queries/useAtRiskStudents.ts
// Query danh sách sinh viên có nguy cơ (Flow 3 — Passive warning) cho Advisor Dashboard.

import { useQuery } from '@tanstack/react-query';
import { advisorAtRiskApi } from '../../services/advisorAtRiskApi';

export const AT_RISK_QUERY_KEY = ['advisor', 'at-risk-students'] as const;

/**
 * GET /advisor/at-risk-students
 * - staleTime 5 phút: danh sách cảnh báo học vụ không đổi nhanh, tránh gọi lại mỗi lần mount.
 * - retry false: lỗi mạng tạm thời không đáng retry liên tục, dashboard tự hiển thị trạng thái lỗi.
 */
export const useAtRiskStudents = () =>
  useQuery({
    queryKey: AT_RISK_QUERY_KEY,
    queryFn: advisorAtRiskApi.getAtRiskStudents,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
