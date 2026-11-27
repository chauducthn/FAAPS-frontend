// Student / Academic Transcript: searchable, filterable course grade records.

import { useMemo, useState, type ReactNode } from 'react';
import { FileText, MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { TranscriptRow } from '../../academic/services/studentAcademicService';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PASSED: { label: 'Passed', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80' },
  FAILED: { label: 'Failed', className: 'bg-red-50 text-red-700 ring-red-200/80' },
  IN_PROGRESS: { label: 'Studying', className: 'bg-blue-50 text-blue-700 ring-blue-200/80' },
  NOT_TAKEN: { label: 'Not taken', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  EXEMPTED: { label: 'Exempted', className: 'bg-purple-50 text-purple-700 ring-purple-200/80' },
};

export function TranscriptStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 ring-gray-200' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', style.className)}>
      {style.label}
    </span>
  );
}

export function TranscriptRecords({
  rows, isLoading, isError, onRetry, viewToggle,
}: {
  rows: TranscriptRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  viewToggle?: ReactNode;
}) {
  const [semester, setSemester] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const semesters = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows ?? []) {
      if (!seen.has(row.semesterCode)) seen.set(row.semesterCode, row.semesterName || row.semesterCode);
    }
    return [...seen.entries()];
  }, [rows]);

  const counts = useMemo(() => {
    const c = { ALL: 0, PASSED: 0, FAILED: 0, IN_PROGRESS: 0, NOT_TAKEN: 0, EXEMPTED: 0 };
    for (const r of rows ?? []) {
      c.ALL += 1;
      if (r.status in c) c[r.status as keyof typeof c] += 1;
    }
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? []).filter((row) => {
      if (semester && row.semesterCode !== semester) return false;
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
      if (q && !row.courseCode.toLowerCase().includes(q) && !row.courseName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, semester, statusFilter, search]);

  const columns: StaticColumn<TranscriptRow>[] = [
    {
      key: 'course', header: 'Course',
      render: (row) => (
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold text-gray-900">{row.courseCode}</span>
          <span className="ml-1.5 text-xs text-gray-500">{row.courseName}</span>
        </div>
      ),
    },
    {
      key: 'semester', header: 'Semester',
      render: (row) => <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-700">{row.semesterCode || row.semesterName}</span>,
    },
    { key: 'credits', header: 'Credits', align: 'right', render: (row) => <span className="font-mono text-xs text-gray-700">{row.credits}</span> },
    {
      key: 'score', header: 'Score', align: 'right',
      render: (row) => <span className="font-mono text-xs font-bold text-gray-900">{row.finalScore != null ? row.finalScore.toFixed(1) : row.status === 'PASSED' ? 'Pass/Fail' : '—'}</span>,
    },
    { key: 'attempt', header: 'Try', align: 'right', render: (row) => <span className="font-mono text-xs text-gray-500">{row.attemptNumber > 0 ? `#${row.attemptNumber}` : '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <TranscriptStatusBadge status={row.status} /> },
  ];

  const chips = [
    { key: 'ALL', label: 'All', count: counts.ALL },
    { key: 'PASSED', label: 'Passed', count: counts.PASSED },
    { key: 'FAILED', label: 'Failed', count: counts.FAILED },
    { key: 'IN_PROGRESS', label: 'Studying', count: counts.IN_PROGRESS },
    { key: 'NOT_TAKEN', label: 'Not taken', count: counts.NOT_TAKEN },
    { key: 'EXEMPTED', label: 'Exempted', count: counts.EXEMPTED },
  ].filter((c) => c.key === 'ALL' || c.count > 0);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs max-h-[calc(100vh-140px)] lg:max-h-full">
      <div className="shrink-0 space-y-3 border-b border-gray-100 px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {viewToggle ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {viewToggle}
              <span className="text-xs text-gray-500">
                {rows ? `${visible.length} of ${rows.length}` : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
                <FileText className="size-4.5" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Course Records</h2>
                <p className="text-xs text-gray-500">
                  {rows ? `${visible.length} of ${rows.length} record(s)` : 'Your grades by course'}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44 sm:w-52">
              <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search course..."
                className="h-8 w-full rounded-lg border border-gray-200 bg-white pr-7 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <select
              aria-label="Filter by semester" value={semester} onChange={(e) => setSemester(e.target.value)} disabled={semesters.length === 0}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#F26F21] disabled:opacity-60"
            >
              <option value="">All semesters</option>
              {semesters.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </div>
        </div>

        {chips.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setStatusFilter(c.key)}
                className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors ${
                  statusFilter === c.key
                    ? 'bg-[#F26F21] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
                }`}
              >
                <span>{c.label}</span>
                <span className="opacity-80">{c.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <StaticTable
          columns={columns}
          rows={visible}
          rowKey={(row) => row.id}
          loading={isLoading}
          error={isError ? 'Unable to load your transcript' : undefined}
          onRetry={onRetry}
          emptyTitle={rows?.length ? 'No records match your filters.' : 'No transcript records yet.'}
          emptyDescription={rows?.length ? undefined : 'Import your transcript on the right to see your course records.'}
        />
      </div>
    </section>
  );
}
