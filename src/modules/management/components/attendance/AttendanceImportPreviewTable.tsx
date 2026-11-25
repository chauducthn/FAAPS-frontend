import { cn } from '@/shared/lib/utils';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { AttendanceImportRow, AttendanceResult } from '../../types/attendance';

export function downloadAttendanceCsv(name: string, text: string) {
  const url = URL.createObjectURL(new Blob(['\ufeff', text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const RESULT_STYLE: Record<AttendanceResult, { label: string; className: string }> = {
  OK: { label: 'OK', className: 'bg-[#ecfdf5] text-[#047857]' },
  WARNING: { label: 'Warning', className: 'bg-[#fffbeb] text-[#b45309]' },
  FAIL: { label: 'Attendance fail', className: 'bg-red-50 text-red-600' },
};

export function ImportSummaryChip({ label, value, className }: { label: string; value: number; className?: string }) {
 return (
    <span className={cn('rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[var(--ink-muted)]', className)}>
      {label}: {value}
    </span>
  );
}

export function AttendanceImportPreviewTable({ rows }: { rows: AttendanceImportRow[] }) {
  const columns: StaticColumn<AttendanceImportRow>[] = [
    {
      key: 'line',
      header: 'Line',
      render: (row) => <span className="text-[var(--ink-muted)]">{row.lineNumber}</span>,
    },
    {
      key: 'student',
      header: 'Student ID',
      render: (row) => (
        <span className="font-semibold text-[var(--ink-primary)]">{row.studentCode || '—'}</span>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => <span className="text-[var(--ink-primary)]">{row.semesterCode || '—'}</span>,
    },
    {
      key: 'course',
      header: 'Course',
      render: (row) => <span className="text-[var(--ink-primary)]">{row.courseCode || '—'}</span>,
    },
    {
      key: 'absent',
      header: 'Absent / total',
      render: (row) => (
        <span className="text-[var(--ink-primary)]">
          {row.absentSessions ?? '—'} / {row.totalSessions ?? '—'}
        </span>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      render: (row) => {
        if (row.error) {
          return <span className="text-xs font-medium text-red-600">{row.error}</span>;
        }
        if (!row.result) return null;
        return (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              RESULT_STYLE[row.result].className,
            )}
          >
            {RESULT_STYLE[row.result].label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="max-h-[420px] overflow-auto rounded-lg border border-[var(--line)]">
      <StaticTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String(row.lineNumber)}
        stickyHeader
        minWidth="720px"
        emptyTitle="No rows to preview"
        emptyDescription="The imported file did not contain any attendance row."
      />
    </div>
  );
}
