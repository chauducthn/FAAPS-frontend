// src/hooks/queries/useAiConfigQuery.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { aiConfigService } from '../../../management/services/ai-config.service';
import type {
  AiConfigFilterParams,
  AiPerformanceFilterParams,
} from '../../types/ai-config';

export const AI_CONFIG_QUERY_KEYS = {
  all: ['admin', 'ai-configurations'] as const,
  list: (params?: AiConfigFilterParams) => [...AI_CONFIG_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...AI_CONFIG_QUERY_KEYS.all, 'detail', id] as const,
  presets: () => [...AI_CONFIG_QUERY_KEYS.all, 'presets'] as const,
  performance: (params?: AiPerformanceFilterParams) =>
    [...AI_CONFIG_QUERY_KEYS.all, 'performance', params] as const,
};

export const useAiConfigsQuery = (params?: AiConfigFilterParams) =>
  useQuery({
    queryKey: AI_CONFIG_QUERY_KEYS.list(params),
    queryFn: () => aiConfigService.list(params),
    placeholderData: keepPreviousData,
  });

export const useAiConfig = (id: string | null) =>
  useQuery({
    queryKey: AI_CONFIG_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => aiConfigService.getById(id as string),
    enabled: !!id,
  });

export const useAiPresetsQuery = () =>
  useQuery({
    queryKey: AI_CONFIG_QUERY_KEYS.presets(),
    queryFn: () => aiConfigService.listPresets(),
    staleTime: 1000 * 60 * 30,
  });

export const useAiPerformanceQuery = (params?: AiPerformanceFilterParams) =>
  useQuery({
    queryKey: AI_CONFIG_QUERY_KEYS.performance(params),
    queryFn: () => aiConfigService.getPerformance(params ?? {}),
    placeholderData: keepPreviousData,
  });