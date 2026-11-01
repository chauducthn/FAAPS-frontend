// src/pages/advising/AdvisorAcademicLookup.tsx
// Trang "Academic Lookup" — tra cứu Curricula + Courses (read-only, mock-first).
// Đồng bộ 1-1 với My Students / Appointments / Advising Requests:
// hero cam FPT + section rounded-2xl + view switcher + bảng slate + modal hero cam.

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  BookMarked,
  ChevronRight,
  GraduationCap,
  Layers,
  LibraryBig,
  Search,
} from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { Pagination } from '../../management/components/Pagination';
import { academicLookupService } from '../services/academicLookupService';
import type { LookupCourse, LookupCurriculum } from '../../../mocks/academicLookupMock';
import { cn } from '@/shared/lib/utils';

type ViewMode = 'curricula' | 'courses';

const PAGE_SIZE = 8;

const CATEGORY_TONE: Record<string, string> = {
  Core: 'bg-orange-100 text-orange-800 ring-orange-200',
  Foundation: 'bg-blue-100 text-blue-800 ring-blue-200',
  Project: 'bg-purple-100 text-purple-800 ring-purple-200',
  Elective: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Internship: 'bg-amber-100 text-amber-800 ring-amber-200',
};

const formatCredits = (n: number) => `${n} cr`;

export default function AdvisorAcademicLookup() {
  const [view, setView] = useState<ViewMode>('curricula');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<LookupCourse | null>(null);
  const [expandedCurr, setExpandedCurr] = useState<string | null>(null);

  const curriculaQuery = useQuery({
    queryKey: ['advisor', 'academic-lookup', 'curricula'],
    queryFn: () => academicLookupService.getCurricula(),
  });
  const coursesQuery = useQuery({
    queryKey: ['advisor', 'academic-lookup', 'courses', search, category],
    queryFn: () => academicLookupService.getCourses({ search: search || undefined, category }),
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
    const found = academicLookupService.getCourseByCode(code);
    if (found) await openCourse(found);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Hero cam FPT */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] p-6 text-white shadow-sm">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-40 size-36 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Advisor / Academic Lookup
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <LibraryBig className="size-6" aria-hidden />
            Academic Lookup
          </h1>
          <p className="mt-1 text-[13px] text-white/85">
            Tra cứu chương trình đào tạo và môn học để tư vấn chính xác — read-only, không chỉnh sửa.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Curricula', value: String(curricula.length) },
              { label: 'Courses', value: String(coursesQuery.data?.length ?? courses.length) },
              { label: 'Majors', value: String(new Set(curricula.map((c) => c.majorCode)).size || '—') },
              { label: 'Categories', value: String(Math.max(0, categories.length - 1)) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-white/80">{s.label}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View switcher — đồng bộ Appointments */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Lookup view">
            {(
              [
                { key: 'curricula', label: 'Curricula', icon: GraduationCap },
                { key: 'courses', label: 'Courses', icon: BookOpen },
              ] as const
            ).map((v) => {
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
                    'flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-bold transition-all',
                    active ? 'bg-white text-[#F26F21] shadow-sm' : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {v.label}
                </button>
              );
            })}
          </div>

          {view === 'courses' && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-10 w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors focus-within:border-[#F26F21] focus-within:ring-1 focus-within:ring-[#F26F21]/40 sm:w-64">
                <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search by code or name..."
                  aria-label="Search courses"
                  className="flex-1 bg-transparent text-sm text-[#151c27] outline-none placeholder:text-slate-400"
                />
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(0);
                }}
                aria-label="Filter by category"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#151c27] shadow-sm focus:border-[#F26F21] focus:outline-none focus:ring-1 focus:ring-[#F26F21]/40"
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

        {view === 'curricula' ? (
          <div className="mt-4">
            {curriculaQuery.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : curriculaQuery.isError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Could not load curricula.{' '}
                <button type="button" onClick={() => curriculaQuery.refetch()} className="font-semibold hover:underline">
                  Retry
                </button>
              </div>
            ) : curricula.length === 0 ? (
              <p className="rounded-2xl border border-slate-100 px-4 py-10 text-center text-sm text-slate-500">
                No curricula found.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {curricula.map((curr) => {
                  const expanded = expandedCurr === curr.id;
                  return (
                    <article key={curr.id} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-800 ring-1 ring-inset ring-orange-200">
                          <GraduationCap className="size-3.5" aria-hidden />
                          {curr.majorCode} · {curr.version}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {curr.totalCredits} credits
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-[#151c27]">{curr.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{curr.majorName}</p>

                      {expanded && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          {curr.semesters.map((s) => (
                            <div key={s.semesterNumber}>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                Semester {s.semesterNumber}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {s.courses.map((code) => (
                                  <button
                                    key={code}
                                    type="button"
                                    onClick={() => openCourseByCode(code)}
                                    title="View course detail"
                                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-[#fff3ea] hover:text-[#F26F21]"
                                  >
                                    {code}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedCurr(expanded ? null : curr.id)}
                        className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#F26F21] hover:underline"
                      >
                        {expanded ? 'Collapse' : `View ${curr.semesters.length} semesters`}
                        <ChevronRight className={cn('size-3.5 transition-transform', expanded && 'rotate-90')} aria-hidden />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {coursesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : coursesQuery.isError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Could not load courses.{' '}
                <button type="button" onClick={() => coursesQuery.refetch()} className="font-semibold hover:underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Code</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Course</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Category</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Credits</th>
                      <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <BookMarked className="size-5" aria-hidden />
                            </span>
                            <p className="text-sm font-semibold text-[#151c27]">No courses match your filters.</p>
                            <p className="text-[13px] text-slate-500">Try a different keyword or category.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((c) => (
                        <tr key={c.id} className="h-12 border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                              {c.code}
                            </span>
                          </td>
                          <td className="max-w-64 px-4 py-3">
                            <button
                              type="button"
                              onClick={() => openCourse(c)}
                              className="block max-w-full truncate text-left text-sm font-semibold text-[#151c27] hover:text-[#F26F21] hover:underline"
                            >
                              {c.name}
                            </button>
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{c.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', CATEGORY_TONE[c.category] ?? 'bg-slate-100 text-slate-600 ring-slate-200')}>
                              {c.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold tabular-nums text-[#151c27]">
                            {c.credits}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => openCourse(c)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
                              >
                                <Layers className="size-3.5" aria-hidden />
                                Syllabus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="courses" onChange={setPage} bare />
          </div>
        )}
      </section>

      <CourseLookupModal course={selected} onClose={() => setSelected(null)} onOpenCourse={openCourseByCode} />
    </div>
  );
}

function CourseLookupModal({
  course,
  onClose,
  onOpenCourse,
}: {
  course: LookupCourse | null;
  onClose: () => void;
  onOpenCourse: (code: string) => void;
}) {
  if (!course) return null;
  return (
    <Modal open={!!course} onClose={onClose} title={`Course ${course.code}`} className="max-w-2xl">
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        {/* Hero cam FPT */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] px-6 pb-5 pt-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/95 px-3 text-sm font-bold text-[#F26F21] shadow">
              {course.code}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
                {course.category} · {formatCredits(course.credits)}
              </p>
              <h2 className="mt-0.5 truncate text-xl font-bold">{course.name}</h2>
              <p className="mt-0.5 text-[13px] text-white/90">{course.code}</p>
            </div>
            <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#151c27]">
              {formatCredits(course.credits)}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="text-sm font-bold text-[#151c27]">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="text-sm font-bold text-[#151c27]">Objectives</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{course.objectives}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="text-sm font-bold text-[#151c27]">Learning outcomes</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{course.learningOutcomes}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="text-sm font-bold text-[#151c27]">
                Prerequisites {course.prerequisites.length > 0 && <span className="ml-1 text-xs font-medium text-slate-400">({course.prerequisites.length})</span>}
              </h3>
              {course.prerequisites.length === 0 ? (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[13px] text-slate-500">
                  No prerequisites — sinh viên có thể đăng ký trực tiếp.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {course.prerequisites.map((p) => (
                    <li key={`${p.courseCode}-${p.groupNo}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f7f8fa] px-3 py-2 text-[13px]">
                      <button
                        type="button"
                        onClick={() => onOpenCourse(p.courseCode)}
                        className="font-bold text-[#F26F21] hover:underline"
                      >
                        {p.courseCode}
                      </button>
                      <span className="text-slate-600">{p.courseName}</span>
                      <span className="ml-auto inline-flex items-center gap-1.5">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                          Group {p.groupNo}
                        </span>
                        {p.minimumScore !== null && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            ≥ {p.minimumScore.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px] italic text-slate-400">
                Các môn cùng group là lựa chọn thay thế (chỉ cần 1); khác group phải hoàn thành tất cả.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4">
              <h3 className="text-sm font-bold text-[#151c27]">Syllabus</h3>
              <ol className="mt-3 space-y-2.5">
                {course.syllabus.map((w) => (
                  <li key={w.week} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff3ea] text-xs font-bold text-[#F26F21]">
                      {w.week}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#151c27]">{w.topic}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{w.content}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-white px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export type { LookupCurriculum };
