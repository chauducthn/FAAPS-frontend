// Student / Academic Transcript: semester summary table.

import type { ReactNode } from 'react';
import { CalendarBlank } from '@phosphor-icons/react';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { Progress } from '../../academic/services/studentAcademicService';

const STANDING_META: Record<string, { label: string; cls: string }> = {
  GOOD: { label: 'Good standing', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80' },
  GOOD_STANDING: { label: 'Good standing', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80' },
  DEAN_LIST: { label: 'Dean list', cls: 'bg-amber-50 text-amber-700 ring-amber-200/80' },
  WARNING: { label: 'Warning', cls: 'bg-orange-50 text-[#C2410C] ring-orange-200/80' },
  PROBATION: { label: 'Probation', cls: 'bg-red-50 text-red-700 ring-red-200/80' },
};

type SemesterRow = Progress['semesters'][number];

export function SemesterSummary({
  semesters,
  viewToggle,
}: {
  semesters: Progress['semesters'];
  viewToggle?: ReactNode;
}) {
  const columns: StaticColumn<SemesterRow>[] = [
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-gray-900">{row.name || row.code}</span>
      ),
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      align: 'right',
      render: (row) => <span className="font-mono text-xs text-gray-600">{row.creditsEnrolled}</span>,
    },
    {
      key: 'earned',
      header: 'Earned',
      align: 'right',
      render: (row) => <span className="font-mono text-xs font-semibold text-gray-900">{row.creditsEarned}</span>,
    },
    {
      key: 'gpa',
      header: 'Semester GPA',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-gray-900">
          {row.semesterGpa != null ? row.semesterGpa.toFixed(2) : '—'}
        </span>
      ),
    },
    {
      key: 'cumulative',
      header: 'Cumulative GPA',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#C2410C]">
          {row.cumulativeGpa != null ? row.cumulativeGpa.toFixed(2) : '—'}
        </span>
      ),
    },
    {
      key: 'standing',
      header: 'Standing',
      render: (row) => {
        const meta = STANDING_META[row.standing] ?? {
          label: row.standing,
          cls: 'bg-gray-100 text-gray-700 ring-gray-200',
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.cls}`}>
            {meta.label}
          </span>
        );
      },
    },
  ];

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs max-h-[calc(100vh-140px)] lg:max-h-full">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-5 py-3.5">
        {viewToggle ? (
          viewToggle
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <CalendarBlank className="size-4.5" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Semester Summary</h2>
              <p className="text-xs text-gray-500">Credits earned, semester GPA, and academic standing.</p>
            </div>
          </div>
        )}
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
          {semesters.length} {semesters.length === 1 ? 'term' : 'terms'}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <StaticTable
          columns={columns}
          rows={semesters}
          rowKey={(row) => row.code}
          emptyTitle="No semester results yet"
          emptyDescription="Import your transcript on the right to see your semester breakdown."
        />
      </div>
    </section>
  );
}
