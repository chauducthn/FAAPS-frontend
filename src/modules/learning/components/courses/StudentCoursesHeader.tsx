// Hero header and search/category filter bar for StudentCourses.

import { BookOpenText as BookOpenCheck, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search } from '@phosphor-icons/react';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

interface StudentCoursesHeaderProps {
  totalItems: number;
  categories: string[];
  search: string;
  category: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
}

export function StudentCoursesHeader({
  totalItems,
  categories,
  search,
  category,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
}: StudentCoursesHeaderProps) {
  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-[var(--brand)] p-5 text-white shadow-[0_4px_16px_rgba(242,111,33,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30">
              <BookOpenCheck className="size-5.5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Course Exploration</h1>
              <p className="mt-0.5 max-w-[560px] text-xs font-medium leading-relaxed text-white">
                Browse the course catalog — search by course code or name, filter by category, and open any course for its syllabus and prerequisites.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold tabular-nums ring-1 ring-white/25">
              {totalItems} course{totalItems === 1 ? '' : 's'}
            </span>
            <span className="rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold tabular-nums ring-1 ring-white/25">
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by course code or name..."
              aria-label="Search by course code or name"
              role="searchbox"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
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
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
              className={selectClass}
            >
              <option value="ALL">Category: All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                aria-label="Clear filters"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
