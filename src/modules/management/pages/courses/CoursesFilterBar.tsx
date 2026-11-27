import {
  ArrowCounterClockwise as RotateCcw,
  CaretDown as ChevronDown,
  MagnifyingGlass as Search,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { CREDIT_OPTIONS } from '../../../academic/validations/course.schema';
import type { CourseCategory, WorkloadLevel } from '../../../academic/types/course';

const SELECT_CLASS = cn(
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-8',
  'text-[13px] font-medium text-ink-secondary transition-colors',
  'hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
);

export function CoursesFilterBar({
  search,
  status,
  categoryId,
  credits,
  workloadLevel,
  categories,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onCreditsChange,
  onWorkloadChange,
  onClear,
}: {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  categoryId: string;
  credits: number | 'ALL';
  workloadLevel: WorkloadLevel | 'ALL';
  categories: CourseCategory[];
  hasFilters: boolean;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onCategoryChange: (v: string) => void;
  onCreditsChange: (v: number | 'ALL') => void;
  onWorkloadChange: (v: WorkloadLevel | 'ALL') => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/60 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by code or name..."
          aria-label="Search by code or name..."
          role="searchbox"
          className={cn(
            'h-9 w-full rounded-md border border-line bg-white pl-9 pr-7 text-[13px]',
            'text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-ink-subtle hover:text-ink-primary"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
          aria-label="Filter by status"
          className={SELECT_CLASS}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[168px]">
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className={SELECT_CLASS}
        >
          <option value="ALL">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[128px]">
        <select
          value={String(credits)}
          onChange={(e) => onCreditsChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          aria-label="Filter by credits"
          className={SELECT_CLASS}
        >
          <option value="ALL">All credits</option>
          {CREDIT_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value} credits
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[136px]">
        <select
          value={workloadLevel}
          onChange={(e) => onWorkloadChange(e.target.value as WorkloadLevel | 'ALL')}
          aria-label="Filter by workload"
          className={SELECT_CLASS}
        >
          <option value="ALL">All workloads</option>
          <option value="LIGHT">Light</option>
          <option value="MEDIUM">Medium</option>
          <option value="HEAVY">Heavy</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
        aria-label="Clear filters"
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3',
          'text-[13px] font-medium text-ink-secondary transition-colors',
          'hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40',
          'disabled:hover:border-line disabled:hover:text-ink-secondary',
        )}
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
