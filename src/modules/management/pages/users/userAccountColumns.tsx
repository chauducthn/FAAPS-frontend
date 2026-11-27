import { GraduationCap, User as UserRound } from '@phosphor-icons/react';
import type { SortingState } from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { StatusBadge } from '../../components/StatusBadge';
import { UserInitials } from '../../components/UserInitials';
import { UserRowMenu } from '../../components/UserRowMenu';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../../types/admin';

export const USER_PAGE_SIZE = 10;
export const USER_ROLES: AdminUserRole[] = ['STUDENT', 'ADVISOR'];
export const USER_STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED'];
export const USER_ROLE_LABEL: Record<AdminUserRole, string> = {
  STUDENT: 'Student',
  ADVISOR: 'Advisor',
};

const ROLE_CHIP = 'inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium';

/** Short academic codes (major, cohort) in a quiet monospace; a dash when missing. */
function CodeCell({ value }: { value?: string | null }) {
  return value ? (
    <span className="font-mono text-[12.5px] text-ink-secondary">{value}</span>
  ) : (
    <span className="text-ink-subtle">—</span>
  );
}

const USER_SORT_FIELDS = new Set(['fullName', 'userId', 'email', 'role', 'major', 'cohort', 'status', 'createdAt']);

export function toUserSort(sorting: SortingState): UserSort {
  const active = sorting[0];
  if (!active || !USER_SORT_FIELDS.has(active.id)) return 'createdAt,desc';
  return `${active.id},${active.desc ? 'desc' : 'asc'}` as UserSort;
}

export function createUserAccountColumns(handlers: {
  myId?: string;
  onView: (id: string) => void;
  onRole: (user: AdminUserSummary) => void;
  onResetPassword: (user: AdminUserSummary) => void;
  onToggle: (user: AdminUserSummary) => void;
  onDelete: (user: AdminUserSummary) => void;
}): DataTableColumnDef<AdminUserSummary>[] {
  return [
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex max-w-[220px] min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} avatarUrl={row.original.avatarUrl} />
          <span title={row.original.fullName} className="truncate font-medium text-ink-primary">
            {row.original.fullName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'userId',
      header: 'Identifier',
      cell: ({ row }) => (
        <span
          title={row.original.userId}
          className="inline-block max-w-[220px] truncate align-middle font-mono text-[12.5px] text-ink-secondary"
        >
          {row.original.userId}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span title={row.original.email} className="block max-w-[230px] truncate text-ink-muted">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) =>
        row.original.role === 'STUDENT' ? (
          <span className={cn(ROLE_CHIP, 'bg-brand-soft text-brand-ink')}>
            <GraduationCap className="size-3.5" aria-hidden />
            Student
          </span>
        ) : (
          <span className={cn(ROLE_CHIP, 'bg-line-soft text-ink-secondary')}>
            <UserRound className="size-3.5" aria-hidden />
            Advisor
          </span>
        ),
    },
    {
      id: 'major',
      header: 'Major',
      accessorFn: (user) => user.majorCode ?? '',
      cell: ({ row }) => <CodeCell value={row.original.majorCode} />,
    },
    {
      id: 'cohort',
      header: 'Cohort',
      accessorFn: (user) => user.cohort ?? '',
      cell: ({ row }) => <CodeCell value={row.original.cohort} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end">
            <UserRowMenu
              user={user}
              isSelf={user.id === handlers.myId}
              onView={() => handlers.onView(user.id)}
              onRole={() => handlers.onRole(user)}
              onResetPassword={() => handlers.onResetPassword(user)}
              onToggle={() => handlers.onToggle(user)}
              onDelete={() => handlers.onDelete(user)}
            />
          </div>
        );
      },
    },
  ];
}
