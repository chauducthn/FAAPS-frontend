// Student / Transcript: semester summary and the course records, filterable by semester.

import { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import type { Progress, TranscriptRow } from '../../academic/services/studentAcademicService';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PASSED: { label: 'Passed', className: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800 ring-red-200' },
  IN_PROGRESS: { label: 'In progress', className: 'bg-blue-100 text-blue-800 ring-blue-200' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  EXEMPTED: { label: 'Exempted', className: 'bg-purple-100 text-purple-800 ring-purple-200' },
};

export function TranscriptStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 ring-gray-200' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', style.className)}>
      {style.label}
    </span>
  );
}

const STANDING_LABEL: Record<string, string> = {
  GOOD: 'Good standing',
  GOOD_STANDING: 'Good standing',
  PROBATION: 'Academic probation',
  WARNING: 'Warning',
  DEAN_LIST: 'Dean list',
};

export function SemesterSummary({ semesters }: { semesters: Progress['semesters'] }) {
  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-[#f1f5f9] px-5 py-4">
        <h2 className="text-sm font-semibold text-[#151c27]">Semester Summary</h2>
        <p className="mt-0.5 text-[13px] text-[#555f6f]">Credits and GPA of every semester.</p>
      </div>
      {semesters.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-[#555f6f]">No semester results yet. Import your transcript to see them.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f7f8fa] text-[11px] font-semibold uppercase tracking-wide text-[#555f6f]">
              <tr>
                <th className="px-5 py-2.5">Semester</th>
                <th className="px-3 py-2.5 text-right">Enrolled</th>
                <th className="px-3 py-2.5 text-right">Earned</th>
                <th className="px-3 py-2.5 text-right">Semester GPA</th>
                <th className="px-3 py-2.5 text-right">Cumulative GPA</th>
                <th className="px-5 py-2.5">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {semesters.map((s) => (
                <tr key={s.code}>
                  <td className="px-5 py-2.5 font-medium text-[#151c27]">{s.name || s.code}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.creditsEnrolled}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.creditsEarned}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.semesterGpa.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.cumulativeGpa.toFixed(2)}</td>
                  <td className="px-5 py-2.5 text-[#555f6f]">{STANDING_LABEL[s.standing] ?? s.standing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
    for (const row of rows ?? []) if (!seen.has(row.semesterCode)) seen.set(row.semesterCode, row.semesterName || row.semesterCode);
    return [...seen.entries()];
  }, [rows]);
  const visible = (rows ?? []).filter((row) => !semester || row.semesterCode === semester);

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#151c27]">Course Records</h2>
          <p className="mt-0.5 text-[13px] text-[#555f6f]">{rows ? `${visible.length} of ${rows.length} record(s)` : 'Your grades by course'}</p>
        </div>
        <select
          aria-label="Filter by semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          disabled={semesters.length === 0}
          className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] text-[#151c27] outline-none focus:border-[#F26F21] disabled:opacity-60"
        >
          <option value="">All semesters</option>
          {semesters.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-[#151c27]">Unable to load your transcript</p>
          <button type="button" onClick={onRetry} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50">
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#555f6f]">
          {rows?.length ? 'No records in this semester.' : 'No transcript records yet. Import your transcript below.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f7f8fa] text-[11px] font-semibold uppercase tracking-wide text-[#555f6f]">
              <tr>
                <th className="px-5 py-2.5">Course</th>
                <th className="px-3 py-2.5">Semester</th>
                <th className="px-3 py-2.5 text-right">Credits</th>
                <th className="px-3 py-2.5 text-right">Score</th>
                <th className="px-3 py-2.5 text-right">Attempt</th>
                <th className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {visible.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-2.5">
                    <span className="font-semibold text-[#151c27]">{row.courseCode}</span>
                    <span className="text-[#555f6f]"> · {row.courseName}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[#555f6f]">{row.semesterName || row.semesterCode}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.credits}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.finalScore ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{row.attemptNumber}</td>
                  <td className="px-5 py-2.5">
                    <TranscriptStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
