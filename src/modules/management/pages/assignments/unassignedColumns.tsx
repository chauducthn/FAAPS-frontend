import { Bell, UserPlus } from '@phosphor-icons/react';
import { UserInitials } from '../../components/UserInitials';
import type { UnassignedStudent } from '../../types/admin';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';

export function createUnassignedColumns(
  onAssignOne: (student: { id: string; name: string; cohortId?: string }) => void,
): DataTableColumnDef<UnassignedStudent>[] {
  return [
    {
      accessorKey: 'studentCode',
      header: 'Identifier',
      cell: ({ row }) => (
        <span className="font-mono text-[12.5px] text-ink-secondary">
          {row.original.studentCode}
        </span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex max-w-[260px] min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} avatarUrl={row.original.avatarUrl} />
          <div className="flex min-w-0 items-center gap-2">
            <span title={row.original.fullName} className="truncate font-medium text-ink-primary">{row.original.fullName}</span>
            {row.original.hasPendingRequest && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-ink">
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
      cell: ({ row }) =>
        row.original.majorCode ? (
          <span className="font-mono text-[12.5px] text-ink-secondary">{row.original.majorCode}</span>
        ) : (
          <span className="text-ink-subtle">—</span>
        ),
    },
    {
      accessorKey: 'cohort',
      header: 'Cohort',
      cell: ({ row }) =>
        row.original.cohort ? (
          <span className="font-mono text-[12.5px] text-ink-secondary">{row.original.cohort}</span>
        ) : (
          <span className="text-ink-subtle">—</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onAssignOne({ id: row.original.id, name: row.original.fullName, cohortId: row.original.cohortId })}
            aria-label={`Assign advisor to ${row.original.fullName}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft/60 px-2.5 text-xs font-medium text-brand-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
          >
            <UserPlus className="size-3.5" aria-hidden />
            Assign advisor
          </button>
        </div>
      ),
    },
  ];
}
