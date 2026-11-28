// Every active curriculum for the account forms: the first page from the shared query, the rest fetched on open.

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurriculumsQuery } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { curriculumService } from '../../services/curriculum.service';

const PAGE_SIZE = 100;

export function useAllActiveCurriculums(open: boolean) {
  const curriculums = useCurriculumsQuery('curriculum', { status: 'ACTIVE', page: 0, size: PAGE_SIZE });
  const totalPages = curriculums.data?.totalPages ?? 1;
  const rest = useQuery({
    queryKey: ['admin', 'curriculums', 'active-rest', totalPages],
    enabled: open && totalPages > 1,
    staleTime: 60_000,
    queryFn: async () => {
      const pages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          curriculumService.list({ status: 'ACTIVE', page: i + 1, size: PAGE_SIZE }),
        ),
      );
      return pages.flatMap((p) => p.items ?? []);
    },
  });
  return useMemo(() => [...(curriculums.data?.items ?? []), ...(rest.data ?? [])], [curriculums.data, rest.data]);
}
