// Inline student assignment history panel rendered inside AdvisorDetailsModal.
import { CaretLeft as ChevronLeft } from '@phosphor-icons/react';
import { useStudentHistory } from '../hooks/queries/useAdminAssignments';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import type { AssignmentHistoryRecord } from '../types/admin-assignments';
import { cn } from '@/shared/lib/utils';

export interface HistoryStudentTarget {
  id: string;
  code: string;
  name: string;
}

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

const columns: StaticColumn<AssignmentHistoryRecord>[] = [
  {
    key: 'advisor',
    header: 'Assigned advisor',
    render: (r) => (
      <div>
        <span className="block text-[13px] font-semibold text-gray-900">{r.advisorName}</span>
        <span className="block text-xs text-gray-500">{r.advisorEmail}</span>
      </div>
    ),
  },
  {
    key: 'start',
    header: 'Start date',
    render: (r) => <span className="text-[13px]">{r.assignedAt ? formatDateTime(r.assignedAt) : formatDate(r.assignedDate)}</span>,
  },
  {
    key: 'end',
    header: 'End date',
    render: (r) => <span className="text-[13px]">{r.endDate ? formatDate(r.endDate) : 'Present'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span className={cn('text-xs font-semibold', r.status === 'ACTIVE' ? 'text-emerald-700' : 'text-gray-500')}>
        {r.status}
      </span>
    ),
  },
  {
    key: 'assignedBy',
    header: 'Assigned by',
    render: (r) => <span className="text-[13px] text-gray-700">{r.assignedByName ?? '—'}</span>,
  },
  {
    key: 'notes',
    header: 'Note',
    render: (r) => <span className="block max-w-[220px] text-xs text-gray-600">{r.notes?.trim() ? r.notes : '—'}</span>,
  },
];

export function StudentHistoryPanel({
  student,
  onBack,
}: {
  student: HistoryStudentTarget;
  onBack: () => void;
}) {
  const { data: history, isLoading, isError, refetch } = useStudentHistory(student.id);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            Back to students
          </button>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-700">
            {student.code}
          </span>
          <span className="text-[13px] font-semibold text-gray-900">{student.name}</span>
        </div>
        <span className="text-xs text-gray-500 tabular-nums">
          {history?.length ?? 0} record{(history?.length ?? 0) === 1 ? '' : 's'} · Newest first
        </span>
      </div>

      <StaticTable
        columns={columns}
        rows={history ?? []}
        rowKey={(record) => record.id}
        loading={isLoading}
        error={isError && !history ? 'Could not load the history.' : undefined}
        onRetry={() => refetch()}
        emptyTitle="This student has never been assigned an advisor."
        minWidth="760px"
      />
    </section>
  );
}
