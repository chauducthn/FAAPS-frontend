import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { apiClient } from '../../../../shared/lib/apiClient';
import { getCsrfHeaders } from '../../../../shared/lib/csrf';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { chunkArray } from '../../../../shared/lib/fetchAllPages';
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

/** Total accounts for one role, used by the stat counters. */
export const useRoleCount = (role: AdminUserRole) =>
  useQuery({
    queryKey: ['admin', 'users', 'count', role],
    queryFn: async () => (await adminService.getUsers({ role, page: 0, size: 1 })).totalElements,
  });

/** Total accounts for one status, used by the stat counters. */
export const useStatusCount = (status: AdminUserStatus) =>
  useQuery({
    queryKey: ['admin', 'users', 'count', 'status', status],
    queryFn: async () => (await adminService.getUsers({ status, page: 0, size: 1 })).totalElements,
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
    mutationFn: async (input: { ids: string[]; status: 'ACTIVE' | 'SUSPENDED' }) => {
      if (input.ids.length === 1) {
        await adminService.changeUserStatus(input.ids[0], input.status);
        return { updated: 1 };
      }
      let updated = 0;
      for (const batch of chunkArray(input.ids, 100)) {
        const res = await adminService.bulkChangeUserStatus(batch, input.status);
        updated += res.updated;
      }
      return { updated };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useChangeUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      role: AdminUserRole;
      email?: string;
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
      if (ids.length === 1) return await adminService.resetUserPassword(ids[0]);
      const allResults: NonNullable<PasswordResetResponse['resetResults']> = [];
      for (const batch of chunkArray(ids, 100)) {
        const res = await adminService.bulkResetUserPassword(batch);
        if (res.resetResults) allResults.push(...res.resetResults);
      }
      return { resetResults: allResults };
    } catch (cause) {
      setError(apiErrorMessage(cause));
      throw cause;
    } finally {
      setIsPending(false);
    }
  };

  return { run, isPending, error, setError };
};

export const useDeleteUsers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]): Promise<{ deleted: number }> => {
      const headers = await getCsrfHeaders();
      if (ids.length === 1) {
        const { data } = await apiClient.delete<{ deleted: number }>(`/admin/users/${ids[0]}`, { headers });
        return data;
      }
      let deleted = 0;
      for (const batch of chunkArray(ids, 100)) {
        const { data } = await apiClient.post<{ deleted: number }>('/admin/users/bulk-delete', { userIds: batch }, { headers });
        deleted += data.deleted;
      }
      return { deleted };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};
