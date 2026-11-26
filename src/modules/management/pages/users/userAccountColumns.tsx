import { GraduationCap, UserRound } from 'lucide-react';
import type { SortingState } from '@tanstack/react-table';
import { StatusBadge } from '../../components/StatusBadge';
import { UserInitials } from '../../components/UserInitials';
import { UserRowMenu } from '../../components/UserRowMenu';
import { backState } from '../../../../shared/lib/backLink';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { AdminUserRole, AdminUserStatus, AdminUserSummary, UserSort } from '../../types/admin';

export const USER_PAGE_SIZE = 10;
export const USER_ROLES: AdminUserRole[] = ['STUDENT', 'ADVISOR'];
export const USER_STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED'];
export const USER_ROLE_LABEL: Record<AdminUserRole, string> = {
  STUDENT: 'Student',
  ADVISOR: 'Advisor',
};

/** The backend sorts users by a whitelist; the table only offers the ones it can serve. */
export function toUserSort(sorting: SortingState): UserSort {
  const active = sorting[0];
  if (!active || active.id !== 'fullName') return 'createdAt,desc';
  return active.desc ? 'fullName,desc' : 'fullName,asc';
}

export function createUserAccountColumns(handlers: {
  myId?: string;
  onView: (id: string) => void;
  onRole: (user: AdminUserSummary) => void;
  onResetPassword: (user: AdminUserSummary) => void;
  onAssignments: (path: string, state: ReturnType<typeof backState>) => void;
  onToggle: (user: AdminUserSummary) => void;
  onDelete: (user: AdminUserSummary) => void;
}): DataTableColumnDef<AdminUserSummary>[] {
  return [
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex max-w-[220px] min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} />
          <span title={row.original.fullName} className="truncate font-semibold text-gray-900">
            {row.original.fullName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'userId',
      header: 'Identifier',
      enableSorting: false,
      cell: ({ row }) => (
        <span
          title={row.original.userId}
          className="inline-block max-w-[220px] truncate align-middle font-mono text-[13px] text-gray-700"
        >
          {row.original.userId}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: false,
      cell: ({ row }) => (
        <span title={row.original.email} className="block max-w-[230px] truncate text-[#555f6f]">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.role === 'STUDENT' ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C2410C]">
            <GraduationCap className="size-3.5" aria-hidden />
            Student
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-indigo-700">
            <UserRound className="size-3.5" aria-hidden />
            Advisor
          </span>
        ),
    },
    {
      id: 'major',
      header: 'Major',
      enableSorting: false,
      accessorFn: (user) => user.majorCode ?? '',
      cell: ({ row }) => <span className="text-[#555f6f]">{row.original.majorCode || '—'}</span>,
    },
    {
      id: 'cohort',
      header: 'Cohort',
      enableSorting: false,
      accessorFn: (user) => user.cohort ?? '',
      cell: ({ row }) => <span className="text-[#555f6f]">{row.original.cohort || '—'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
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
              onAssignments={() =>
                handlers.onAssignments(
                  user.role === 'ADVISOR'
                    ? `/admin/assignments/advisors/${user.id}`
                    : `/admin/assignments/students/${user.id}/history`,
                  backState(
                    `/admin/users?role=${user.role}`,
                    `User Accounts · ${USER_ROLE_LABEL[user.role]} filter`,
                  ),
                )
              }
              onToggle={() => handlers.onToggle(user)}
              onDelete={() => handlers.onDelete(user)}
            />
          </div>
        );
      },
    },
  ];
}
