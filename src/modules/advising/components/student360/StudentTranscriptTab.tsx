// src/modules/advising/components/student360/StudentTranscriptTab.tsx
// The "Transcript" tab of the Student 360 modal: one row per transcript record.

import type { TranscriptRow } from '../../../academic/services/studentAcademicService';

interface Props {
  transcript: TranscriptRow[];
}

export default function StudentTranscriptTab({ transcript }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      {transcript.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">No transcript records.</p>
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
            {transcript.map((row) => (
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
