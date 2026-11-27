import { useState } from 'react';
import { CaretDown as ChevronDown, Plus, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';

const TERMS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface Props {
  placedTerms: Map<string, number>;
  targetTerm: number;
  onTargetTermChange: (term: number) => void;
  onAddCourse: (courseId: string, term: number) => void;
  busyCourseId: string | null;
}

export function CoursePoolPanel({
  placedTerms,
  targetTerm,
  onTargetTermChange,
  onAddCourse,
  busyCourseId,
}: Props) {
  const [search, setSearch] = useState('');
  const [hideAdded, setHideAdded] = useState(false);
  const debounced = useDebounce(search.trim(), 250);
  const { data, isLoading } = useCoursesQuery({
    search: debounced || undefined,
    status: 'ACTIVE',
    page: 0,
    size: 100,
  });

  const allCourses = data?.items ?? [];
  const courses = hideAdded ? allCourses.filter((c) => !placedTerms.has(c.id)) : allCourses;

  return (
    <section className="flex min-h-[18rem] flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
      <div className="border-b border-line-soft bg-surface-page/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">Course pool</h3>
            <p className="text-xs text-ink-muted">Pick a target term and add courses to this cohort.</p>
          </div>
          <div className="relative shrink-0">
            <select
              value={targetTerm}
              onChange={(e) => onTargetTermChange(Number(e.target.value))}
              aria-label="Target term"
              className="h-8 appearance-none rounded-md border border-brand/30 bg-brand-soft/70 pl-2.5 pr-7 text-xs font-semibold text-brand-ink focus:border-brand focus:outline-none"
            >
              {TERMS.map((t) => (
                <option key={t} value={t} className="bg-white text-ink-primary">
                  Add to Term {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-brand-ink" />
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course code or name..."
              aria-label="Search course pool"
              className="h-9 w-full rounded-md border border-line bg-white pl-8 pr-7 text-xs text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear course search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-ink-muted">
            <input
              type="checkbox"
              checked={hideAdded}
              onChange={(e) => setHideAdded(e.target.checked)}
              className="size-3.5 rounded accent-brand"
            />
            Hide added
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-line-soft overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2.5 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-line-soft" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="px-4 py-12 text-center text-xs text-ink-muted">
            {search ? 'No courses match your search.' : 'No active courses available in the course pool.'}
          </div>
        ) : (
          courses.map((course) => {
            const assignedTerm = placedTerms.get(course.id);
            const isAdded = assignedTerm !== undefined;
            const isBusy = busyCourseId === course.id;
            return (
              <div
                key={course.id}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-2.5 transition-colors',
                  isAdded ? 'bg-surface-page/60' : 'hover:bg-brand-soft/30',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink-primary">{course.code}</span>
                    <span className="text-xs tabular-nums text-ink-subtle">{course.credits}</span>
                  </div>
                  <p className="truncate text-xs text-ink-muted" title={course.name}>{course.name}</p>
                </div>
                {isAdded ? (
                  <span className="shrink-0 text-xs font-semibold text-emerald-700">
                    Term {assignedTerm}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onAddCourse(course.id, targetTerm)}
                    className="inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg border border-brand/30 bg-brand-soft/70 px-2.5 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
                  >
                    <Plus className="size-3.5" aria-hidden /> Add
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
