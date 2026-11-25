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
export const USER_STATUSES: AdminUserStatus[] = ['ACTIVE', 'SUSPENDED', 'LOCKED', 'INACTIVE'];
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
  onAssignments: (id: string, state: ReturnType<typeof backState>) => void;
  onToggle: (user: AdminUserSummary) => void;
}): DataTableColumnDef<AdminUserSummary>[] {
  return [
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} />
          <span className="truncate font-semibold text-gray-900">{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'userId',
      header: 'Identifier',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-gray-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
          {row.original.userId}
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: false,
      cell: ({ row }) => <span className="text-[#555f6f]">{row.original.email}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.role === 'STUDENT' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-[#9a3412] ring-1 ring-inset ring-orange-200">
            <GraduationCap className="size-3" aria-hidden />
            Student
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-800 ring-1 ring-inset ring-indigo-200">
            <UserRound className="size-3" aria-hidden />
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
              onAssignments={
                user.role === 'ADVISOR'
                  ? () =>
                      handlers.onAssignments(
                        user.id,
                        backState('/admin/users?role=ADVISOR', 'User Accounts · Advisor filter'),
                      )
                  : undefined
              }
              onToggle={() => handlers.onToggle(user)}
            />
          </div>
        );
      },
    },
  ];
}
