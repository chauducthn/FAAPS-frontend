import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '../Pagination';
import type { CourseSummary } from '../../../academic/types/course';

interface Props {
  items: CourseSummary[];
  isFetching: boolean;
  placedCourses: Map<string, number>;
  selected: Map<string, CourseSummary>;
  allOnPageSelected: boolean;
  selectableCount: number;
  page: number;
  pageSize: number;
  totalItems: number;
  onToggle: (course: CourseSummary) => void;
  onToggleAll: () => void;
  onPageChange: (page: number) => void;
}

export function AddCoursesTable({
  items,
  isFetching,
  placedCourses,
  selected,
  allOnPageSelected,
  selectableCount,
  page,
  pageSize,
  totalItems,
  onToggle,
  onToggleAll,
  onPageChange,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="bg-gray-50 text-[10px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
            <th className="w-11 p-3 text-center">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={onToggleAll}
                disabled={selectableCount === 0}
                aria-label="Select all on this page"
                className="size-4 accent-[#F26F21]"
              />
            </th>
            <th className="p-3">Course</th>
            <th className="p-3 text-center">Credits</th>
            <th className="p-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isFetching && items.length === 0 && (
            <>
              {[0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-3 py-2">
                    <div className="h-10 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
                  </td>
                </tr>
              ))}
            </>
          )}
          {!isFetching && items.length === 0 && (
            <tr>
              <td colSpan={5} className="p-10 text-center">
                <p className="text-sm font-bold text-gray-900">No matching course</p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                  Try another keyword or specialization, or add the course in the catalogue first.
                </p>
              </td>
            </tr>
          )}
          {items.map((course) => {
            const placed = placedCourses.get(course.id);
            const checked = selected.has(course.id);
            const locked = placed !== undefined;
            return (
              <tr
                key={course.id}
                data-testid="pick-row"
                onClick={() => !locked && onToggle(course)}
                className={cn(
                  'cursor-pointer transition-colors',
                  locked ? 'cursor-not-allowed bg-gray-50/70' : checked ? 'bg-orange-50/60 hover:bg-orange-50' : 'hover:bg-gray-50/70',
                )}
              >
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={cn(
                      'mx-auto flex size-5 items-center justify-center rounded-md border-2 transition-all',
                      checked ? 'border-[#F26F21] bg-[#F26F21] text-white' : 'border-gray-300 bg-white text-transparent',
                      locked && 'border-gray-200 bg-gray-100',
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3.5} />
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={() => onToggle(course)}
                      aria-label={`Select ${course.code}`}
                      className="sr-only"
                    />
                  </span>
                </td>
                <td className="p-3">
                  <span className={cn('rounded-md px-1.5 py-0.5 font-mono text-[12px] font-bold', locked ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white')}>
                    {course.code}
                  </span>
                  <span className={cn('ml-2 font-semibold', locked ? 'text-gray-400' : 'text-gray-900')}>{course.name}</span>
                </td>
                <td className="p-3">
                  {course.specialization ? (
                    <span className={cn('inline-block rounded-full px-2.5 py-1 text-[11px] font-bold', locked ? 'bg-gray-100 text-gray-400' : 'bg-violet-100 text-violet-800')}>
                      {course.specialization}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-gray-400">Foundation</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className={cn('font-mono font-bold tabular-nums', locked ? 'text-gray-300' : 'text-gray-900')}>{course.credits} cr</span>
                </td>
                <td className="p-3 text-right">
                  {locked ? (
                    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">Sem {placed}</span>
                  ) : checked ? (
                    <span className="inline-block rounded-full bg-[#F26F21] px-2.5 py-1 text-[11px] font-bold text-white">Selected</span>
                  ) : (
                    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination page={page} pageSize={pageSize} total={totalItems} noun="courses" onChange={onPageChange} />
    </div>
  );
}
