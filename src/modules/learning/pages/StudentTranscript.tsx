// Student / Academic Transcript: viewport-locked KPIs, toggleable Course Records / Semester Summary, and Excel import.

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarBlank, FileText } from '@phosphor-icons/react';
import { studentAcademicService, type TranscriptRow } from '../../academic/services/studentAcademicService';
import { buildTranscriptMap } from '../components/curriculum/curriculumCourseHelpers';
import { ProgressSummary } from '../components/ProgressSummary';
import { SemesterSummary } from '../components/SemesterSummary';
import { TranscriptImport } from '../components/TranscriptImport';
import { TranscriptRecords } from '../components/TranscriptRecords';
import { useMyCurriculumCourses } from '../hooks/queries/useStudentQueries';

type TableTab = 'records' | 'semesters';

export default function StudentTranscript() {
  const [tableTab, setTableTab] = useState<TableTab>('records');
  const transcript = useQuery({ queryKey: ['student', 'transcript'], queryFn: studentAcademicService.transcript });
  const progress = useQuery({ queryKey: ['student', 'progress'], queryFn: studentAcademicService.progress });
  const curriculumCourses = useMyCurriculumCourses();
  const equivalents = useQuery({
    queryKey: ['student', 'curriculum-equivalents'],
    queryFn: studentAcademicService.curriculumEquivalents,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const combinedRows = useMemo<TranscriptRow[] | undefined>(() => {
    if (!transcript.data && !curriculumCourses.data) return undefined;
    const base = transcript.data ?? [];
    const matched = buildTranscriptMap(base, equivalents.data);
    const notTaken: TranscriptRow[] = (curriculumCourses.data ?? [])
      .filter((c) => !matched.has(c.code.trim().toUpperCase()))
      .map((c) => ({
        id: `not-taken-${c.courseId}-${c.code}`,
        courseCode: c.code,
        courseName: c.name,
        credits: c.credits,
        semesterCode: c.semesterNumber > 0 ? `Sem ${c.semesterNumber}` : 'Prep',
        semesterName: c.semesterNumber > 0 ? `Sem ${c.semesterNumber}` : 'Prep',
        finalScore: null,
        status: 'NOT_TAKEN',
        attemptNumber: 0,
        creditsEarned: 0,
      }));
    return [...base, ...notTaken];
  }, [transcript.data, curriculumCourses.data, equivalents.data]);

  const tableToggle = (
    <div
      role="tablist"
      aria-label="Transcript table view"
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-gray-200/80 bg-gray-50 p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tableTab === 'records'}
        onClick={() => setTableTab('records')}
        className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
          tableTab === 'records'
            ? 'bg-[#F26F21] text-white shadow-2xs'
            : 'text-gray-600 hover:bg-white hover:text-gray-900'
        }`}
      >
        <FileText className="size-3.5" aria-hidden />
        Course Records
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tableTab === 'semesters'}
        onClick={() => setTableTab('semesters')}
        className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
          tableTab === 'semesters'
            ? 'bg-[#F26F21] text-white shadow-2xs'
            : 'text-gray-600 hover:bg-white hover:text-gray-900'
        }`}
      >
        <CalendarBlank className="size-3.5" aria-hidden />
        Semester Summary
      </button>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4 lg:h-[calc(100vh-116px)] lg:overflow-hidden">
      <div className="shrink-0">
        {progress.isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
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
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
        <div className="flex min-h-0 flex-col lg:col-span-8 lg:h-full">
          {tableTab === 'records' ? (
            <TranscriptRecords
              rows={combinedRows}
              isLoading={transcript.isLoading}
              isError={transcript.isError}
              onRetry={() => transcript.refetch()}
              viewToggle={tableToggle}
            />
          ) : (
            <SemesterSummary semesters={progress.data?.semesters ?? []} viewToggle={tableToggle} />
          )}
        </div>

        <div className="min-h-0 lg:col-span-4 lg:h-full">
          <div className="flex h-full min-h-0 flex-col overflow-y-auto pr-0.5">
            <TranscriptImport compact />
          </div>
        </div>
      </div>
    </div>
  );
}
