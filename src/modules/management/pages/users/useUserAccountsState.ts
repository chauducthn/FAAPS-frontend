import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { ResetPasswordTarget } from '../../components/ResetPasswordConfirmDialog';
import { canResetPassword } from '../../utils/passwordReset';
import {
  useAdminUsers,
  useChangeUserStatus,
  useCohortOptions,
  useDeleteUsers,
  useResetPasswords,
  useRoleCount,
  useStatusCount,
} from '../../hooks/queries/useAdminUsers';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { useMajorOptions } from '../../hooks/queries/useAdminDashboard';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAuth } from '../../../auth/stores/useAuth';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, PasswordResetEntry } from '../../types/admin';
import { toUserSort, USER_PAGE_SIZE, USER_ROLES } from './userAccountColumns';
import { exportUsersToCsv } from './exportUsersCsv';

export function useUserAccountsState() {
  const me = useAuth((s) => s.user);
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<AdminUserRole | ''>(
    USER_ROLES.includes(roleParam as AdminUserRole) ? (roleParam as AdminUserRole) : '',
  );
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [majorId, setMajorId] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: USER_PAGE_SIZE });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ ids: string[]; status: 'ACTIVE' | 'SUSPENDED'; label: string } | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<{ ids: string[]; label: string } | null>(null);
  const [roleChange, setRoleChange] = useState<AdminUserSummary | null>(null);
  const [bulkRoleTargets, setBulkRoleTargets] = useState<AdminUserSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetTargets, setResetTargets] = useState<ResetPasswordTarget[] | null>(null);
  const [resetResults, setResetResults] = useState<PasswordResetEntry[] | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const changeStatus = useChangeUserStatus();
  const deleteUsers = useDeleteUsers();
  const resetPasswords = useResetPasswords();
  const majors = useMajorOptions();
  const cohortOptionsQuery = useCohortOptions();
  const studentCount = useRoleCount('STUDENT');
  const advisorCount = useRoleCount('ADVISOR');
  const activeCount = useStatusCount('ACTIVE');
  const suspendedCount = useStatusCount('SUSPENDED');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const cohortOptions = useMemo(() => cohortOptionsQuery.data ?? [], [cohortOptionsQuery.data]);

  const usersQuery = useAdminUsers({
    role: role || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
    majorId: majorId || undefined,
    curriculumVersionId: cohortId || undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: toUserSort(sorting),
  });

  const items = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data]);
  const total = usersQuery.data?.totalElements ?? 0;
  const hasFilters = !!role || !!status || !!search || !!majorId || !!cohortId;

  const clearFilters = () => {
    setRole('');
    setStatus('');
    setSearch('');
    setMajorId('');
    setCohortId('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const askBulk = (rows: AdminUserSummary[], target: 'ACTIVE' | 'SUSPENDED') => {
    let ids = rows.map((u) => u.id);
    if (target === 'SUSPENDED' && me) ids = ids.filter((id) => id !== me.id);
    if (ids.length === 0) {
      toast.error('Nothing to update: you cannot suspend your own account.');
      return;
    }
    setConfirm({ ids, status: target, label: `${ids.length} selected account${ids.length > 1 ? 's' : ''}` });
  };

  const askReset = (rows: AdminUserSummary[]) => {
    const eligible = rows.filter((row) => canResetPassword(row));
    const skipped = rows.length - eligible.length;
    if (eligible.length === 0) {
      toast.error('No selected account has a password. Google-only accounts cannot be reset.');
      return;
    }
    if (skipped > 0) toast.warning(`${skipped} Google-only account${skipped === 1 ? '' : 's'} will be left alone.`);
    setResetError(null);
    setResetTargets(eligible.map((row) => ({ id: row.id, fullName: row.fullName, email: row.email })));
  };

  const runReset = async () => {
    if (!resetTargets) return;
    setResetError(null);
    try {
      const response = await resetPasswords.run(resetTargets.map((target) => target.id));
      setResetTargets(null);
      setResetResults(response.resetResults ?? []);
      await usersQuery.refetch();
    } catch {
      return;
    }
  };

  const askDelete = (rows: AdminUserSummary[]) => {
    const ids = me ? rows.map((u) => u.id).filter((id) => id !== me.id) : rows.map((u) => u.id);
    if (ids.length === 0) {
      toast.error('You cannot delete your own account.');
      return;
    }
    const label = ids.length === 1 ? rows.find((u) => u.id === ids[0])?.fullName ?? '1 account' : `${ids.length} selected accounts`;
    setDeleteTargets({ ids, label });
  };

  const runDelete = async () => {
    if (!deleteTargets) return;
    try {
      const result = await deleteUsers.mutateAsync(deleteTargets.ids);
      toast.success(`${result.deleted} account${result.deleted === 1 ? '' : 's'} deleted.`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setDeleteTargets(null);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      const result = await changeStatus.mutateAsync({ ids: confirm.ids, status: confirm.status });
      toast.success(
        `${result.updated} account${result.updated === 1 ? '' : 's'} ${confirm.status === 'ACTIVE' ? 'activated' : 'suspended'}.`,
      );
    } catch {
      setConfirm(null);
      return;
    }
    setConfirm(null);
  };

  const runExportCsv = async () => {
    setIsExporting(true);
    try {
      const count = await exportUsersToCsv({
        role: role || undefined,
        status: status || undefined,
        search: search.trim() || undefined,
        majorId: majorId || undefined,
        curriculumVersionId: cohortId || undefined,
        sort: toUserSort(sorting),
      });
      if (count === 0) toast.info('No accounts to export.');
      else toast.success(`Exported ${count} account${count === 1 ? '' : 's'} to CSV.`);
    } catch {
      toast.error('Failed to export user accounts. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    me, role, setRole, status, setStatus, majorId, setMajorId, cohortId, setCohortId,
    search, setSearch, pagination, setPagination, sorting, setSorting,
    detailId, setDetailId, confirm, setConfirm, deleteTargets, setDeleteTargets, roleChange, setRoleChange, bulkRoleTargets, setBulkRoleTargets,
    creating, setCreating, resetTargets, setResetTargets, resetResults, setResetResults,
    resetError, setResetError, isExporting, changeStatus, deleteUsers, resetPasswords, majors, cohortOptions,
    studentCount, advisorCount, activeCount, suspendedCount, usersQuery, items, total, hasFilters,
    clearFilters, resetPage, askBulk, askDelete, askReset, runReset, runConfirm, runDelete, runExportCsv,
  };
}
