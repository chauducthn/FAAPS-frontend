// Student / Transcript: progress, semester summary, course records and the transcript import.

import { useQuery } from '@tanstack/react-query';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { ProgressSummary } from '../components/ProgressSummary';
import { SemesterSummary, TranscriptRecords } from '../components/TranscriptRecords';
import { TranscriptImport } from '../components/TranscriptImport';

export default function StudentTranscript() {
  const transcript = useQuery({ queryKey: ['student', 'transcript'], queryFn: studentAcademicService.transcript });
  const progress = useQuery({ queryKey: ['student', 'progress'], queryFn: studentAcademicService.progress });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Student / Transcript</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Transcript</h1>
        <p className="mt-1 text-sm text-[#555f6f]">Your grades, GPA and credits, plus the import of grades from an Excel file.</p>
      </div>

      {progress.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <span>Unable to load your academic progress.</span>
          <button
            type="button"
            onClick={() => progress.refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      ) : (
        <ProgressSummary progress={progress.data} isLoading={progress.isLoading} />
      )}

      <SemesterSummary semesters={progress.data?.semesters ?? []} />
      <TranscriptRecords
        rows={transcript.data}
        isLoading={transcript.isLoading}
        isError={transcript.isError}
        onRetry={() => transcript.refetch()}
      />
      <TranscriptImport />
    </div>
  );
}
