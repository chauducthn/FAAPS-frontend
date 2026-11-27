import { apiClient } from '../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../shared/lib/csrf';
import type { CourseWorkload, WorkloadLevel } from '../../academic/types/course';
import type { LookupCourse, LookupCurriculum } from '../types/academic-lookup';

/**
 * Tra cứu học vụ cho Advisor (read-only).
 *
 * Endpoint BE đã hiện thực (role ADVISOR, chỉ đọc) — xem `AdvisorAcademicLookupController`:
 *
 *   GET /advisor/academic/courses?search=&category=
 *     → LookupCourse[]   (course gồm prerequisites; syllabus có thể rỗng)
 *   GET /advisor/academic/courses/{id}
 *     → LookupCourse     (chi tiết + prerequisites đầy đủ)
 *   GET /advisor/academic/curriculums
 *     → LookupCurriculum[] (kèm semesters[].courses = mã môn học, totalCredits = tín chỉ yêu cầu)
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

  updateCourseWorkload: async (
    id: string,
    workloadLevel: WorkloadLevel | 'AUTO' | null,
  ): Promise<CourseWorkload> => {
    const { data } = await apiClient.put<CourseWorkload>(
      `/advisor/academic/courses/${id}/workload`,
      { workloadLevel: workloadLevel === 'AUTO' ? null : workloadLevel },
      { headers: await getCsrfHeaders() },
    );
    return data;
  },
};
