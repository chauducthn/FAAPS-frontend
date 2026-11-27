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
    <section className="flex h-[640px] flex-col overflow-hidden rounded-lg border border-line/80 bg-white shadow-2xs">
      <div className="flex items-center justify-between border-b border-line-soft bg-surface-page/60 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-primary">Curriculum roadmap (Term 0 – Term 9)</h3>
          <p className="text-xs text-ink-muted">Click a term header to set it as the target term for adding courses.</p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-ink-muted">
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
                'overflow-hidden rounded-lg border transition-colors',
                isTarget ? 'border-brand/60 bg-brand-soft/15' : 'border-line/80 bg-white',
              )}
            >
              <button
                type="button"
                onClick={() => onSelectTerm(term)}
                className={cn(
                  'flex w-full items-center justify-between px-3.5 py-2 text-left transition-colors',
                  isTarget ? 'bg-brand-soft/60' : 'bg-surface-page/70 hover:bg-line-soft/70',
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold', isTarget ? 'text-brand-ink' : 'text-ink-primary')}>
                    Term {term}
                  </span>
                  {term === 0 && (
                    <span className="text-[11px] font-medium text-ink-subtle">Preparation</span>
                  )}
                  {isTarget && (
                    <span className="text-[11px] font-semibold text-brand-ink">· Adding here</span>
                  )}
                </div>
                <span className="text-xs tabular-nums text-ink-muted">
                  {termCourses.length} {termCourses.length === 1 ? 'course' : 'courses'} · {termCredits}
                </span>
              </button>

              {termCourses.length === 0 ? (
                <div className="px-3.5 py-2.5 text-xs text-ink-subtle">No courses assigned to Term {term}.</div>
              ) : (
                <div className="divide-y divide-line-soft">
                  {termCourses.map((course) => {
                    const isBusy = busyCourseId === course.courseId;
                    return (
                      <div key={course.id} className="flex items-center justify-between gap-3 px-3.5 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-ink-primary">{course.courseCode}</span>
                            <span className="text-xs tabular-nums text-ink-subtle">{course.credits}</span>
                          </div>
                          <p className="truncate text-xs text-ink-muted" title={course.courseName}>{course.courseName}</p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <div className="relative">
                            <select
                              value={course.semesterNumber}
                              disabled={isBusy}
                              aria-label={`Move ${course.courseCode} to term`}
                              onChange={(e) => onMoveCourse(course.courseId, Number(e.target.value))}
                              className="h-7.5 appearance-none rounded-md border border-line bg-white pl-2 pr-6 text-xs font-medium text-ink-secondary focus:border-brand focus:outline-none disabled:opacity-50"
                            >
                              {TERMS.map((t) => (
                                <option key={t} value={t}>Term {t}</option>
                              ))}
                            </select>
                            <ChevronDown
                              className={
                                'pointer-events-none absolute right-1.5 ' +
                                'top-1/2 size-3 -translate-y-1/2 text-ink-subtle'
                              } />
                          </div>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onRemoveCourse(course.courseId)}
                            title={`Remove ${course.courseCode}`}
                            aria-label={`Remove ${course.courseCode}`}
                            className="rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
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
