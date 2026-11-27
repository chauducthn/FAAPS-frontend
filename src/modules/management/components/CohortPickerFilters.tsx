import { CaretDown as ChevronDown, MagnifyingGlass as Search } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export type PoolFilter = 'all' | 'ready' | 'missing';

const SELECT_CLS = cn(
  'h-9 appearance-none rounded-md border border-line bg-white pl-3 pr-7',
  'text-xs font-medium text-ink-secondary focus:border-brand focus:outline-none',
);

export function CohortPickerFilters({
  search, majorFilter, cohortFilter, poolFilter, majors, cohortVersions,
  onSearch, onMajor, onCohort, onPoolFilter,
}: {
  search: string; majorFilter: string; cohortFilter: string; poolFilter: PoolFilter;
  majors: string[]; cohortVersions: string[];
  onSearch: (v: string) => void; onMajor: (v: string) => void;
  onCohort: (v: string) => void; onPoolFilter: (v: PoolFilter) => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <div className="relative min-w-[160px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search major or cohort (e.g. SE K19)…"
          className={cn(
            'h-9 w-full rounded-md border border-line bg-white pl-8 pr-3 text-xs',
            'text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none',
          )}
        />
      </div>
      {majors.length > 1 && (
        <div className="relative">
          <select
            aria-label="Filter by major"
            value={majorFilter}
            onChange={(e) => onMajor(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All majors ({majors.length})</option>
            {majors.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>
      )}
      {cohortVersions.length > 1 && (
        <div className="relative">
          <select
            aria-label="Filter by cohort"
            value={cohortFilter}
            onChange={(e) => onCohort(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All cohorts</option>
            {cohortVersions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>
      )}
      <div className="inline-flex h-9 items-center rounded-md border border-line bg-surface-page p-0.5 text-xs font-semibold">
        {([['all', 'All'], ['ready', 'Ready'], ['missing', 'Not set']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onPoolFilter(key)}
            className={cn(
              'h-full rounded-[6px] px-2.5 transition-colors',
              poolFilter === key
                ? 'bg-white text-brand-ink shadow-2xs'
                : 'text-ink-muted hover:text-ink-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
