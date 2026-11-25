// Student / Transcript: semester summary table.

import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { Progress } from '../../academic/services/studentAcademicService';

const STANDING_LABEL: Record<string, string> = {
  GOOD: 'Good standing',
  GOOD_STANDING: 'Good standing',
  PROBATION: 'Academic probation',
  WARNING: 'Warning',
  DEAN_LIST: 'Dean list',
};
type SemesterRow = Progress['semesters'][number];

export function SemesterSummary({ semesters }: { semesters: Progress['semesters'] }) {
  const columns: StaticColumn<SemesterRow>[] = [
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => (
        <span className="font-medium text-[var(--ink-primary)]">{row.name || row.code}</span>
      ),
    },
    {
      key: 'enrolled',
      header: 'Enrolled',
      align: 'right',
      render: (row) => row.creditsEnrolled,
    },
    {
      key: 'earned',
      header: 'Earned',
      align: 'right',
      render: (row) => row.creditsEarned,
    },
    {
      key: 'gpa',
      header: 'Semester GPA',
      align: 'right',
      render: (row) => row.semesterGpa?.toFixed(2) ?? '—',
    },
    {
      key: 'cumulative',
      header: 'Cumulative GPA',
      align: 'right',
      render: (row) => row.cumulativeGpa?.toFixed(2) ?? '—',
    },
    {
      key: 'standing',
      header: 'Standing',
      render: (row) => (
        <span className="text-[var(--ink-muted)]">{STANDING_LABEL[row.standing] ?? row.standing}</span>
      ),
    },
  ];

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-[var(--line-soft)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--ink-primary)]">Semester Summary</h2>
        <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
          Credits and GPA of every semester.
        </p>
      </div>
      <StaticTable
        columns={columns}
        rows={semesters}
        rowKey={(row) => row.code}
        emptyTitle="No semester results yet"
        emptyDescription="Import your transcript to see them."
      />
    </section>
  );
}
