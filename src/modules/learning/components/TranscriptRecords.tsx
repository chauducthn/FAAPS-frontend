// Student / Transcript: the course records of the student, filterable by semester.

import { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { TranscriptRow } from '../../academic/services/studentAcademicService';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PASSED: { label: 'Passed', className: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800 ring-red-200' },
 IN_PROGRESS: { label: 'In progress', className: 'bg-blue-100 text-blue-800 ring-blue-200' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  EXEMPTED: { label: 'Exempted', className: 'bg-purple-100 text-purple-800 ring-purple-200' },
};

export function TranscriptStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700 ring-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}
export function TranscriptRecords({
  rows,
  isLoading,
  isError,
  onRetry,
}: {
  rows: TranscriptRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const [semester, setSemester] = useState('');
  const semesters = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows ?? [])
      if (!seen.has(row.semesterCode))
        seen.set(row.semesterCode, row.semesterName || row.semesterCode);
    return [...seen.entries()];
  }, [rows]);
 const visible = (rows ?? []).filter((row) => !semester || row.semesterCode === semester);

  const columns: StaticColumn<TranscriptRow>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (row) => (
        <>
          <span className="font-semibold text-[var(--ink-primary)]">{row.courseCode}</span>
          <span className="text-[var(--ink-muted)]"> · {row.courseName}</span>
        </>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => (
        <span className="text-[var(--ink-muted)]">{row.semesterName || row.semesterCode}</span>
      ),
    },
    {
      key: 'credits',
      header: 'Credits',
      align: 'right',
      render: (row) => row.credits,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      render: (row) => row.finalScore ?? '—',
    },
    {
      key: 'attempt',
      header: 'Attempt',
      align: 'right',
      render: (row) => row.attemptNumber,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <TranscriptStatusBadge status={row.status} />,
    },
  ];

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-soft)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink-primary)]">Course Records</h2>
          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
            {rows ? `${visible.length} of ${rows.length} record(s)` : 'Your grades by course'}
          </p>
        </div>
        <select
          aria-label="Filter by semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          disabled={semesters.length === 0}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[13px] text-[var(--ink-primary)] outline-none focus:border-[var(--brand)] disabled:opacity-60"
        >
          <option value="">All semesters</option>
          {semesters.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <StaticTable
        columns={columns}
        rows={visible}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? 'Unable to load your transcript' : undefined}
        onRetry={onRetry}
        emptyTitle={
          rows?.length ? 'No records in this semester.' : 'No transcript records yet.'
        }
        emptyDescription={
          rows?.length ? undefined : 'Import your transcript below to see your course records.'
        }
      />
    </section>
  );
}
