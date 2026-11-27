import { cn } from '@/shared/lib/utils';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import { maxAbsentSessions, type AttendanceRule } from '../../types/attendance';

export interface CourseAttendanceRow {
  id: string;
  code: string;
  name: string;
  rule: AttendanceRule;
  custom: boolean;
}

interface Props {
  rows: CourseAttendanceRow[];
  loading: boolean;
  isError: boolean;
  customOnly: boolean;
  isRemoving: boolean;
  onRetry: () => void;
  onEdit: (row: CourseAttendanceRow) => void;
 onReset: (row: CourseAttendanceRow) => void;
}

export function CourseConditionsTable({
  rows,
  loading,
  isError,
  customOnly,
  isRemoving,
  onRetry,
 onEdit,
  onReset,
}: Props) {
  const columns: StaticColumn<CourseAttendanceRow>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (row) => (
        <>
          <span className="font-semibold text-[var(--ink-primary)]">{row.code}</span>
          {row.name && (
            <span className="block max-w-[260px] truncate text-xs text-[var(--ink-muted)]">{row.name}</span>
          )}
        </>
      ),
    },
    {
      key: 'sessions',
      header: 'Sessions',
      align: 'right',
      render: (row) => row.rule.totalSessions,
    },
    {
      key: 'minAttendance',
      header: 'Min attendance',
      align: 'right',
      render: (row) => `${row.rule.minAttendancePercent}%`,
    },
    {
      key: 'maxAbsent',
      header: 'Max absent',
      align: 'right',
      render: (row) => <span className="font-semibold">{maxAbsentSessions(row.rule)}</span>,
    },
    {
      key: 'warnAt',
      header: 'Warn at',
      align: 'right',
      render: (row) => <span className="text-[#b45309]">{row.rule.warnAbsentSessions}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      render: (row) => (
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            row.custom ? 'bg-[var(--brand-soft)] text-[var(--brand-ink)]' : 'bg-line-soft text-[var(--ink-muted)]',
          )}
        >
          {row.custom ? 'Custom' : 'Default'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${row.code}`}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]"
          >
            Edit
          </button>
          {row.custom && (
            <button
              type="button"
              onClick={() => onReset(row)}
              disabled={isRemoving}
              aria-label={`Use default for ${row.code}`}
              className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              Use default
            </button>
          )}
        </div>
      ),
    },
  ];

  const showError = isError && !customOnly;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
      <StaticTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        error={showError ? 'Could not load the courses.' : undefined}
        onRetry={onRetry}
        minWidth="720px"
        emptyTitle={
          customOnly ? 'No course has its own condition yet.' : 'No courses match your search.'
        }
      />
    </div>
  );
}
