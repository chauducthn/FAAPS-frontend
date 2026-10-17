// src/hooks/queries/useCoursesQuery.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/admin/course.service';
import type { CourseFilterParams } from '../../types/course';

export const COURSE_QUERY_KEYS = {
  all: ['admin', 'courses'] as const,
  list: (params?: CourseFilterParams) => [...COURSE_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...COURSE_QUERY_KEYS.all, 'detail', id] as const,
  categories: () => [...COURSE_QUERY_KEYS.all, 'categories'] as const,
};

export const useCoursesQuery = (params?: CourseFilterParams) =>
  useQuery({
    queryKey: COURSE_QUERY_KEYS.list(params),
    queryFn: () => courseService.list(params),
    placeholderData: keepPreviousData,
  });

export const useCourse = (id: string | null) =>
  useQuery({
    queryKey: COURSE_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => courseService.getById(id as string),
    enabled: !!id,
  });

export const useCourseCategoriesQuery = () =>
  useQuery({
    queryKey: COURSE_QUERY_KEYS.categories(),
    queryFn: () => courseService.listCategories(),
    staleTime: 1000 * 60 * 10, // 10 min: categories rarely change
  });