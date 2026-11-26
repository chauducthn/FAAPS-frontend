import { CaretDown as ChevronDown, Trash as Trash2 } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { CurriculumCourseItem } from '../../../academic/types/curriculum';

const TERMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface Props {
  courses: CurriculumCourseItem[];
  targetTerm: number;
  onSelectTerm: (term: number) => void;
  onMoveCourse: (courseId: string, semesterNumber: number) => void;
  onRemoveCourse: (courseId: string) => void;
  busyCourseId: string | null;
}

export function CurriculumTermsPanel({
  courses,
  targetTerm,
  onSelectTerm,
  onMoveCourse,
  onRemoveCourse,
  busyCourseId,
}: Props) {
  const byTerm = new Map<number, CurriculumCourseItem[]>();
  for (const t of TERMS) byTerm.set(t, []);
  for (const c of courses) {
    const bucket = byTerm.get(c.semesterNumber);
    if (bucket) bucket.push(c);
  }

  return (
    <section className="flex h-[640px] flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Curriculum roadmap (Term 0 – Term 9)</h3>
          <p className="text-xs text-gray-500">Click a term header to set it as the target term for adding courses.</p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-gray-600">
          {courses.length} courses · {courses.reduce((s, c) => s + c.credits, 0)} credits
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {TERMS.map((term) => {
          const termCourses = byTerm.get(term) ?? [];
          const termCredits = termCourses.reduce((sum, c) => sum + c.credits, 0);
          const isTarget = targetTerm === term;
          return (
            <div
              key={term}
              className={cn(
                'overflow-hidden rounded-xl border transition-colors',
                isTarget ? 'border-[#F26F21]/60 bg-orange-50/15' : 'border-gray-200/80 bg-white',
              )}
            >
              <button
                type="button"
                onClick={() => onSelectTerm(term)}
                className={cn(
                  'flex w-full items-center justify-between px-3.5 py-2 text-left transition-colors',
                  isTarget ? 'bg-orange-50/60' : 'bg-gray-50/70 hover:bg-gray-100/70',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold', isTarget ? 'text-[#C2410C]' : 'text-gray-800')}>
                    Term {term}
                  </span>
                  {term === 0 && (
                    <span className="text-[11px] font-medium text-gray-400">Preparation</span>
                  )}
                  {isTarget && (
                    <span className="text-[11px] font-semibold text-[#C2410C]">· Adding here</span>
                  )}
                </div>
                <span className="text-xs tabular-nums text-gray-500">
                  {termCourses.length} {termCourses.length === 1 ? 'course' : 'courses'} · {termCredits}
                </span>
              </button>

              {termCourses.length === 0 ? (
                <div className="px-3.5 py-2.5 text-xs text-gray-400">No courses assigned to Term {term}.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {termCourses.map((course) => {
                    const isBusy = busyCourseId === course.courseId;
                    return (
                      <div key={course.id} className="flex items-center justify-between gap-3 px-3.5 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-gray-900">{course.courseCode}</span>
                            <span className="text-xs tabular-nums text-gray-400">{course.credits}</span>
                          </div>
                          <p className="truncate text-xs text-gray-600" title={course.courseName}>{course.courseName}</p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <div className="relative">
                            <select
                              value={course.semesterNumber}
                              disabled={isBusy}
                              aria-label={`Move ${course.courseCode} to term`}
                              onChange={(e) => onMoveCourse(course.courseId, Number(e.target.value))}
                              className="h-7.5 appearance-none rounded-md border border-gray-200 bg-white pl-2 pr-6 text-xs font-medium text-gray-700 focus:border-[#F26F21] focus:outline-none disabled:opacity-50"
                            >
                              {TERMS.map((t) => (
                                <option key={t} value={t}>Term {t}</option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                          </div>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onRemoveCourse(course.courseId)}
                            title={`Remove ${course.courseCode}`}
                            aria-label={`Remove ${course.courseCode}`}
                            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
