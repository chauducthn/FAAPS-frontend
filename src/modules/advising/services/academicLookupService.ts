import { apiClient } from '../../../shared/lib/apiClient';
import type { LookupCourse, LookupCurriculum } from '../types/academic-lookup';

/**
 * Tra cứu học vụ cho Advisor (read-only).
 *
 * GHI CHÚ CHO BACKEND — các endpoint dưới đây chưa tồn tại, cần BE bổ sung
 * (role ADVISOR, chỉ đọc):
 *
 *   GET /advisor/academic/courses?search=&category=
 *     → LookupCourse[]   (course gồm prerequisites; syllabus có thể rỗng)
 *   GET /advisor/academic/courses/{id}
 *     → LookupCourse     (chi tiết + prerequisites đầy đủ)
 *   GET /advisor/academic/curriculums
 *     → LookupCurriculum[] (kèm semesters[].courses = mã môn học)
 *
 * Nếu BE chưa kịp làm, các API trả 404 và UI hiển thị empty/error state —
 * không có dữ liệu giả nào được dựng sẵn.
 */
export const academicLookupService = {
  getCourses: async (params: { search?: string; category?: string } = {}): Promise<LookupCourse[]> => {
    const { data } = await apiClient.get<LookupCourse[]>('/advisor/academic/courses', { params });
    return data ?? [];
  },

  getCourseDetail: async (id: string): Promise<LookupCourse> => {
    return (await apiClient.get<LookupCourse>(`/advisor/academic/courses/${id}`)).data;
  },

  getCurricula: async (): Promise<LookupCurriculum[]> => {
    const { data } = await apiClient.get<LookupCurriculum[]>('/advisor/academic/curriculums');
    return data ?? [];
  },
};
