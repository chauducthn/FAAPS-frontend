import { Link, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
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
    <div className="flex w-full flex-col gap-6">
      <div>
        <Link to={backTarget.to} className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
          <ChevronLeft className="size-4" />
          Back to {backTarget.label}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Student Assignment History</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Read-only assignment records{student ? ` for ${student.fullName} · ${student.userId}` : ''}
        </p>
      </div>

      {student && (
        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#151c27]">{student.fullName}</h2>
              <p className="text-sm text-[#555f6f]">
                {student.userId} · {student.email}
              </p>
            </div>
            <StatusBadge status={student.status} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Tile label="Cohort code">{student.curriculumCode ?? '—'}</Tile>
            <Tile label="Major">{student.majorName ?? '—'}</Tile>
            <Tile label="Current advisor">{current ? current.advisorName : 'No advisor assigned'}</Tile>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between p-5 sm:px-6">
          <h2 className="text-base font-semibold text-[#151c27]">All assignment records</h2>
          <p className="text-[13px] text-[#555f6f]">{history?.length ?? 0} records · Newest first</p>
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
