import { useQuery } from '@tanstack/react-query';
import { majorGroupService } from '../../services/majorGroupService';

export const MAJOR_GROUP_QUERY_KEY = ['major-groups'] as const;

/** The Major Group lookup. It rarely changes, so it is cached for the session. */
export const useMajorGroups = (enabled = true) =>
  useQuery({
    queryKey: MAJOR_GROUP_QUERY_KEY,
    queryFn: majorGroupService.list,
    staleTime: 30 * 60_000,
    retry: false,
    enabled,
  });
