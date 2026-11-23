// src/modules/advising/services/advisorAtRiskApi.ts
// API danh sách sinh viên có nguy cơ (Flow 3 — Passive warning) của advisor.
//
// Endpoint BE đã hiện thực (role ADVISOR, chỉ đọc):
//   GET /advisor/at-risk-students        → `{ data: AtRiskStudent[]; total: number }`
//   GET /advisor/at-risk-students/counts → `{ high, medium, low, total }`
// Danh sách gồm sinh viên được phân công cho advisor hiện tại đang bị cảnh báo
// học vụ: GPA thấp / vắng nhiều / nợ môn.

import { apiClient } from '../../../shared/lib/apiClient';
import type { AtRiskCounts, AtRiskStudent, AtRiskStudentResponse } from '../types/at-risk';

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

  /**
   * Số lượng sinh viên theo từng mức độ nguy cơ.
   * GET /advisor/at-risk-students/counts → `{ high, medium, low, total }`.
   * Dùng cho widget tổng quan trên Dashboard (không cần tải cả danh sách).
   */
  getAtRiskCounts: async (): Promise<AtRiskCounts> => {
    const { data } = await apiClient.get<AtRiskCounts | { data: AtRiskCounts }>(`${base}/counts`);
    // BE contract: response phẳng `{ high, medium, low, total }`.
    // Một số gateway bọc thêm `{ data: {...} }` — unwrap cho chắc.
    const raw = unwrapCounts(data);
    const high = num(raw.high);
    const medium = num(raw.medium);
    const low = num(raw.low);
    return {
      high,
      medium,
      low,
      // `total` từ BE là nguồn chuẩn; nếu thiếu thì suy ra từ tổng 3 mức.
      total: num(raw.total) || high + medium + low,
    };
  },
};

/** Chấp nhận cả dạng phẳng lẫn dạng bọc `{ data: {...} }`. */
function unwrapCounts(payload: AtRiskCounts | { data: AtRiskCounts } | null): AtRiskCounts {
  if (!payload || typeof payload !== 'object') return { high: 0, medium: 0, low: 0, total: 0 };
  if ('high' in payload || 'medium' in payload || 'low' in payload) return payload as AtRiskCounts;
  const inner = (payload as { data?: AtRiskCounts }).data;
  return inner ?? { high: 0, medium: 0, low: 0, total: 0 };
}

/** Chuẩn hoá số: NaN / âm / không phải số → 0. */
function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

export type { AtRiskCounts, AtRiskStudent, AtRiskStudentResponse };
