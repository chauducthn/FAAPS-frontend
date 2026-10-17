// src/hooks/queries/useImportQuery.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { importService } from '../../services/admin/import.service';
import type { ImportJobFilterParams } from '../../types/import';

export const IMPORT_QUERY_KEYS = {
  all: ['admin', 'imports'] as const,
  list: (params?: ImportJobFilterParams) => [...IMPORT_QUERY_KEYS.all, 'list', params] as const,
  presets: () => [...IMPORT_QUERY_KEYS.all, 'presets'] as const,
};

export const useImportJobsQuery = (params?: ImportJobFilterParams) =>
  useQuery({
    queryKey: IMPORT_QUERY_KEYS.list(params),
    queryFn: () => importService.listJobs(params),
    placeholderData: keepPreviousData,
  });

export const useImportPresetsQuery = () =>
  useQuery({
    queryKey: IMPORT_QUERY_KEYS.presets(),
    queryFn: () => importService.listPresets(),
    staleTime: 1000 * 60 * 10,
  });