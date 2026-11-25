import { Link } from 'react-router';
import { LoadBadge } from '../../components/LoadBadge';
import { UserInitials } from '../../components/UserInitials';
import { backState } from '../../../../shared/lib/backLink';
import { Pagination } from '../../components/Pagination';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import type { UnassignedStudent } from '../../types/admin';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import { cn } from '@/shared/lib/utils';

const actionBtn =
  'inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900';

export interface AdvisorRowItem {
  id: string;
  email: string;
  name: string;
  limit: number | null;
  chips: { key: string; majorCode: string; text: string; inPool: boolean; students: number }[];
}

export function createUnassignedColumns(): DataTableColumnDef<UnassignedStudent>[] {
  return [
    {
      accessorKey: 'studentCode',
      header: 'Student ID',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
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
          <span className="truncate font-semibold text-gray-900">{row.original.fullName}</span>
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
      cell: ({ row }) => <span className="text-gray-600">{row.original.cohort}</span>,
    },
  ];
}

export function AdvisorsTableSection({
  advisorList,
  page,
  pageSize,
  isLoading,
  isError,
  hasFilter,
  loadOf,
  onRetry,
  onAssignCohort,
  onPageChange,
}: {
  advisorList: AdvisorRowItem[];
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  hasFilter: boolean;
  loadOf: (id: string) => number;
  onRetry: () => void;
  onAssignCohort: (advisorId: string) => void;
  onPageChange: (page: number) => void;
}) {
  const start = page * pageSize;
  const rows = advisorList.slice(start, start + pageSize);

  const columns: StaticColumn<AdvisorRowItem>[] = [
    {
      key: 'advisor',
      header: 'Advisor',
      render: (advisor) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={advisor.name} />
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-gray-900">{advisor.name}</span>
            <span className="block truncate text-xs text-gray-500">{advisor.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'load',
      header: 'Students / limit',
      render: (advisor) => <LoadBadge count={loadOf(advisor.id)} limit={advisor.limit} />,
    },
    {
      key: 'cohorts',
      header: 'Cohorts',
      render: (advisor) =>
        advisor.chips.length === 0 ? (
          <span className="text-xs text-gray-400">No cohort yet</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {advisor.chips.map((chip) => (
              <span
                key={chip.key}
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium',
                  chip.students > 0
                    ? 'bg-orange-50 text-[#9a3412] ring-1 ring-inset ring-orange-200/80'
                    : 'bg-gray-100 text-gray-600',
                )}
                title={chip.inPool ? 'Configured for this cohort' : 'Has students, not in the cohort advisor list'}
              >
                {chip.text} · {chip.students}
              </span>
            ))}
          </div>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (advisor) => (
        <div className="flex justify-end gap-1.5">
          <button type="button" className={actionBtn} onClick={() => onAssignCohort(advisor.id)}>
            Assign cohort
          </button>
          <Link
            to={`/admin/assignments/advisors/${advisor.id}`}
            state={backState('/admin/assignments?tab=advisors', 'Advisor Assignments · Advisors tab')}
            className={actionBtn}
          >
            Details &amp; history
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <StaticTable
        columns={columns}
        rows={rows}
        rowKey={(advisor) => advisor.id}
        loading={isLoading}
        error={isError ? 'Could not load this list.' : undefined}
        onRetry={onRetry}
        emptyTitle={hasFilter ? 'No advisors match your filters.' : 'No active advisors.'}
        minWidth="780px"
      />
      <Pagination page={page} pageSize={pageSize} total={advisorList.length} noun="advisors" onChange={onPageChange} />
    </div>
  );
}
