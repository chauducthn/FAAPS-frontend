import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
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
  const columns: StaticColumn<CourseSummary>[] = [
    {
      key: 'pick',
      header: '',
      headerClassName: 'w-11 text-center',
      align: 'center',
      render: (course) => {
        const placed = placedCourses.get(course.id);
        const checked = selected.has(course.id);
        const locked = placed !== undefined;
        return (
          <span onClick={(e) => e.stopPropagation()}>
            <span
              className={cn(
                'mx-auto flex size-5 items-center justify-center rounded-md border-2 transition-all',
                checked
                  ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                  : 'border-gray-300 bg-white text-transparent',
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
          </span>
        );
      },
    },
    {
      key: 'course',
      header: 'Course',
      render: (course) => {
        const locked = placedCourses.get(course.id) !== undefined;
        return (
          <>
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 font-mono text-[12px] font-bold',
                locked ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white',
              )}
            >
              {course.code}
            </span>
            <span className={cn('ml-2 font-semibold', locked ? 'text-gray-400' : 'text-gray-900')}>
              {course.name}
            </span>
          </>
        );
      },
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (course) => {
        const locked = placedCourses.get(course.id) !== undefined;
        if (!course.specialization) {
          return <span className="text-[11px] font-medium text-gray-400">Foundation</span>;
        }
        return (
          <span
            className={cn(
              'inline-block rounded-full px-2.5 py-1 text-[11px] font-bold',
              locked ? 'bg-gray-100 text-gray-400' : 'bg-violet-100 text-violet-800',
            )}
          >
            {course.specialization}
          </span>
        );
      },
    },
    {
      key: 'credits',
      header: 'Credits',
      align: 'center',
      render: (course) => {
        const locked = placedCourses.get(course.id) !== undefined;
        return (
          <span className={cn('font-mono font-bold tabular-nums', locked ? 'text-gray-300' : 'text-gray-900')}>
            {course.credits} cr
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (course) => {
        const placed = placedCourses.get(course.id);
        if (placed !== undefined) {
          return (
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">
              Sem {placed}
            </span>
          );
        }
        if (selected.has(course.id)) {
          return (
            <span className="inline-block rounded-full bg-[var(--brand)] px-2.5 py-1 text-[11px] font-bold text-white">
              Selected
            </span>
          );
        }
        return (
          <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-400">
            —
          </span>
        );
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5">
        <input
          type="checkbox"
          checked={allOnPageSelected}
          onChange={onToggleAll}
          disabled={selectableCount === 0}
          aria-label="Select all on this page"
          className="size-4 accent-[var(--brand)]"
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500">
          Select all on this page
        </span>
      </div>
      <StaticTable
        columns={columns}
        rows={items}
        rowKey={(course) => course.id}
        loading={isFetching && items.length === 0}
        emptyTitle="No matching course"
        emptyDescription="Try another keyword or specialization, or add the course in the catalogue first."
      />
      <Pagination page={page} pageSize={pageSize} total={totalItems} noun="courses" onChange={onPageChange} />
    </div>
  );
}
