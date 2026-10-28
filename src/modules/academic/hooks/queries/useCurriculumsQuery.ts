// src/hooks/queries/useCurriculumsQuery.ts
// Cohorts and curriculums are the same backend records, so they share one cache key family.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cohortService } from '../../../management/services/cohort.service';
import { curriculumService } from '../../../management/services/curriculum.service';
import { semesterService } from '../../services/semesterService';
import type { CurriculumFilterParams, SemesterOption } from '../../types/curriculum';

export type CurriculumKind = 'cohort' | 'curriculum';

export const CURRICULUM_QUERY_KEYS = {
  all: ['admin', 'curriculums'] as const,
  list: (kind: CurriculumKind, params?: CurriculumFilterParams) => [...CURRICULUM_QUERY_KEYS.all, 'list', kind, params] as const,
  detail: (id: string) => [...CURRICULUM_QUERY_KEYS.all, 'detail', id] as const,
  courses: (id: string) => [...CURRICULUM_QUERY_KEYS.all, 'courses', id] as const,
  semesters: () => [...CURRICULUM_QUERY_KEYS.all, 'semesters'] as const,
};

export const serviceFor = (kind: CurriculumKind) => (kind === 'cohort' ? cohortService : curriculumService);

export const useCurriculumsQuery = (kind: CurriculumKind, params?: CurriculumFilterParams) =>
  useQuery({
    queryKey: CURRICULUM_QUERY_KEYS.list(kind, params),
    queryFn: () => serviceFor(kind).list(params),
    placeholderData: keepPreviousData,
  });

export const useCurriculum = (id: string | null) =>
  useQuery({
    queryKey: CURRICULUM_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => curriculumService.getById(id as string),
    enabled: !!id,
  });

export const useCurriculumCourses = (id: string | null) =>
  useQuery({
    queryKey: CURRICULUM_QUERY_KEYS.courses(id ?? ''),
    queryFn: () => curriculumService.listCourses(id as string),
    enabled: !!id,
  });

export const useSemesterOptions = (enabled = true) =>
  useQuery({
    queryKey: CURRICULUM_QUERY_KEYS.semesters(),
    enabled,
    staleTime: 60_000,
    queryFn: async (): Promise<SemesterOption[]> =>
      (await semesterService.list()).map(({ id, code, startDate }) => ({ id, code, startDate })),
  });
