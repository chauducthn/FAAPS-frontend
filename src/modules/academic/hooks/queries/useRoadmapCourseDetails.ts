// src/modules/academic/hooks/queries/useRoadmapCourseDetails.ts
// The curriculum-course list carries a code, a name, credits and a mandatory flag, but the
// roadmap cards also show the course category and its prerequisites. Both live on the course
// record, so this hook fetches the course details of every course placed in the curriculum.
import { useQueries } from '@tanstack/react-query';
import { courseService } from '../../../management/services/course.service';
import type { CourseDetail } from '../../types/course';
export const ROADMAP_DETAIL_KEYS = {
  all: ['admin', 'courses'] as const,
  detail: (id: string) => [...ROADMAP_DETAIL_KEYS.all, 'detail', id] as const,
};

/**
 * Fetches the details of every course in the list, keyed by course id.
 * Returns a map so the page can look a course up while it maps the semester columns.
 */
export function useRoadmapCourseDetails(courseIds: string[]) {
  const uniqueIds = Array.from(new Set(courseIds.filter(Boolean)));

  const results = useQueries({
    queries: uniqueIds.map((courseId) => ({
      queryKey: ROADMAP_DETAIL_KEYS.detail(courseId),
      queryFn: () => courseService.getById(courseId),
      staleTime: 5 * 60_000,
    })),
  });

  const byId = new Map<string, CourseDetail>();
  results.forEach((result, index) => {
    if (result.data) byId.set(uniqueIds[index], result.data);
  });

  return byId;
}
