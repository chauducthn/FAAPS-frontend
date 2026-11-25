import { cn } from '@/shared/lib/utils';
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
    <span className={cn('rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[#555f6f]', className)}>
      {label}: {value}
    </span>
  );
}

export function AttendanceImportPreviewTable({ rows }: { rows: AttendanceImportRow[] }) {
  return (
    <div className="max-h-[420px] overflow-auto rounded-lg border border-[#e7eefe]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 bg-[#f4f6fe] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
          <tr>
            <th className="px-4 py-2.5">Line</th>
            <th className="px-4 py-2.5">Student ID</th>
            <th className="px-4 py-2.5">Semester</th>
            <th className="px-4 py-2.5">Course</th>
            <th className="px-4 py-2.5">Absent / total</th>
            <th className="px-4 py-2.5">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.lineNumber} className={cn('border-t border-[#e7eefe]', r.error && 'bg-red-50/60')}>
              <td className="px-4 py-2.5 text-[#555f6f]">{r.lineNumber}</td>
              <td className="px-4 py-2.5 font-semibold text-[#151c27]">{r.studentCode || '—'}</td>
              <td className="px-4 py-2.5 text-[#151c27]">{r.semesterCode || '—'}</td>
              <td className="px-4 py-2.5 text-[#151c27]">{r.courseCode || '—'}</td>
              <td className="px-4 py-2.5 text-[#151c27]">
                {r.absentSessions ?? '—'} / {r.totalSessions ?? '—'}
              </td>
              <td className="px-4 py-2.5">
                {r.error ? (
                  <span className="text-xs font-medium text-red-600">{r.error}</span>
                ) : (
                  r.result && (
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', RESULT_STYLE[r.result].className)}>
                      {RESULT_STYLE[r.result].label}
                    </span>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
