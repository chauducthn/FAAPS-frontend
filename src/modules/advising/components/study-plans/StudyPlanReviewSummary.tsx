// Student snapshot and registration context cards for StudyPlanReviewModal.

import { CalendarBlank as CalendarDays, GraduationCap } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisorStudentDetail } from '../../services/advisorService';
import type { AdvisorStudyPlanDetail } from '../../types/study-plan';
import { formatStudyPlanStamp } from './StudyPlanListSection';

function creditLoadLabel(total: number) {
  if (total < 14) return { label: 'Light load', className: 'bg-slate-100 text-slate-800 ring-slate-300' };
  if (total <= 20) return { label: 'Normal load', className: 'bg-emerald-100 text-emerald-950 ring-emerald-300' };
  return { label: 'Heavy load', className: 'bg-red-100 text-red-950 ring-red-300' };
}

export function StudyPlanReviewSummary({
  detail,
  studentDetail,
  studentDetailLoading,
}: {
  detail: AdvisorStudyPlanDetail;
  studentDetail: AdvisorStudentDetail | undefined;
  studentDetailLoading: boolean;
}) {
  const student = studentDetail?.profile ?? null;
  const progress = studentDetail?.progress ?? null;
  const gpaTone =
    student?.currentGpa == null
      ? 'text-slate-600'
      : student.currentGpa >= 8
        ? 'text-emerald-700'
        : student.currentGpa >= 6.5
          ? 'text-orange-900'
          : 'text-red-700';
  const load = creditLoadLabel(detail.plan.header.totalCredits);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <h3 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
          <GraduationCap className="size-4" aria-hidden /> Student snapshot
        </h3>
        {studentDetailLoading ? (
          <div className="mt-3 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200/70" />
          </div>
        ) : student ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="font-extrabold text-slate-900">{student.fullName}</span>
            <span className="font-medium text-slate-600">
              {student.studentCode} · {student.majorCode} · Sem {student.currentSemester}
            </span>
            <span className={cn('text-sm font-extrabold tabular-nums', gpaTone)}>
              GPA {student.currentGpa != null ? student.currentGpa.toFixed(2) : '—'}
            </span>
            {progress && (
              <span className="font-semibold tabular-nums text-slate-700">
                {student.totalCreditsEarned ?? 0}/{progress.requiredCredits} credits
              </span>
            )}
            <span className="inline-flex h-7 items-center rounded-full bg-slate-900 px-2.5 text-xs font-bold text-white">
              {student.academicStatus ?? 'ACTIVE'}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium text-slate-600">Student profile unavailable.</p>
        )}
        {progress && (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <span
              className="block h-full rounded-full bg-[var(--brand)]"
              style={{ width: `${Math.min(100, Math.round((progress.earnedCredits / progress.requiredCredits) * 100))}%` }}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
          <CalendarDays className="size-4" aria-hidden /> Registration context
        </h3>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {[
            { label: 'Semester', value: detail.plan.header.semesterCode },
            {
              label: 'Version',
              value: `v${detail.plan.header.version}${detail.plan.header.previousPlanId ? ` (replaces ${detail.plan.header.previousPlanId})` : ' (first submission)'}`,
            },
            { label: 'Submitted', value: formatStudyPlanStamp(detail.plan.header.submittedAt) },
            { label: 'Plan type', value: detail.plan.header.planType },
          ].map((f) => (
            <div key={f.label} className="rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-inset ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{f.label}</p>
              <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{f.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
          <span className="tabular-nums">
            {detail.plan.header.totalCredits} credits · {detail.plan.courses.length} courses
          </span>
          <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold ring-1 ring-inset', load.className)}>
            {load.label}
          </span>
        </p>
      </div>
    </>
  );
}
