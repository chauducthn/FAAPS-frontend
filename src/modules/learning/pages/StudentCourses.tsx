// Student / Course Exploration — Operate-mode catalogue backed by student academic API.

import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PaginationState } from '@tanstack/react-table';
import { WarningCircle as CircleAlert, ArrowCounterClockwise as RotateCcw } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { DataTable } from '../../../shared/components/common/DataTable';
import CourseDetailModal from '../../management/components/courses/CourseDetailModal';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import {
  adaptStudentCourseDetail,
  buildStudentCourseColumns,
  StudentCoursesSkeleton,
} from '../components/courses/studentCourseColumns';
import { StudentCoursesHeader } from '../components/courses/StudentCoursesHeader';

const PAGE_SIZE = 20;

const readOnlyRelation = async (): Promise<never> => {
  toast.error('Course relations are read-only for students.');
  throw new Error('Read-only for students');
};

export default function StudentCourses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });

  const catalog = useQuery({
    queryKey: ['student', 'courses-exploration', debouncedSearch, pagination.pageIndex, pagination.pageSize],
    queryFn: () => studentAcademicService.courses(debouncedSearch, pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
  });
  const detail = useQuery({
    queryKey: ['student', 'courses-exploration', 'detail', selectedId],
    queryFn: () => studentAcademicService.course(selectedId as string),
    enabled: !!selectedId,
  });

  const items = useMemo(() => catalog.data?.items ?? [], [catalog.data]);
  const totalItems = catalog.data?.totalItems ?? 0;
  const totalPages = catalog.data?.totalPages ?? 0;
  const [knownCategories, setKnownCategories] = useState<string[]>([]);

  useEffect(() => {
    const names = items.map((c) => c.category).filter(Boolean);
    if (names.length === 0) return;
    setKnownCategories((current) => {
      const merged = Array.from(new Set([...current, ...names])).sort();
      return merged.length === current.length ? current : merged;
    });
  }, [items]);

  const filtered = useMemo(
    () => (category === 'ALL' ? items : items.filter((c) => c.category === category)),
    [items, category],
  );

  const hasActiveFilters = search !== '' || category !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setCategory('ALL');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const adaptedDetail = useMemo(() => adaptStudentCourseDetail(detail.data), [detail.data]);

  const handleNavigate = (code: string) => {
    const found = items.find((c) => c.code === code);
    if (found) setSelectedId(found.id);
    else toast.info('That course is not in the current list — refine the search to find it.');
  };

  const columns = useMemo(() => buildStudentCourseColumns(setSelectedId), []);

  return (
    <div className="w-full space-y-5">
      <StudentCoursesHeader
        totalItems={totalItems}
        categories={knownCategories}
        search={search}
        category={category}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onCategoryChange={(val) => {
          setCategory(val);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onClearFilters={clearFilters}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        {catalog.isLoading ? (
          <StudentCoursesSkeleton />
        ) : catalog.isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load courses</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The course catalog failed to load. Check your connection, then try again — your search and filters are kept.
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
        ) : (
          <div className="relative p-4 sm:p-5">
            {catalog.isFetching && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
              </div>
            )}
            <DataTable
              manual
              columns={columns}
              data={filtered}
              searchKey="name"
              showSearch={false}
              searchPlaceholder="Search by code or name..."
              emptyText={hasActiveFilters ? 'No courses match your filters.' : 'No courses available.'}
              getRowId={(row) => row.id}
              totalRowCount={totalItems}
              pageCount={totalPages}
              pagination={pagination}
              onPaginationChange={setPagination}
              showPageSizeSelect={false}
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
