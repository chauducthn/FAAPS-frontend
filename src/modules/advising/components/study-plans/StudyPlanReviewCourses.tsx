// Requested courses list with prerequisite checks, validation warnings, and advisor checklist.

import { Check, ShieldAlert, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { LookupCourse } from '../../types/academic-lookup';
import type { AdvisorStudyPlanDetail } from '../../types/study-plan';

interface StudyPlanReviewCoursesProps {
  detail: AdvisorStudyPlanDetail;
  courseByCode: Map<string, LookupCourse>;
  passedByCode: Map<string, number | null>;
  totalCreditsEarned: number;
}

export function StudyPlanReviewCourses({
  detail,
  courseByCode,
  passedByCode,
  totalCreditsEarned,
}: StudyPlanReviewCoursesProps) {
  const checks: string[] = [];
  const total = detail.plan.header.totalCredits;
  if (total < 14) {
    checks.push(`Credit load is light (${total} cr) — confirm the student meets full-time requirements.`);
  }
  if (total > 20) {
    checks.push(`Credit load is heavy (${total} cr) — recommend dropping 1 course unless GPA ≥ 8.0.`);
  }
  const codes = detail.plan.courses.map((c) => c.code);
  if (codes.includes('OJT401') && totalCreditsEarned < 90) {
    checks.push('OJT401 normally requires ~90+ earned credits — verify eligibility before approving.');
  }

  return (
    <>
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">
          Requested courses · {detail.plan.courses.length}
        </h3>
        <ul className="mt-3 space-y-3">
          {detail.plan.courses.map((course) => {
            const lookup = courseByCode.get(course.code);
            const category = lookup?.category ?? '—';
            const description = lookup?.description ?? '';
            const allPrereqs = (lookup?.prerequisites ?? []).map((p) => ({
              code: p.courseCode,
              name: p.courseName,
            }));
            const missing = allPrereqs.filter((p) => !passedByCode.has(p.code));
            const ok = missing.length === 0;
            return (
              <li key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3ea] text-xs font-extrabold text-[#c2410c]"
                  >
                    {course.code.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-slate-900">
                      <span className="truncate">{course.code} · {course.name}</span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
                        {category}
                      </span>
                      <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-xs font-bold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200">
                        {course.credits} cr
                      </span>
                      {ok ? (
                        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-emerald-100 px-2 text-xs font-bold text-emerald-950 ring-1 ring-inset ring-emerald-300">
                          <Check className="size-3" aria-hidden /> Prereqs met
                        </span>
                      ) : (
                        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-red-100 px-2 text-xs font-bold text-red-950 ring-1 ring-inset ring-red-300">
                          <X className="size-3" aria-hidden /> Missing {missing.map((m) => m.code).join(', ')}
                        </span>
                      )}
                    </p>
                    {description && (
                      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">
                        {description}
                      </p>
                    )}
                    {!lookup && (
                      <p className="mt-1.5 text-sm font-medium text-slate-500">
                        Not in the course catalog yet — category and prerequisites unavailable.
                      </p>
                    )}
                  </div>
                </div>
                <div className={cn('border-t px-4 py-2.5 text-sm', ok ? 'border-emerald-100 bg-emerald-50/60' : 'border-red-100 bg-red-50/60')}>
                  {!lookup ? (
                    <p className="font-medium text-slate-600">
                      Course details are not in the catalog yet — prerequisite check skipped.
                    </p>
                  ) : allPrereqs.length === 0 ? (
                    <p className="font-medium text-slate-600">No prerequisites — open to all students.</p>
                  ) : (
                    <ul className="space-y-1">
                      {allPrereqs.map((p) => {
                        const passed = passedByCode.has(p.code);
                        const score = passedByCode.get(p.code);
                        return (
                          <li key={p.code} className="flex items-center gap-1.5 font-medium">
                            {passed ? (
                              <Check className="size-3.5 shrink-0 text-emerald-700" aria-hidden />
                            ) : (
                              <X className="size-3.5 shrink-0 text-red-600" aria-hidden />
                            )}
                            <span className={passed ? 'text-emerald-950' : 'text-red-900'}>
                              {p.code} · {p.name}
                              {passed && score != null ? ` — passed (${score.toFixed(1)})` : passed ? ' — passed' : ' — not taken'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {detail.plan.issues.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-amber-950">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            Validation warnings ({detail.plan.issues.length})
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-amber-950">
            {detail.plan.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {checks.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 ring-1 ring-inset ring-slate-200">
          <p className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <ShieldAlert className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
            Advisor checklist
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium leading-relaxed text-slate-700">
            {checks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
