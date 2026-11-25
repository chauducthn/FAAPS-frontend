import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptStatusBadge } from './TranscriptRecords';

type ImportRow = ImportPreview['rows'][number];

export function TranscriptImportRowsTable({ preview }: { preview: ImportPreview }) {
  const columns: StaticColumn<ImportRow>[] = [
    {
      key: 'row',
      header: 'Row',
      render: (row) => <span className="tabular-nums">{row.rowNumber}</span>,
    },
    {
      key: 'course',
      header: 'Course',
      render: (row) => (
        <span className="font-semibold text-[var(--ink-primary)]">{row.courseCode}</span>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (row) => row.semesterCode,
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      render: (row) => row.finalScore ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <TranscriptStatusBadge status={row.status} />,
    },
    {
      key: 'attempt',
      header: 'Attempt',
      align: 'right',
      render: (row) => row.attemptNumber,
    },
    {
      key: 'issue',
      header: 'Issue',
      render: (row) => <span className="text-red-700">{row.error ?? ''}</span>,
    },
  ];

  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-[var(--line)]">
      <StaticTable
        columns={columns}
        rows={preview.rows}
        rowKey={(row) => String(row.rowNumber)}
        stickyHeader
        emptyTitle="No rows found"
        emptyDescription="The imported file did not contain any transcript row."
      />
    </div>
  );
}
