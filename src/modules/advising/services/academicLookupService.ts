import { apiClient } from '../../../shared/lib/apiClient';
import { isAdvisorMockEnabled, mockDelay } from '../../../shared/lib/mockMode';
import type { LookupCourse, LookupCurriculum } from '../types/academic-lookup';
import {
  mockLookupCourseDetail,
  mockLookupCourses,
  mockLookupCurricula,
} from '../mocks/advisorLookupMock';

/**
 * Tra cứu học vụ cho Advisor (read-only).
 *
 * Khi mock advisor bật, danh mục môn học và chương trình đào tạo được dựng sẵn
 * trong bộ nhớ để trang "Academic Search" có dữ liệu và kiểm tra tiên quyết
 * trong modal duyệt kế hoạch học tập hoạt động đầy đủ.
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
 */
export const academicLookupService = {
  getCourses: async (params: { search?: string; category?: string } = {}): Promise<LookupCourse[]> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockLookupCourses(params);
    }
    const { data } = await apiClient.get<LookupCourse[]>('/advisor/academic/courses', { params });
    return data ?? [];
  },

  getCourseDetail: async (id: string): Promise<LookupCourse> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockLookupCourseDetail(id);
    }
    return (await apiClient.get<LookupCourse>(`/advisor/academic/courses/${id}`)).data;
  },

  getCurricula: async (): Promise<LookupCurriculum[]> => {
    if (isAdvisorMockEnabled()) {
      await mockDelay();
      return mockLookupCurricula();
    }
    const { data } = await apiClient.get<LookupCurriculum[]>('/advisor/academic/curriculums');
    return data ?? [];
  },
};
