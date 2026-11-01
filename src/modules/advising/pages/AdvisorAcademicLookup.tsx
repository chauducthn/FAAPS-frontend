// src/pages/advising/AdvisorAcademicLookup.tsx
// Trang "Academic Search" (tên mới: Academic Lookup -> Academic Search) — tra cứu Curricula + Courses (read-only).
// Đồng bộ Overview: hero cam đậm + nút trắng + 4 KPI trắng viền top-bar + section p-6 sm:p-8.

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
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
import type { LookupCourse, LookupCurriculum } from '../types/academic-lookup';
import { cn } from '@/shared/lib/utils';

type ViewMode = 'curricula' | 'courses';

const PAGE_SIZE = 8;

const CATEGORY_TONE: Record<string, string> = {
  Core: 'bg-orange-100 text-orange-900 ring-orange-300',
  Foundation: 'bg-blue-100 text-blue-900 ring-blue-300',
  Project: 'bg-purple-100 text-purple-900 ring-purple-300',
  Elective: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  Internship: 'bg-amber-100 text-amber-900 ring-amber-300',
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

  // Mở môn học theo mã (từ danh sách curriculum) — tìm trong cache, không dựng dữ liệu giả.
  const openCourseByCode = async (code: string) => {
    const found = courses.find((c) => c.code === code);
    if (found) {
      await openCourse(found);
      return;
    }
    // Mã môn nằm ngoài trang đang tải: gọi API tìm theo mã.
    const matches = await academicLookupService.getCourses({ search: code });
    const exact = matches.find((c) => c.code === code);
    if (exact) await openCourse(exact);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
      {/* Hero — đồng bộ Overview: cam đậm + nút trắng */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <LibraryBig className="size-7" aria-hidden strokeWidth={2.25} />
              Academic Search
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              Tra cứu chương trình đào tạo và môn học để tư vấn chính xác — read-only, không chỉnh sửa.
            </p>
          </div>
          <Link
            to="/advisor"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            Back to Overview
          </Link>
        </div>
      </div>

      {/* KPI read-only — giống Overview */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {[
          { label: 'Curricula', sub: 'training programs', value: String(curricula.length), icon: GraduationCap, iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
          { label: 'Courses', sub: 'subjects in catalog', value: String(coursesQuery.data?.length ?? courses.length), icon: BookOpen, iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
          { label: 'Majors', sub: 'majors covered', value: String(new Set(curricula.map((c) => c.majorCode)).size || '—'), icon: LibraryBig, iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
          { label: 'Categories', sub: 'course groups', value: String(Math.max(0, categories.length - 1)), icon: Layers, iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
        ].map((s) => (
          <div
            key={s.label}
            aria-readonly="true"
            className="relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)]"
          >
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', s.topBar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{s.label}</p>
                <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{s.sub}</p>
              </div>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', s.iconBox)}>
                <s.icon className="size-5" aria-hidden strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View switcher — h-11 chuẩn touch target */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Catalog view">
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

        {view === 'curricula' ? (
          <div className="mt-6">
            {curriculaQuery.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : curriculaQuery.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800">
                Could not load curricula.{' '}
                <button type="button" onClick={() => curriculaQuery.refetch()} className="font-bold hover:underline">
                  Retry
                </button>
              </div>
            ) : curricula.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
                No curricula found.
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {curricula.map((curr) => {
                  const expanded = expandedCurr === curr.id;
                  return (
                    <article key={curr.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-900 ring-1 ring-inset ring-orange-300">
                          <GraduationCap className="size-3.5" aria-hidden />
                          {curr.majorCode} · {curr.version}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {curr.totalCredits} credits
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-[15px] font-bold text-slate-900">{curr.name}</h3>
                      <p className="mt-0.5 text-sm font-medium text-slate-600">{curr.majorName}</p>

                      {expanded && (
                        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                          {curr.semesters.map((s) => (
                            <div key={s.semesterNumber}>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                                Semester {s.semesterNumber}
                              </p>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {s.courses.map((code) => (
                                  <button
                                    key={code}
                                    type="button"
                                    onClick={() => openCourseByCode(code)}
                                    title="View course detail"
                                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-[#fff3ea] hover:text-[#F26F21]"
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
                        className="mt-4 inline-flex h-11 items-center gap-1 rounded-xl px-2 text-sm font-bold text-[#F26F21] transition-colors hover:bg-[#fff3ea]"
                      >
                        {expanded ? 'Collapse' : `View ${curr.semesters.length} semesters`}
                        <ChevronRight className={cn('size-4 transition-transform', expanded && 'rotate-90')} aria-hidden />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {coursesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : coursesQuery.isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800">
                Could not load courses.{' '}
                <button type="button" onClick={() => coursesQuery.refetch()} className="font-bold hover:underline">
                  Retry
                </button>
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Code</th>
                      <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Course</th>
                      <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Category</th>
                      <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Credits</th>
                      <th scope="col" className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                              <BookMarked className="size-5" aria-hidden />
                            </span>
                            <p className="text-base font-bold text-slate-900">No courses match your filters.</p>
                            <p className="text-sm font-medium text-slate-600">Try a different keyword or category.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((c) => (
                        <tr key={c.id} className="bg-white transition-colors hover:bg-slate-50/70">
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                              {c.code}
                            </span>
                          </td>
                          <td className="max-w-64 px-6 py-5">
                            <button
                              type="button"
                              onClick={() => openCourse(c)}
                              className="block max-w-full truncate text-left text-[15px] font-bold text-slate-900 hover:text-[#F26F21] hover:underline"
                            >
                              {c.name}
                            </button>
                            <p className="mt-0.5 line-clamp-1 text-sm font-medium text-slate-600">{c.description}</p>
                          </td>
                          <td className="whitespace-nowrap px-6 py-5">
                            <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset', CATEGORY_TONE[c.category] ?? 'bg-slate-100 text-slate-700 ring-slate-200')}>
                              {c.category}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-bold tabular-nums text-slate-900">
                            {c.credits}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => openCourse(c)}
                                className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#F26F21] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
                              >
                                <Layers className="size-4" aria-hidden />
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
            <div className="mt-5">
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="courses" onChange={setPage} bare />
            </div>
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
        {/* Hero cam đậm — đồng bộ page hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 pb-5 pt-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/15" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white px-3 text-sm font-extrabold text-[#c2410c] shadow">
              {course.code}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                {course.category} · {formatCredits(course.credits)}
              </p>
              <h2 className="mt-0.5 truncate text-xl font-extrabold">{course.name}</h2>
              <p className="mt-0.5 text-sm font-medium text-white/95">{course.code}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-900">
              {formatCredits(course.credits)}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-[#fafbfd] p-5">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900">Objectives</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.objectives}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900">Learning outcomes</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{course.learningOutcomes}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Prerequisites {course.prerequisites.length > 0 && <span className="ml-1 text-xs font-bold text-slate-600">({course.prerequisites.length})</span>}
              </h3>
              {course.prerequisites.length === 0 ? (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                  No prerequisites — sinh viên có thể đăng ký trực tiếp.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {course.prerequisites.map((p) => (
                    <li key={`${p.courseCode}-${p.groupNo}`} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#f7f8fa] px-3 py-2.5 text-sm">
                      <button
                        type="button"
                        onClick={() => onOpenCourse(p.courseCode)}
                        className="font-bold text-[#F26F21] hover:underline"
                      >
                        {p.courseCode}
                      </button>
                      <span className="font-medium text-slate-700">{p.courseName}</span>
                      <span className="ml-auto inline-flex items-center gap-1.5">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                          Group {p.groupNo}
                        </span>
                        {p.minimumScore !== null && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            ≥ {p.minimumScore.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-sm italic text-slate-600">
                Các môn cùng group là lựa chọn thay thế (chỉ cần 1); khác group phải hoàn thành tất cả.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">Syllabus</h3>
              {course.syllabus.length === 0 ? (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600">
                  Chưa có dữ liệu tuần học cho môn này.
                </p>
              ) : (
                <ol className="mt-3 space-y-3">
                  {course.syllabus.map((w) => (
                    <li key={w.week} className="flex gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fff3ea] text-xs font-bold text-[#F26F21]">
                        {w.week}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{w.topic}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{w.content}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export type { LookupCurriculum };
