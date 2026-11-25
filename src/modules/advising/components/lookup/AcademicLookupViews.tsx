// Courses catalog table view for AdvisorAcademicLookup.

import { BookMarked, Layers } from 'lucide-react';
import { Pagination } from '../../../management/components/Pagination';
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
                        onClick={() => onOpenCourse(c)}
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
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-bold tabular-nums text-slate-900">{c.credits}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onOpenCourse(c)}
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
        <Pagination page={page} pageSize={pageSize} total={total} noun="courses" onChange={onPageChange} bare />
      </div>
    </>
  );
}
