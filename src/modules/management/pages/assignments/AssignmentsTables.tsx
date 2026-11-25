import { Link } from 'react-router';
import { LoadBadge } from '../../components/LoadBadge';
import { UserInitials } from '../../components/UserInitials';
import { backState } from '../../../../shared/lib/backLink';
import { Pagination } from '../../components/Pagination';
import type { UnassignedStudent } from '../../types/admin';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import { cn } from '@/shared/lib/utils';

const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';
const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

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
        <span className="font-semibold tabular-nums text-[#151c27]">{row.original.studentCode}</span>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={row.original.fullName} />
          <span className="truncate font-semibold text-[#151c27]">{row.original.fullName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'majorCode',
      header: 'Major',
      enableSorting: false,
      cell: ({ row }) => <span className="text-[#555f6f]">{row.original.majorCode}</span>,
    },
    {
      accessorKey: 'cohort',
      header: 'Cohort',
      enableSorting: false,
      cell: ({ row }) => <span className="text-[#555f6f]">{row.original.cohort}</span>,
    },
  ];
}

function TableState({
  cols,
  loading,
  error,
  empty,
  onRetry,
}: {
  cols: number;
  loading: boolean;
  error: boolean;
  empty: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="border-t border-[#e7eefe]">
            <td colSpan={cols} className="px-4 py-5">
              <div className="h-4 animate-pulse rounded bg-gray-100" />
            </td>
          </tr>
        ))}
      </>
    );
  }
  return (
    <tr className="border-t border-[#e7eefe]">
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-[#555f6f]">
        {error ? (
          <>
            Could not load this list.{' '}
            <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
              Retry
            </button>
          </>
        ) : (
          empty
        )}
      </td>
    </tr>
  );
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
  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="bg-[rgba(240,243,255,0.7)]">
            <tr>
              <th className={th}>Advisor</th>
              <th className={th}>Students / limit</th>
              <th className={th}>Cohorts</th>
              <th className={cn(th, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isError || advisorList.length === 0 ? (
              <TableState
                cols={4}
                loading={isLoading}
                error={isError}
                empty={hasFilter ? 'No advisors match your filters.' : 'No active advisors.'}
                onRetry={onRetry}
              />
            ) : (
              advisorList.slice(start, start + pageSize).map((a) => (
                <tr key={a.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                  <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">
                    {a.name}
                    <span className="block text-xs font-normal text-[#555f6f]">{a.email}</span>
                  </td>
                  <td className="px-3 py-4">
                    <LoadBadge count={loadOf(a.id)} limit={a.limit} />
                  </td>
                  <td className="px-3 py-4">
                    {a.chips.length === 0 ? (
                      <span className="text-[13px] text-[#98a2b3]">No cohort yet</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {a.chips.map((c) => (
                          <span
                            key={c.key}
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              c.students > 0 ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'bg-gray-100 text-[#555f6f]',
                            )}
                            title={c.inPool ? 'Configured for this cohort' : 'Has students, not in the cohort advisor list'}
                          >
                            {c.text} · {c.students}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" className={btn} onClick={() => onAssignCohort(a.id)}>
                        Assign cohort
                      </button>
                      <Link
                        to={`/admin/assignments/advisors/${a.id}`}
                        state={backState('/admin/assignments?tab=advisors', 'Advisor Assignments · Advisors tab')}
                        className={btn}
                      >
                        Details &amp; history
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={advisorList.length} noun="advisors" onChange={onPageChange} />
    </section>
  );
}
