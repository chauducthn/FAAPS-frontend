import { useQuery } from '@tanstack/react-query';
import { majorService } from '../../services/management/major.service';
import { MajorFilterParams } from '../../types/major';

export const MAJOR_QUERY_KEYS = {
  all: ['majors'] as const,
  list: (params?: MajorFilterParams) => [...MAJOR_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...MAJOR_QUERY_KEYS.all, 'detail', id] as const,
};

export const useMajorsQuery = (params?: MajorFilterParams) => {
  return useQuery({
    queryKey: MAJOR_QUERY_KEYS.list(params),
    queryFn: () => majorService.getMajors(params),
    placeholderData: (previousData) => previousData,
  });
};