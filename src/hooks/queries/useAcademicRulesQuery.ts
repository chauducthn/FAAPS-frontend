// src/hooks/queries/useAcademicRulesQuery.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { academicRuleService } from '../../services/management/academic-rule.service';
import type { AcademicRuleFilterParams } from '../../types/academic-rule';

export const ACADEMIC_RULE_QUERY_KEYS = {
  all: ['admin', 'academic-rules'] as const,
  list: (params?: AcademicRuleFilterParams) =>
    [...ACADEMIC_RULE_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...ACADEMIC_RULE_QUERY_KEYS.all, 'detail', id] as const,
};

export const useAcademicRulesQuery = (params?: AcademicRuleFilterParams) =>
  useQuery({
    queryKey: ACADEMIC_RULE_QUERY_KEYS.list(params),
    queryFn: () => academicRuleService.list(params),
    placeholderData: keepPreviousData,
  });

export const useAcademicRule = (id: string | null) =>
  useQuery({
    queryKey: ACADEMIC_RULE_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => academicRuleService.getById(id as string),
    enabled: !!id,
  });