// Student / Course Exploration — Operate-mode catalogue.
// Reuses the shared DataTable and CourseDetailModal, backed by the real
// student academic API (GET /student/courses, GET /student/courses/:id).
import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  BookOpenCheck,
  CircleAlert,
  Eye,
  RotateCcw,
  Search,
  SearchX,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import CourseDetailModal from '../../management/components/courses/CourseDetailModal';
import {
  studentAcademicService,
  type Course as StudentCourse,
} from '../../academic/services/studentAcademicService';
import type { CourseDetail as AdminCourseDetail } from '../../academic/types/course';
import { useDebounce } from '../../../shared/hooks/useDebounce';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

/** Students cannot edit relations — the shared modal requires handlers, so it gets a guarded no-op. */
const readOnlyRelation = async (): Promise<never> => {
  toast.error('Course relations are read-only for students.');
  throw new Error('Read-only for students');
};

export default function StudentCourses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const catalog = useQuery({
    queryKey: ['student', 'courses-exploration', debouncedSearch],
    queryFn: () => studentAcademicService.courses(debouncedSearch, 0),
    placeholderData: keepPreviousData,
  });
  const detail = useQuery({
    queryKey: ['student', 'courses-exploration', 'detail', selectedId],
    queryFn: () => studentAcademicService.course(selectedId as string),
    enabled: !!selectedId,
  });

  const items = useMemo(() => catalog.data ?? [], [catalog.data]);
  const categories = useMemo(
    () => Array.from(new Set(items.map((c) => c.category).filter(Boolean))).sort(),
    [items],
  );
  const filtered = useMemo(
    () => (category === 'ALL' ? items : items.filter((c) => c.category === category)),
    [items, category],
  );

  const hasActiveFilters = search !== '' || category !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setCategory('ALL');
  };

  // The shared modal speaks the admin CourseDetail shape — adapt the student payload to it.
  const adaptedDetail = useMemo<AdminCourseDetail | null>(() => {
    if (!detail.data) return null;
    const { course, prerequisites } = detail.data;
    return {
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      categoryId: course.category,
      categoryCode: course.category,
      categoryName: course.category,
      specialization: null,
      status: 'ACTIVE',
      prerequisiteCount: prerequisites.length,
      usedInCurriculumCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: course.description,
      objectives: course.objectives,
      learningOutcomes: course.learningOutcomes,
      relations: prerequisites.map((p) => ({
        relationId: p.id,
        kind: p.type === 'REPLACEMENT' ? 'REPLACEMENT' : 'PREREQUISITE',
        groupNo: p.groupNo,
        // The student endpoint returns codes, not ids — carry the code so a click can resolve it below.
        otherCourseId: p.courseCode,
        otherCourseCode: p.courseCode,
        otherCourseName: p.courseName,
        minimumScore: p.minimumScore,
      })),
      referencedBy: [],
    };
  }, [detail.data]);

  // Cross-navigation inside the modal resolves by course code against the loaded catalogue.
  const handleNavigate = (code: string) => {
    const found = items.find((c) => c.code === code);
    if (found) {
      setSelectedId(found.id);
    } else {
      toast.info('That course is not in the current list — refine the search to find it.');
    }
  };

  const columns = useMemo<DataTableColumnDef<StudentCourse>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Course Name',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelectedId(row.original.id)}
            title={`View detail of ${row.original.code}`}
            className="block max-w-[320px] truncate text-left font-semibold text-gray-900 transition-colors hover:text-[#C2410C] hover:underline"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: 'credits',
        header: 'Credits',
        cell: ({ row }) => (
          <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-orange-50 px-2 py-0.5 font-mono text-[12px] font-bold tabular-nums text-[#9a3412] ring-1 ring-orange-200">
            {row.original.credits}
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        enableSorting: false,
        cell: ({ row }) => (
          <span
            title={row.original.category}
            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-inset ring-slate-200"
          >
            {row.original.category || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedId(row.original.id)}
              aria-label={`View detail of ${row.original.code}`}
              title={`View detail of ${row.original.code}`}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-orange-50 hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
            >
              <Eye className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#F26F21] via-[#f97316] to-[#C2410C] p-5 text-white shadow-[0_4px_16px_rgba(242,111,33,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30">
              <BookOpenCheck className="size-5.5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Course Exploration</h1>
              <p className="mt-0.5 max-w-[560px] text-xs font-medium leading-relaxed text-white">
                Browse the course catalog — search by course code or name, filter by
                category, and open any course for its syllabus and prerequisites.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold tabular-nums ring-1 ring-white/25">
              {items.length} course{items.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold tabular-nums ring-1 ring-white/25">
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course code or name..."
              aria-label="Search by course code or name"
              role="searchbox"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className={selectClass}
            >
              <option value="ALL">Category: All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                aria-label="Clear filters"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        {catalog.isLoading ? (
          <ListSkeleton />
        ) : catalog.isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load courses</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The course catalog failed to load. Check your connection, then try
                again — your search and filters are kept.
              </p>
            </div>
            <button
              type="button"
              onClick={() => catalog.refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
            >
              <RotateCcw className="size-3.5" /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
              <SearchX className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {hasActiveFilters ? 'No courses match your filters' : 'No courses available'}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
                {hasActiveFilters
                  ? 'Try a different keyword, or clear the category filter to see the full catalog.'
                  : 'There are no courses in the catalog yet. Please check back later.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="relative p-4 sm:p-5">
            {catalog.isFetching && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
              </div>
            )}
            <DataTable
              key={`${debouncedSearch}|${category}`}
              columns={columns}
              data={filtered}
              searchKey="name"
              showSearch={false}
              searchPlaceholder="Search by code or name..."
              emptyText={hasActiveFilters ? 'No courses match your filters.' : 'No courses available.'}
              getRowId={(row) => row.id}
            />
          </div>
        )}
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>

      <CourseDetailModal
        open={!!selectedId}
        course={adaptedDetail}
        isLoading={detail.isLoading || detail.isFetching}
        readOnly
        onClose={() => setSelectedId(null)}
        onNavigate={handleNavigate}
        onAddRelation={readOnlyRelation}
        onUpdateRelation={readOnlyRelation}
        onRemoveRelation={readOnlyRelation}
      />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="p-4" aria-label="Loading courses">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-orange-100/70" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="hidden h-4 w-24 animate-pulse rounded bg-gray-100 sm:block" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Loading courses…</p>
    </div>
  );
}
