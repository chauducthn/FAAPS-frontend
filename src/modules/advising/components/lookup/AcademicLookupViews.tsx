// Courses catalog table view for AdvisorAcademicLookup.

import { BookBookmark as BookMarked, Stack as Layers } from '@phosphor-icons/react';
import { WorkloadBadge } from '../../../academic/components/WorkloadBadge';
import { Pagination } from '../../../management/components/Pagination';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import type { LookupCourse } from '../../types/academic-lookup';
import { cn } from '@/shared/lib/utils';

const CATEGORY_TONE: Record<string, string> = {
  Core: 'bg-orange-100 text-orange-900 ring-orange-300',
  Foundation: 'bg-blue-100 text-blue-900 ring-blue-300',
  Project: 'bg-purple-100 text-purple-900 ring-purple-300',
  Elective: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  Internship: 'bg-amber-100 text-amber-900 ring-amber-300',
};

interface CoursesViewProps {
  rows: LookupCourse[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
  onOpenCourse: (course: LookupCourse) => void;
  onRetry: () => void;
}

export function CoursesLookupView({
  rows,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  onPageChange,
  onOpenCourse,
  onRetry,
}: CoursesViewProps) {
  const columns: StaticColumn<LookupCourse>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (course) => (
        <span className="inline-flex items-center rounded-lg bg-[var(--surface-sunken)] px-2 py-0.5 text-xs font-bold">
          {course.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Course',
      render: (course) => (
        <span className="block max-w-64">
          <button
            type="button"
            onClick={() => onOpenCourse(course)}
            className="block max-w-full truncate text-left text-[15px] font-bold hover:text-[var(--brand)] hover:underline"
          >
            {course.name}
          </button>
          <span className="mt-0.5 line-clamp-1 block text-sm font-medium text-[var(--ink-muted)]">
            {course.description}
          </span>
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (course) => (
        <span
          className={cn(
            'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
            CATEGORY_TONE[course.category] ?? 'bg-slate-100 text-slate-700 ring-slate-200',
          )}
        >
          {course.category}
        </span>
      ),
    },
    {
      key: 'credits',
      header: 'Credits',
      align: 'right',
      render: (course) => <span className="font-bold tabular-nums">{course.credits}</span>,
    },
    {
      key: 'workload',
      header: 'Workload',
      render: (course) => <WorkloadBadge workload={course.workload} />,
    },
    {
      key: 'detail',
      header: 'Detail',
      align: 'right',
      render: (course) => (
        <button
          type="button"
          onClick={() => onOpenCourse(course)}
          className={cn(
              'inline-flex h-11 items-center gap-1.5',
              'whitespace-nowrap rounded-xl bg-[var(--brand)] px-4',
              'text-sm font-bold text-white shadow-sm',
              'transition-colors hover:bg-[var(--brand-hover)]'
            )}
        >
          <Layers className="size-4" aria-hidden />
          Syllabus
        </button>
      ),
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800">
          Could not load courses.{' '}
          <button type="button" onClick={onRetry} className="font-bold hover:underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200">
          <StaticTable
            columns={columns}
            rows={rows}
            rowKey={(course) => course.id}
            emptyTitle="No courses match your filters."
            emptyDescription="Try a different keyword or category."
            emptyIcon={<BookMarked className="size-5" aria-hidden />}
          />
        </div>
      )}
      <div className="mt-5">
        <Pagination page={page} pageSize={pageSize} total={total} noun="courses" onChange={onPageChange} bare />
      </div>
    </>
  );
}
