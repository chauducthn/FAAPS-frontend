import { IS_MOCK_MODE } from '../../../config/mockConfig';
import { mockDelay } from '../../../mocks/advisorMockData';
import {
  courseByCode,
  mockLookupCourses,
  mockLookupCurricula,
  type LookupCourse,
  type LookupCurriculum,
} from '../../../mocks/academicLookupMock';

/**
 * Tra cứu học vụ cho Advisor (read-only).
 * Mock-first: khi IS_MOCK_MODE bật trả về dữ liệu giả, chưa cần backend.
 */
export const academicLookupService = {
  getCourses: async (params: { search?: string; category?: string } = {}): Promise<LookupCourse[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const keyword = params.search?.trim().toLowerCase();
      return mockLookupCourses.filter((c) => {
        if (params.category && params.category !== 'ALL' && c.category !== params.category) return false;
        if (!keyword) return true;
        return (
          c.code.toLowerCase().includes(keyword) ||
          c.name.toLowerCase().includes(keyword)
        );
      });
    }
    // Backend chưa có endpoint tra cứu cho advisor — giữ mock làm fallback.
    await mockDelay();
    return mockLookupCourses;
  },

  getCourseDetail: async (id: string): Promise<LookupCourse> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const found =
        mockLookupCourses.find((c) => c.id === id) ??
        mockLookupCourses.find((c) => c.code === id) ??
        mockLookupCourses[0];
      return { ...found };
    }
    await mockDelay();
    return { ...mockLookupCourses[0] };
  },

  getCurricula: async (): Promise<LookupCurriculum[]> => {
    if (IS_MOCK_MODE) {
      await mockDelay();
      return mockLookupCurricula.map((c) => ({ ...c, semesters: c.semesters.map((s) => ({ ...s, courses: [...s.courses] })) }));
    }
    await mockDelay();
    return mockLookupCurricula;
  },

  getCourseByCode: (code: string): LookupCourse | undefined => courseByCode(code),
};
