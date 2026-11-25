// src/modules/advising/components/student360/StudentTranscriptTab.tsx
// The "Transcript" tab of the Student 360 modal: one row per transcript record.

import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';

interface Props {
  /** The backend may omit the field entirely — the tab must never crash on it. */
  transcript?: TranscriptRow[] | null;
}
export default function StudentTranscriptTab({ transcript }: Props) {
  // A missing payload must not become `transcript.length` on undefined.
  const rows = transcript ?? [];

  const columns: StaticColumn<TranscriptRow>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (row) => (
        <>
          <strong className="text-[var(--ink-primary)]">{row.courseCode}</strong>
          <span className="block text-xs text-slate-500">{row.courseName}</span>
        </>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => <span className="text-slate-600">{row.semesterCode}</span>,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'center',
      render: (row) => <span className="font-semibold">{row.finalScore ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <span className="text-[13px] text-slate-600">{row.status}</span>,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <StaticTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="No transcript records."
        emptyDescription="The student has no imported or recorded results yet."
      />
    </div>
  );
}
