import { useState } from 'react';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
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
    <section className="flex h-[640px] flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Course pool</h3>
            <p className="text-xs text-gray-500">Pick a target term and add courses to this cohort.</p>
          </div>
          <div className="relative shrink-0">
            <select
              value={targetTerm}
              onChange={(e) => onTargetTermChange(Number(e.target.value))}
              aria-label="Target term"
              className="h-8 appearance-none rounded-lg border border-orange-200 bg-orange-50/70 pl-2.5 pr-7 text-xs font-semibold text-[#C2410C] focus:border-[#F26F21] focus:outline-none"
            >
              {TERMS.map((t) => (
                <option key={t} value={t} className="bg-white text-gray-900">
                  Add to Term {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#C2410C]" />
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course code or name..."
              aria-label="Search course pool"
              className="h-8.5 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear course search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-gray-600">
            <input
              type="checkbox"
              checked={hideAdded}
              onChange={(e) => setHideAdded(e.target.checked)}
              className="size-3.5 rounded accent-[#F26F21]"
            />
            Hide added
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2.5 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="px-4 py-12 text-center text-xs text-gray-500">
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
                  isAdded ? 'bg-gray-50/60' : 'hover:bg-orange-50/30',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-gray-900">{course.code}</span>
                    <span className="text-xs tabular-nums text-gray-400">{course.credits}</span>
                  </div>
                  <p className="truncate text-xs text-gray-600" title={course.name}>{course.name}</p>
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
                    className="inline-flex h-7.5 shrink-0 items-center gap-1 rounded-lg border border-orange-200 bg-orange-50/70 px-2.5 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-[#F26F21] hover:text-white disabled:opacity-50"
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
