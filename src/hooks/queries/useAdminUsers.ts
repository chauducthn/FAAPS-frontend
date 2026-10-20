import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import type { AdminUserRole, AdminUserStatus, UserSort } from '../../types/admin';

export const useAdminUsers = (params: {
  role?: AdminUserRole;
  status?: AdminUserStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: UserSort;
}) =>
  useQuery({
    queryKey: ['admin', 'users', 'list', params],
    queryFn: () => adminService.getUsers(params),
    placeholderData: keepPreviousData,
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
