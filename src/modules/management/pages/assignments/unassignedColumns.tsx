import { Bell, UserPlus } from 'lucide-react';
import { UserInitials } from '../../components/UserInitials';
import type { UnassignedStudent } from '../../types/admin';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';

export function createUnassignedColumns(
  onAssignOne: (student: { id: string; name: string; cohortId?: string }) => void,
): DataTableColumnDef<UnassignedStudent>[] {
  return [
    {
      accessorKey: 'studentCode',
      header: 'Student ID',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-medium text-gray-700">
          {row.original.studentCode}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} />
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-gray-900">{row.original.fullName}</span>
            {row.original.hasPendingRequest && (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#C2410C]">
                <Bell className="size-3" aria-hidden />
                Requested
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'majorCode',
      header: 'Major',
      enableSorting: false,
      cell: ({ row }) => <span className="text-gray-600">{row.original.majorCode}</span>,
    },
    {
      accessorKey: 'cohort',
      header: 'Cohort',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-gray-700">
          {row.original.cohort}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onAssignOne({ id: row.original.id, name: row.original.fullName, cohortId: row.original.cohortId })}
            aria-label={`Assign advisor to ${row.original.fullName}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/60 px-2.5 text-xs font-semibold text-[#C2410C] transition-colors hover:border-[#F26F21] hover:bg-[#F26F21] hover:text-white"
          >
            <UserPlus className="size-3.5" aria-hidden />
            Assign advisor
          </button>
        </div>
      ),
    },
  ];
}
