import { ArrowsLeftRight, ClockCounterClockwise, UserMinus } from '@phosphor-icons/react';
import { UserInitials } from '../../components/UserInitials';
import type { HistoryStudentTarget } from '../../components/StudentHistoryPanel';
import type { AssignmentStudent } from '../../types/admin';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';

const formatAssignedDate = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })
    : '—';

export function createAssignedColumns(actions: {
  onFilterAdvisor: (advisorId: string) => void;
  onHistory: (student: HistoryStudentTarget) => void;
  onReassign: (student: { id: string; name: string; cohortId?: string; advisorId?: string | null }) => void;
  onUnassign: (student: { id: string; name: string }) => void;
}): DataTableColumnDef<AssignmentStudent>[] {
  return [
    {
      accessorKey: 'studentCode',
      header: 'Student ID',
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-medium text-gray-700">
          {row.original.studentCode}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} avatarUrl={row.original.avatarUrl} />
          <span className="truncate font-semibold text-gray-900">{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'majorCode',
      header: 'Major',
      cell: ({ row }) => <span className="text-gray-600">{row.original.majorCode}</span>,
    },
    {
      accessorKey: 'cohort',
      header: 'Cohort',
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-gray-700">{row.original.cohort}</span>
      ),
    },
    {
      accessorKey: 'advisorName',
      header: 'Advisor',
      cell: ({ row }) =>
        row.original.advisorId && row.original.advisorName ? (
          <button
            type="button"
            onClick={() => actions.onFilterAdvisor(row.original.advisorId as string)}
            title={`Filter assigned students by ${row.original.advisorName}`}
            className="truncate text-left text-[13px] font-semibold text-[#C2410C] transition-colors hover:underline"
          >
            {row.original.advisorName}
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      accessorKey: 'assignedDate',
      header: 'Assigned Date',
      cell: ({ row }) => (
        <span className="text-[13px] text-gray-600 tabular-nums">
          {formatAssignedDate(row.original.assignedDate)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() =>
              actions.onHistory({
                id: row.original.id,
                code: row.original.studentCode,
                name: row.original.fullName,
              })
            }
            title="Assignment history"
            aria-label={`View history for ${row.original.fullName}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <ClockCounterClockwise className="size-3.5" aria-hidden />
            History
          </button>
          <button
            type="button"
            onClick={() =>
              actions.onReassign({
                id: row.original.id,
                name: row.original.fullName,
                cohortId: row.original.cohortId,
                advisorId: row.original.advisorId,
              })
            }
            title="Reassign advisor"
            aria-label={`Reassign ${row.original.fullName}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-orange-200 bg-orange-50/60 px-2 text-xs font-semibold text-[#C2410C] transition-colors hover:border-[#F26F21] hover:bg-[#F26F21] hover:text-white"
          >
            <ArrowsLeftRight className="size-3.5" aria-hidden />
            Reassign
          </button>
          <button
            type="button"
            onClick={() => actions.onUnassign({ id: row.original.id, name: row.original.fullName })}
            title="Unassign advisor"
            aria-label={`Unassign ${row.original.fullName}`}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 bg-white px-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <UserMinus className="size-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
  ];
}
