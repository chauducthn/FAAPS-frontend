// src/hooks/queries/useCurriculumsQuery.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { curriculumService } from '../../services/admin/curriculum.service';
import type { CurriculumFilterParams } from '../../types/curriculum';

export const CURRICULUM_QUERY_KEYS = {
  all: ['admin', 'curriculums'] as const,
  list: (params?: CurriculumFilterParams) => [...CURRICULUM_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...CURRICULUM_QUERY_KEYS.all, 'detail', id] as const,
};

export const useCurriculumsQuery = (params?: CurriculumFilterParams) =>
  useQuery({
    queryKey: CURRICULUM_QUERY_KEYS.list(params),
    queryFn: () => curriculumService.list(params),
    placeholderData: keepPreviousData,
  });

export const useCurriculum = (id: string | null) =>
  useQuery({
    queryKey: CURRICULUM_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => curriculumService.getById(id as string),
    enabled: !!id,
  });