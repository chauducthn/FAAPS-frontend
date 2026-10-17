// src/hooks/queries/useCohortsQuery.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cohortService } from '../../services/admin/cohort.service';
import type { CohortFilterParams } from '../../types/cohort';

export const COHORT_QUERY_KEYS = {
  all: ['admin', 'cohorts'] as const,
  list: (params?: CohortFilterParams) => [...COHORT_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...COHORT_QUERY_KEYS.all, 'detail', id] as const,
  majors: (id: string) => [...COHORT_QUERY_KEYS.all, 'majors', id] as const,
};

export const useCohortsQuery = (params?: CohortFilterParams) =>
  useQuery({
    queryKey: COHORT_QUERY_KEYS.list(params),
    queryFn: () => cohortService.list(params),
    placeholderData: keepPreviousData,
  });

export const useCohort = (id: string | null) =>
  useQuery({
    queryKey: COHORT_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => cohortService.getById(id as string),
    enabled: !!id,
  });

export const useCohortMajors = (cohortId: string | null) =>
  useQuery({
    queryKey: COHORT_QUERY_KEYS.majors(cohortId ?? ''),
    queryFn: () => cohortService.getMajors(cohortId as string),
    enabled: !!cohortId,
  });