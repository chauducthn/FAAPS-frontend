import { Link, useParams } from 'react-router';
import { CaretLeft as ChevronLeft } from '@phosphor-icons/react';
import { StatusBadge } from '../../components/StatusBadge';
import { useBackTarget } from '../../../../shared/lib/backLink';
import { useStudentHistory } from '../../hooks/queries/useAdminAssignments';
import { useAdminUser } from '../../hooks/queries/useAdminUsers';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import type { AssignmentHistoryRecord } from '../../types/admin-assignments';
import { cn } from '@/shared/lib/utils';

// Dates from the API are plain yyyy-MM-dd values; parse them as local dates.
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
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

const historyColumns: StaticColumn<AssignmentHistoryRecord>[] = [
  {
    key: 'advisor',
    header: 'Assigned advisor',
    render: (record) => (
      <span className="text-sm font-semibold">
        {record.advisorName}
        <span className="block text-xs font-normal text-[var(--ink-muted)]">{record.advisorEmail}</span>
      </span>
    ),
  },
  {
    key: 'start',
    header: 'Start date',
    render: (record) => (
      <span className="text-sm">{record.assignedAt ? formatDateTime(record.assignedAt) : formatDate(record.assignedDate)}</span>
    ),
  },
  {
    key: 'end',
    header: 'End date',
    render: (record) => <span className="text-sm">{record.endDate ? formatDate(record.endDate) : 'Present'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (record) => (
      <span className={cn('text-sm font-semibold', record.status === 'ACTIVE' ? 'text-[#047857]' : 'text-[var(--ink-muted)]')}>
        {record.status}
      </span>
    ),
  },
  {
    key: 'assignedBy',
    header: 'Assigned by',
    render: (record) => <span className="text-sm">{record.assignedByName ?? '—'}</span>,
  },
  {
    key: 'notes',
    header: 'Note',
    render: (record) => (
      <span className="block max-w-[220px] text-[13px]">{record.notes?.trim() ? record.notes : '—'}</span>
    ),
  },
];

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#151c27]">{children}</p>
    </div>
  );
}

export default function StudentHistory() {
  const { studentId } = useParams();
  const { data: history, isLoading, isError, refetch } = useStudentHistory(studentId);
  const { data: student } = useAdminUser(studentId ?? null);

  const current = history?.find((h) => h.endDate === null && h.status === 'ACTIVE');
  const backTarget = useBackTarget(
    student?.curriculumVersionId ? `/admin/assignments/cohorts/${student.curriculumVersionId}` : '/admin/assignments',
    student?.curriculumVersionId ? 'Cohort Assignment Details' : 'Advisor Assignments'
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <Link to={backTarget.to} className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#F26F21]">
          <ChevronLeft className="size-3.5" />
          Back to {backTarget.label}
        </Link>
      </div>

      {student && (
        <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">{student.fullName}</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono font-medium text-gray-700">{student.userId}</span>
                {' · '}
                {student.email}
              </p>
            </div>
            <StatusBadge status={student.status} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Tile label="Cohort code">{student.curriculumCode ?? '—'}</Tile>
            <Tile label="Major">{student.majorName ?? '—'}</Tile>
            <Tile label="Current advisor">{current ? current.advisorName : 'No advisor assigned'}</Tile>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">All assignment records</h2>
          <p className="text-xs text-gray-500 tabular-nums">{history?.length ?? 0} records · Newest first</p>
        </div>
        <StaticTable
          columns={historyColumns}
          rows={history ?? []}
          rowKey={(record) => record.id}
          loading={isLoading}
          error={isError && !history ? 'Could not load the history.' : undefined}
          onRetry={() => refetch()}
          emptyTitle="This student has never been assigned an advisor."
          minWidth="820px"
        />
      </section>
    </div>
  );
}
