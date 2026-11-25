// Loading, error, validation banner states, and XLSX export helper for StudentStudyPlan.

import { CircleAlert, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { BOARD_POOL, type BoardData, type BoardIssue } from '../../services/studentStudyPlanService';
import { buildStudyPlanXlsx, downloadBlob, type XlsxRow } from '../../utils/studyPlanXlsx';
import type { ViewItem } from './types';

export function exportStudyPlanBoard(
  data: BoardData | undefined,
  items: ViewItem[],
  issueIds: Set<string>,
  totalCredits: number,
) {
  if (!data || items.length === 0) {
    toast.error('Nothing to export', { description: 'Your curriculum has no courses to export yet.' });
    return;
  }
  const rows: XlsxRow[] = [
    ['Semester', 'Course Code', 'Course Name', 'Credits', 'Prerequisites', 'Status'],
    ...[...items]
      .sort((a, b) => a.semesterNumber - b.semesterNumber || a.code.localeCompare(b.code))
      .map((c): XlsxRow => [
        c.semesterNumber === BOARD_POOL ? 'Course Pool (unplaced)' : `Semester ${c.semesterNumber}`,
        c.code,
        c.name,
        c.credits,
        c.prerequisites.length > 0 ? c.prerequisites.map((p) => p.code).join(', ') : 'None',
        issueIds.has(c.courseId) ? 'PREREQUISITE ISSUE' : c.semesterNumber === BOARD_POOL ? 'Unplaced' : 'Planned',
      ]),
    [],
    ['Total planned credits', totalCredits, '', '', '', ''],
    ['Curriculum', `${data.majorCode} — ${data.curriculumName}`, '', '', '', ''],
  ];
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(buildStudyPlanXlsx(rows), `study-plan-${data.majorCode.toLowerCase()}-${stamp}.xlsx`);
  toast.success('Study plan exported', { description: `${items.length} courses exported to XLSX.` });
}

export function StudyPlanValidationBanner({
  issues,
  validated,
}: {
  issues: BoardIssue[];
  validated: boolean;
}) {
  return (
    <>
      {issues.length > 0 && (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3.5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-red-900">
            <ShieldAlert className="size-4 shrink-0" aria-hidden />
            Prerequisite check failed — saving is blocked ({issues.length})
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-red-900">
            {issues.map((issue) => (
              <li key={issue.courseId}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}
      {validated && issues.length === 0 && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Plan is valid — every prerequisite is satisfied in an earlier semester. You can save now.
        </p>
      )}
    </>
  );
}

export function StudyPlanErrorState({
  hasNoErrorDetail,
  onRetry,
}: {
  hasNoErrorDetail: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">Could not load your study plan</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
          {hasNoErrorDetail
            ? 'Your academic curriculum has not been assigned yet. The board appears after assignment.'
            : 'The board failed to load. Check your connection and retry.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
      >
        Retry loading
      </button>
    </div>
  );
}

export function StudyPlanBoardSkeleton() {
  return (
    <div className="w-full space-y-5" aria-label="Loading study plan">
      <div className="rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7">
        <div className="h-7 w-56 animate-pulse rounded bg-white/30" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-white/20" />
      </div>
      <div className="h-16 animate-pulse rounded-2xl bg-white shadow-sm" />
      <div className="flex gap-4 overflow-hidden" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-3">
            <div className="h-8 animate-pulse rounded-xl bg-orange-50" style={{ animationDelay: `${i * 70}ms` }} />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-20 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] font-medium text-gray-400">Loading your study plan...</p>
    </div>
  );
}
