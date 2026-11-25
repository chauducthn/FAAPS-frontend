import { RotateCcw, Search } from 'lucide-react';
import { CREDIT_OPTIONS } from '../../../academic/validations/course.schema';
import type { CourseCategory } from '../../../academic/types/course';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

export function CoursesFilterBar({
  search,
  status,
  categoryId,
  credits,
  categories,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onCreditsChange,
  onClear,
}: {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  categoryId: string;
  credits: number | 'ALL';
  categories: CourseCategory[];
  hasFilters: boolean;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onCategoryChange: (v: string) => void;
  onCreditsChange: (v: number | 'ALL') => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by code or name..."
            aria-label="Search by code or name..."
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
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">● Active</option>
            <option value="INACTIVE">○ Inactive</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className={selectClass}
          >
            <option value="ALL">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <select
            value={String(credits)}
            onChange={(e) => onCreditsChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            aria-label="Filter by credits"
            className={selectClass}
          >
            <option value="ALL">Credits: All</option>
            {CREDIT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                Credits: {value}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear filters"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
