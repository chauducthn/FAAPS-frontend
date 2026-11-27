// Read-only Academic Search page for curricula and course catalog lookup.

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, GraduationCap, MagnifyingGlass as Search } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { academicLookupService } from '../services/academicLookupService';
import type { WorkloadLevel } from '../../academic/types/course';
import type { LookupCourse, LookupCurriculum } from '../types/academic-lookup';
import { cn } from '@/shared/lib/utils';
import { AcademicLookupHeader } from '../components/lookup/AcademicLookupHeader';
import { CourseLookupModal } from '../components/lookup/CourseLookupModal';
import { CoursesLookupView } from '../components/lookup/AcademicLookupViews';
import { CurriculaLookupView } from '../components/lookup/CurriculaLookupView';

type ViewMode = 'curricula' | 'courses';

const PAGE_SIZE = 8;

export default function AdvisorAcademicLookup() {
  const [view, setView] = useState<ViewMode>('curricula');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<LookupCourse | null>(null);
  const [savingWorkload, setSavingWorkload] = useState(false);
  const [expandedCurr, setExpandedCurr] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const curriculaQuery = useQuery({
    queryKey: ['advisor', 'academic-lookup', 'curricula'],
    queryFn: () => academicLookupService.getCurricula(),
  });
  const coursesQuery = useQuery({
    queryKey: ['advisor', 'academic-lookup', 'courses', search, category],
    queryFn: () =>
      academicLookupService.getCourses({
        search: search || undefined,
        category: category === 'ALL' ? undefined : category,
      }),
  });

  const curricula = useMemo(() => curriculaQuery.data ?? [], [curriculaQuery.data]);
  const courses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(coursesQuery.data?.map((c) => c.category) ?? []))],
    [coursesQuery.data],
  );

  const total = courses.length;
  const rows = courses.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const openCourse = async (course: LookupCourse) => {
    try {
      const detail = await academicLookupService.getCourseDetail(course.id);
      setSelected(detail);
    } catch {
      setSelected(course);
    }
  };

  const openCourseByCode = async (code: string) => {
    const found = courses.find((c) => c.code === code);
    if (found) {
      await openCourse(found);
      return;
    }
    const matches = await academicLookupService.getCourses({ search: code });
    const exact = matches.find((c) => c.code === code);
    if (exact) await openCourse(exact);
  };

  const handleOverrideWorkload = async (level: WorkloadLevel | 'AUTO') => {
    if (!selected) return;
    setSavingWorkload(true);
    try {
      const updated = await academicLookupService.updateCourseWorkload(selected.id, level);
      setSelected((prev) => (prev ? { ...prev, workload: updated } : prev));
      await queryClient.invalidateQueries({ queryKey: ['advisor', 'academic-lookup', 'courses'] });
      toast.success(level === 'AUTO' ? 'Reset course workload to Auto' : `Workload override set to ${level}`);
    } catch {
      toast.error('Failed to update course workload');
    } finally {
      setSavingWorkload(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-4">
      <AcademicLookupHeader
        curriculaCount={curricula.length}
        coursesCount={coursesQuery.data?.length ?? courses.length}
        majorsCount={new Set(curricula.map((c) => c.majorCode)).size}
        categoriesCount={Math.max(0, categories.length - 1)}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Catalog view">
            {([
              { key: 'curricula', label: 'Curricula', icon: GraduationCap },
              { key: 'courses', label: 'Courses', icon: BookOpen },
            ] as const).map((v) => {
              const active = view === v.key;
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setView(v.key);
                    setPage(0);
                  }}
                  className={cn(
                    'flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-all',
                    active ? 'bg-white text-[#F26F21] shadow-sm' : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {v.label}
                </button>
              );
            })}
          </div>

          {view === 'courses' && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-11 w-full max-w-xs items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30 sm:w-64">
                <Search className="size-4 shrink-0 text-slate-600" aria-hidden />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search by code or name..."
                  aria-label="Search courses"
                  className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
                />
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
                aria-label="Filter by category"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/30"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'Category: All' : c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-6">
          {view === 'curricula' ? (
            <CurriculaLookupView
              curricula={curricula}
              isLoading={curriculaQuery.isLoading}
              isError={curriculaQuery.isError}
              expandedCurr={expandedCurr}
              onToggleExpand={setExpandedCurr}
              onOpenCourseByCode={openCourseByCode}
              onRetry={() => curriculaQuery.refetch()}
            />
          ) : (
            <CoursesLookupView
              rows={rows}
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              isLoading={coursesQuery.isLoading}
              isError={coursesQuery.isError}
              onPageChange={setPage}
              onOpenCourse={openCourse}
              onRetry={() => coursesQuery.refetch()}
            />
          )}
        </div>
      </section>

      <CourseLookupModal
        course={selected} onClose={() => setSelected(null)} onOpenCourse={openCourseByCode}
        onOverrideWorkload={handleOverrideWorkload} isSavingWorkload={savingWorkload}
      />
    </div>
  );
}

export type { LookupCurriculum };
