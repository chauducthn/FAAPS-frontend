import { Link } from 'react-router';
import { X } from '@phosphor-icons/react';
import { Pagination } from '../../components/Pagination';
import { UserInitials } from '../../components/UserInitials';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { backState } from '../../../../shared/lib/backLink';

const actionBtn =
  'inline-flex h-8 items-center rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary';

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

export function CohortStudentsTable(props: {
  cohortId: string, title: string, rows: CohortStudentRow[], total: number, page: number, pageSize: number,
  isLoading: boolean, isError: boolean, hasFilters: boolean, selected: Set<string>, allPageSelected: boolean,
  selectingAll?: boolean, hasAssignedSelected?: boolean, onToggleAll: () => void, onToggleOne: (id: string) => void,
  onSelectAll?: () => void, onClearSelection: () => void, onAssignSelected: () => void, onUnassignSelected: () => void,
  onAssignOne: (student: { id: string; name: string }) => void, onUnassignOne: (student: { id: string; name: string }) => void,
  onRetry: () => void, onPageChange: (page: number) => void,
}) {
  const { cohortId, title, rows, total, page, pageSize, isLoading, isError, hasFilters, selected, allPageSelected, selectingAll = false, hasAssignedSelected, onToggleAll, onToggleOne, onSelectAll, onClearSelection, onAssignSelected, onUnassignSelected, onAssignOne, onUnassignOne, onRetry, onPageChange } = props;
  const columns: StaticColumn<CohortStudentRow>[] = [
    {
      key: 'studentCode',
      header: 'Student ID',
      sortValue: (row) => row.studentCode,
      render: (row) => (
        <span className="font-mono text-[13px] font-medium text-ink-secondary">
          {row.studentCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Full name',
      sortValue: (row) => row.fullName,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserInitials name={row.fullName} />
          <span className="truncate text-sm font-semibold text-ink-primary">{row.fullName}</span>
        </div>
      ),
    },
    {
      key: 'advisorName',
      header: 'Current advisor',
      sortValue: (row) => row.advisorName ?? '',
      render: (row) => (
        <span className={row.advisorName ? 'text-sm text-ink-primary' : 'text-xs text-ink-subtle'}>
          {row.advisorName ?? 'No advisor assigned'}
        </span>
      ),
    },
    {
      key: 'assignedDate',
      header: 'Assigned',
      sortValue: (row) => row.assignedDate ?? '',
      render: (row) => (
        <span className="text-xs text-ink-muted">{row.assignedDate ? formatDate(row.assignedDate) : '—'}</span>
      ),
    },
    {
      key: 'request',
      header: 'Request',
      sortValue: (row) => (row.hasPendingRequest ? 1 : 0),
      render: (row) =>
        row.hasPendingRequest ? (
          <span className="text-xs font-semibold uppercase text-amber-700">
            Requested
          </span>
        ) : (
          <span className="text-xs text-ink-subtle">—</span>
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
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-brand/25 bg-brand-soft/70 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {selected.size} student{selected.size === 1 ? '' : 's'} selected
            </span>
            {onSelectAll && total > selected.size && (
              <button
                type="button"
                disabled={selectingAll}
                onClick={onSelectAll}
                className="rounded-md border border-brand/30 bg-white px-2 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft-strong/70 disabled:opacity-50"
              >
                {selectingAll ? 'Selecting…' : `Select all ${total}`}
              </button>
            )}
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-muted hover:bg-brand-soft-strong/80 hover:text-ink-primary"
            >
              <X className="size-3.5" aria-hidden /> Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAssignSelected}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Assign / reassign
            </button>
            {(hasAssignedSelected ?? rows.some((student) => selected.has(student.id) && student.advisorName)) && (
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
