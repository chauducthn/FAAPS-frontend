// src/modules/advising/components/student360/StudentTranscriptTab.tsx
// The "Transcript" tab of the Student 360 modal: one row per transcript record.

import type { TranscriptRow } from '../../../academic/services/studentAcademicService';

interface Props {
  /** The backend may omit the field entirely — the tab must never crash on it. */
  transcript?: TranscriptRow[] | null;
}

export default function StudentTranscriptTab({ transcript }: Props) {
  // A missing payload must not become `transcript.length` on undefined.
  const rows = transcript ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-1 p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No transcript records.</p>
          <p className="max-w-sm text-[13px] text-slate-500">
            The student has no imported or recorded results yet.
          </p>
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Semester</th>
              <th className="px-4 py-3 text-center">Score</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <strong className="text-[#151c27]">{row.courseCode}</strong>
                  <span className="block text-xs text-slate-500">{row.courseName}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.semesterCode}</td>
                <td className="px-4 py-3 text-center font-semibold">{row.finalScore ?? '—'}</td>
                <td className="px-4 py-3 text-center text-[13px] text-slate-600">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
