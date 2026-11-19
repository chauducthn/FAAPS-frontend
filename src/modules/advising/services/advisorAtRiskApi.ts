// src/modules/advising/services/advisorAtRiskApi.ts
// API danh sách sinh viên có nguy cơ (Flow 3 — Passive warning) của advisor.
//
// TODO(BE): implement GET /advisor/at-risk-students
//   → trả về `{ data: AtRiskStudent[]; total: number }`
//   (role ADVISOR, chỉ đọc — danh sách sinh viên được phân công cho advisor hiện tại
//    đang bị cảnh báo học vụ: GPA thấp / vắng nhiều / nợ môn).
// Chi tiết contract: xem `BE_BACKLOG.md` mục "Advisor — Students At Risk (P0)".

import { apiClient } from '../../../shared/lib/apiClient';
import type { AtRiskStudent, AtRiskStudentResponse } from '../types/at-risk';

const base = '/advisor/at-risk-students';

export const advisorAtRiskApi = {
  /** Danh sách sinh viên bị cảnh báo học vụ. */
  getAtRiskStudents: async (): Promise<AtRiskStudentResponse> => {
    const { data } = await apiClient.get<AtRiskStudentResponse | AtRiskStudent[]>(base);
    // BE contract: `{ data: AtRiskStudent[]; total: number }`.
    // Nếu BE trả mảng thô, tự bọc lại để FE không vỡ.
    if (Array.isArray(data)) return { data, total: data.length };
    return data ?? { data: [], total: 0 };
  },
};

export type { AtRiskStudent, AtRiskStudentResponse };
