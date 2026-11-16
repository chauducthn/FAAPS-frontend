import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import type {
  AdminUserRole,
  AdminUserStatus,
  PasswordResetResponse,
  UserSort,
} from '../../types/admin';

export const useAdminUsers = (params: {
  role?: AdminUserRole;
  status?: AdminUserStatus;
  search?: string;
  /** Narrow the list to one major (uuid). */
  majorId?: string;
  /** Narrow the list to one cohort (a curriculum version). */
  curriculumVersionId?: string;
  page?: number;
  size?: number;
  sort?: UserSort;
}) =>
  useQuery({
    queryKey: ['admin', 'users', 'list', params],
    queryFn: () => adminService.getUsers(params),
    placeholderData: keepPreviousData,
  });

/** Every cohort in the system, for the cohort filter dropdown. */
export const useCohortOptions = () =>
  useQuery({
    queryKey: ['admin', 'cohorts', 'options'],
    queryFn: adminService.getCohortOptions,
    staleTime: 5 * 60_000,
  });

/** Total accounts for one role, used by the tab counters. */
export const useRoleCount = (role: AdminUserRole) =>
  useQuery({
    queryKey: ['admin', 'users', 'count', role],
    queryFn: async () => (await adminService.getUsers({ role, page: 0, size: 1 })).totalElements,
  });

export const useAdminUser = (id: string | null) =>
  useQuery({
    queryKey: ['admin', 'users', 'detail', id],
    queryFn: () => adminService.getUser(id as string),
    enabled: !!id,
  });

export const useChangeUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { ids: string[]; status: 'ACTIVE' | 'SUSPENDED' }) =>
      input.ids.length === 1
        ? adminService.changeUserStatus(input.ids[0], input.status).then(() => ({ updated: 1 }))
        : adminService.bulkChangeUserStatus(input.ids, input.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useChangeUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      role: AdminUserRole;
      studentCode?: string;
      curriculumVersionId?: string;
      enrollmentSemesterId?: string;
      maxAdvisees?: number;
    }) => {
      const { id, ...body } = input;
      return adminService.changeUserRole(id, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

/**
 * Resets the password of one or several accounts.
 *
 * This deliberately does not use `useMutation`: React Query keeps the
 * resolved response in its mutation cache, and that response carries the new
 * passwords. The caller gets the response through `run` and holds it for as
 * long as the result dialog is open — nothing else keeps a copy.
 */
export const useResetPasswords = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (ids: string[]): Promise<PasswordResetResponse> => {
    setIsPending(true);
    setError(null);
    try {
      return ids.length === 1
        ? await adminService.resetUserPassword(ids[0])
        : await adminService.bulkResetUserPassword(ids);
    } catch (cause) {
      setError(apiErrorMessage(cause));
      throw cause;
    } finally {
      setIsPending(false);
    }
  };

  return { run, isPending, error, setError };
};
