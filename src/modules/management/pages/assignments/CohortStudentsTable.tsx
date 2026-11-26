import { Link } from 'react-router';
import { X } from '@phosphor-icons/react';
import { Pagination } from '../../components/Pagination';
import { UserInitials } from '../../components/UserInitials';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { backState } from '../../../../shared/lib/backLink';

const actionBtn =
  'inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900';

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
      render: (row) => (
        <span className="font-mono text-[13px] font-medium text-gray-700">
          {row.studentCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Full name',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={row.fullName} />
          <span className="truncate text-sm font-semibold text-gray-900">{row.fullName}</span>
        </div>
      ),
    },
    {
      key: 'advisorName',
      header: 'Current advisor',
      render: (row) => (
        <span className={row.advisorName ? 'text-sm text-gray-800' : 'text-xs text-gray-400'}>
          {row.advisorName ?? 'No advisor assigned'}
        </span>
      ),
    },
    {
      key: 'assignedDate',
      header: 'Assigned',
      render: (row) => (
        <span className="text-xs text-gray-500">{row.assignedDate ? formatDate(row.assignedDate) : '—'}</span>
      ),
    },
    {
      key: 'request',
      header: 'Request',
      render: (row) =>
        row.hasPendingRequest ? (
          <span className="text-xs font-semibold uppercase text-amber-700">
            Requested
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button type="button" className={actionBtn} onClick={() => onAssignOne({ id: row.id, name: row.fullName })}>
            {row.advisorName ? 'Reassign' : 'Assign'}
          </button>
          {row.advisorName && (
            <button type="button" className={actionBtn} onClick={() => onUnassignOne({ id: row.id, name: row.fullName })}>
              Unassign
            </button>
          )}
          <Link
            to={`/admin/assignments/students/${row.id}/history`}
            state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)}
            className={actionBtn}
          >
            History
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-orange-200/80 bg-orange-50/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#F26F21] px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {selected.size} student{selected.size === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-orange-100/80 hover:text-gray-900"
            >
              <X className="size-3.5" aria-hidden /> Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAssignSelected}
              className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14]"
            >
              Assign / reassign
            </button>
            {rows.some((student) => selected.has(student.id) && student.advisorName) && (
              <button
                type="button"
                onClick={onUnassignSelected}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
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
    </div>
  );
}
