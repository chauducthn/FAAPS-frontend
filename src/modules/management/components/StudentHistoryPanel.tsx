// Student assignment history view (supports both standalone Modal anatomy and inline panel).
import { CaretLeft as ChevronLeft, ClockCounterClockwise } from '@phosphor-icons/react';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
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
      <div className="min-w-0">
        <span className="block truncate font-medium text-ink-primary">{r.advisorName}</span>
        <span className="block truncate font-mono text-[12px] text-ink-muted">{r.advisorEmail}</span>
      </div>
    ),
  },
  {
    key: 'start',
    header: 'Start date',
    render: (r) => (
      <span className="text-ink-secondary tabular-nums">
        {r.assignedAt ? formatDateTime(r.assignedAt) : formatDate(r.assignedDate)}
      </span>
    ),
  },
  {
    key: 'end',
    header: 'End date',
    render: (r) => (
      <span className="text-ink-muted tabular-nums">
        {r.endDate ? formatDate(r.endDate) : 'Present'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <span
        className={cn(
          'inline-flex rounded-sm px-1.5 py-0.5 text-[11px] font-medium',
          r.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-line-soft text-ink-muted',
        )}
      >
        {r.status === 'ACTIVE' ? 'Active' : r.status.charAt(0) + r.status.slice(1).toLowerCase()}
      </span>
    ),
  },
  {
    key: 'assignedBy',
    header: 'Assigned by',
    render: (r) => (
      <span className="text-ink-secondary">{r.assignedByName ?? <span className="text-ink-subtle">—</span>}</span>
    ),
  },
  {
    key: 'notes',
    header: 'Note',
    render: (r) => (
      <span className="block max-w-[220px] text-xs text-ink-muted">
        {r.notes?.trim() ? r.notes : <span className="text-ink-subtle">—</span>}
      </span>
    ),
  },
];

export function StudentHistoryPanel({
  student,
  onBack,
  inModal = false,
}: {
  student: HistoryStudentTarget;
  onBack: () => void;
  inModal?: boolean;
}) {
  const { data: history, isLoading, isError, refetch } = useStudentHistory(student.id);
  const countText = `${history?.length ?? 0} record${(history?.length ?? 0) === 1 ? '' : 's'} · Newest first`;

  const table = (
    <StaticTable
      columns={columns}
      rows={history ?? []}
      rowKey={(record) => record.id}
      loading={isLoading}
      error={isError && !history ? 'Could not load the history.' : undefined}
      onRetry={() => refetch()}
      emptyTitle="This student has never been assigned an advisor."
      minWidth="720px"
    />
  );

  if (inModal) {
    return (
      <>
        <ModalHeader
          title="Assignment history"
          description={
            <>
              <span className="font-mono text-ink-secondary">{student.code}</span> · {student.name}
            </>
          }
          icon={<ClockCounterClockwise />}
          tone="neutral"
          onClose={onBack}
        />
        <ModalBody className="p-0">{table}</ModalBody>
        <ModalFooter
          start={<span className="text-xs text-ink-muted tabular-nums">{countText}</span>}
        >
          <button type="button" onClick={onBack} className={modalButtonClass('secondary')}>
            Close
          </button>
        </ModalFooter>
      </>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft bg-surface-page/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            Back to students
          </button>
          <span className="rounded-sm bg-line-soft px-2 py-0.5 font-mono text-xs font-medium text-ink-secondary">
            {student.code}
          </span>
          <span className="text-[13px] font-medium text-ink-primary">{student.name}</span>
        </div>
        <span className="text-xs text-ink-muted tabular-nums">{countText}</span>
      </div>
      {table}
    </section>
  );
}
