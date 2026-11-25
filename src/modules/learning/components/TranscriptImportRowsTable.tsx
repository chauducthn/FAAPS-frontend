import { cn } from '@/shared/lib/utils';
import type { ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptStatusBadge } from './TranscriptRecords';

export function TranscriptImportRowsTable({ preview }: { preview: ImportPreview }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-[#e5e7eb]">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 bg-[#f7f8fa] text-[11px] font-semibold uppercase tracking-wide text-[#555f6f]">
          <tr>
            <th className="px-3 py-2">Row</th>
            <th className="px-3 py-2">Course</th>
            <th className="px-3 py-2">Semester</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Attempt</th>
            <th className="px-3 py-2">Issue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">
          {preview.rows.map((row) => (
            <tr key={row.rowNumber} className={cn(row.error && 'bg-red-50')}>
              <td className="px-3 py-2 tabular-nums">{row.rowNumber}</td>
              <td className="px-3 py-2 font-semibold text-[#151c27]">{row.courseCode}</td>
              <td className="px-3 py-2">{row.semesterCode}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.finalScore ?? '—'}</td>
              <td className="px-3 py-2">
                <TranscriptStatusBadge status={row.status} />
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{row.attemptNumber}</td>
              <td className="px-3 py-2 text-red-700">{row.error ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
