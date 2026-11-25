import { Link } from 'react-router';
import { Pagination } from '../../components/Pagination';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { cn } from '@/shared/lib/utils';
import { backState } from '../../../../shared/lib/backLink';

const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

export interface CohortStudentRow {
  id: string;
  studentCode: string;
  fullName: string;
  advisorName: string | null;
  assignedDate: string | null;
  hasPendingRequest: boolean;
}

export function CohortStudentsTable({
  cohortId,
  title,
  rows,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  hasFilters,
  selected,
  allPageSelected,
  onToggleAll,
  onToggleOne,
  onClearSelection,
  onAssignSelected,
  onUnassignSelected,
  onAssignOne,
  onUnassignOne,
  onRetry,
  onPageChange,
}: {
  cohortId: string;
  title: string;
  rows: CohortStudentRow[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  selected: Set<string>;
  allPageSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onClearSelection: () => void;
  onAssignSelected: () => void;
  onUnassignSelected: () => void;
  onAssignOne: (student: { id: string; name: string }) => void;
  onUnassignOne: (student: { id: string; name: string }) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}) {
  const columns: StaticColumn<CohortStudentRow>[] = [
    {
      key: 'studentCode',
      header: 'Student ID',
      render: (row) => <span className="text-[13px] font-semibold">{row.studentCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Full name',
      render: (row) => <span className="text-sm font-semibold">{row.fullName}</span>,
    },
    {
      key: 'advisorName',
      header: 'Current advisor',
      render: (row) => <span className="text-sm">{row.advisorName ?? 'No advisor assigned'}</span>,
    },
    {
      key: 'assignedDate',
      header: 'Assigned',
      render: (row) => (
        <span className="text-[13px]">{row.assignedDate ? formatDate(row.assignedDate) : '—'}</span>
      ),
    },
    {
      key: 'request',
      header: 'Request',
      render: (row) =>
        row.hasPendingRequest ? (
          <span className="rounded-full bg-[#fffbeb] px-2 py-0.5 text-[11px] font-bold uppercase text-[#b45309]">
            Requested
          </span>
        ) : (
          <span className="text-[13px] text-[var(--ink-subtle)]">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button type="button" className={btn} onClick={() => onAssignOne({ id: row.id, name: row.fullName })}>
            {row.advisorName ? 'Reassign' : 'Assign'}
          </button>
          {row.advisorName && (
            <button type="button" className={btn} onClick={() => onUnassignOne({ id: row.id, name: row.fullName })}>
              Unassign
            </button>
          )}
          <Link
            to={`/admin/assignments/students/${row.id}/history`}
            state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)}
            className={btn}
          >
            History
          </Link>
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-xl bg-white shadow-sm">
      {selected.size > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 border-b border-[#e7eefe] p-4 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold text-[#151c27]">
            {selected.size} student{selected.size === 1 ? '' : 's'} selected
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClearSelection} className="px-2 text-sm font-semibold text-[#f37021] hover:underline">
              Clear selection
            </button>
            <button type="button" onClick={onAssignSelected} className={cn(
                'rounded-lg bg-[#f37021] px-4 py-2 text-sm',
                'font-semibold text-white hover:bg-[#d95f15]'
              )}>
              Assign / reassign
            </button>
            {rows.some((student) => selected.has(student.id) && student.advisorName) && (
              <button type="button" onClick={onUnassignSelected} className={cn(
                  'rounded-lg border border-red-300 px-4 py-2 text-sm',
                  'font-semibold text-red-700'
                )}>
                Unassign selected
              </button>
            )}
          </div>
        </div>
      )}
      <StaticTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? 'Could not load students.' : undefined}
        onRetry={onRetry}
        emptyTitle={hasFilters ? 'No students match your filters.' : 'This cohort has no students.'}
        minWidth="720px"
        selection={{
          selectedIds: selected,
          allSelected: allPageSelected,
          someSelected: rows.some((row) => selected.has(row.id)),
          onToggleAll: () => onToggleAll(),
          onToggleOne: (id) => onToggleOne(id),
          label: (row) => row.fullName,
        }}
      />
      <Pagination page={page} pageSize={pageSize} total={total} noun="students" onChange={onPageChange} />
    </section>
  );
}
