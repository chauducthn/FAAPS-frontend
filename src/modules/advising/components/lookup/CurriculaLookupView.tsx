// Curricula cards view for AdvisorAcademicLookup.

import { CaretRight as ChevronRight, GraduationCap } from '@phosphor-icons/react';
import type { LookupCurriculum } from '../../types/academic-lookup';
import { cn } from '@/shared/lib/utils';

interface CurriculaViewProps {
  curricula: LookupCurriculum[];
  isLoading: boolean;
  isError: boolean;
  expandedCurr: string | null;
  onToggleExpand: (id: string | null) => void;
  onOpenCourseByCode: (code: string) => void;
  onRetry: () => void;
}

export function CurriculaLookupView({
  curricula,
  isLoading,
  isError,
  expandedCurr,
  onToggleExpand,
  onOpenCourseByCode,
  onRetry,
}: CurriculaViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800">
        Could not load curricula.{' '}
        <button type="button" onClick={onRetry} className="font-bold hover:underline">
          Retry
        </button>
      </div>
    );
  }
  if (curricula.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
        No curricula found.
      </p>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {curricula.map((curr) => {
        const expanded = expandedCurr === curr.id;
        return (
          <article key={curr.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-900 ring-1 ring-inset ring-orange-300">
                <GraduationCap className="size-3.5" aria-hidden />
                {curr.majorCode} · {curr.version}
              </span>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                {curr.totalCredits} credits
              </span>
            </div>
            <h3 className="mt-2.5 text-[15px] font-bold text-slate-900">{curr.name}</h3>
            <p className="mt-0.5 text-sm font-medium text-slate-600">{curr.majorName}</p>

            {expanded && (
              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                {curr.semesters.map((s) => (
                  <div key={s.semesterNumber}>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                      Semester {s.semesterNumber}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {s.courses.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => onOpenCourseByCode(code)}
                          title="View course detail"
                          className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-[#fff3ea] hover:text-[#F26F21]"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => onToggleExpand(expanded ? null : curr.id)}
              className="mt-4 inline-flex h-11 items-center gap-1 rounded-xl px-2 text-sm font-bold text-[#F26F21] transition-colors hover:bg-[#fff3ea]"
            >
              {expanded ? 'Collapse' : `View ${curr.semesters.length} semesters`}
              <ChevronRight className={cn('size-4 transition-transform', expanded && 'rotate-90')} aria-hidden />
            </button>
          </article>
        );
      })}
    </div>
  );
}
