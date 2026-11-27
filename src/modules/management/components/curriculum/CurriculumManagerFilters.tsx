import { CheckCircle as CheckCircle2, CaretDown as ChevronDown, Prohibit as CircleOff, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, Trash as Trash2, X } from '@phosphor-icons/react';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import type { CurriculumBulkAction } from '../../utils/curriculumBulk';

const selectClass =
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-7 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

interface Props {
  kind: CurriculumKind;
  searchPlaceholder: string;
  search: string;
  majorId: string;
  version: string;
  startSemesterId: string;
  status: string;
  current: string;
  majors: MajorOption[];
  versions: string[];
  semesters: { id: string; code: string }[];
  hasFilters: boolean;
  selectedCount: number;
  totalCount?: number;
  selectingAll?: boolean;
  onSelectAll?: () => void;
  onSearchChange: (v: string) => void;
  onMajorChange: (v: string) => void;
  onVersionChange: (v: string) => void;
  onStartSemesterChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onCurrentChange: (v: string) => void;
  onClearFilters: () => void;
  onBulkAction: (action: CurriculumBulkAction) => void;
  onClearSelection: () => void;
}

export function CurriculumManagerFilters(p: Props) {
  const { kind, searchPlaceholder, search, majorId, version, startSemesterId, status, current, majors, versions, semesters, hasFilters, selectedCount, totalCount, selectingAll = false, onSelectAll, onSearchChange, onMajorChange, onVersionChange, onStartSemesterChange, onStatusChange, onCurrentChange, onClearFilters, onBulkAction, onClearSelection } = p;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/50 px-4 py-3">
        <div className="relative min-w-[220px] flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            className="h-9 w-full rounded-md border border-line bg-white pl-9 pr-7 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle hover:text-ink-muted"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[196px]">
          <select value={majorId} onChange={(e) => onMajorChange(e.target.value)} aria-label="Major filter" className={selectClass}>
            <option value="">All majors</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[126px]">
          <select value={version} onChange={(e) => onVersionChange(e.target.value)} aria-label="Cohort filter" className={selectClass}>
            <option value="">All cohorts</option>
            {versions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]">
          <select value={startSemesterId} onChange={(e) => onStartSemesterChange(e.target.value)} aria-label="Start semester filter" className={selectClass}>
            <option value="">All start terms</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.code}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[126px]">
          <select value={status} onChange={(e) => onStatusChange(e.target.value)} aria-label="Status filter" className={selectClass}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[136px]">
          <select value={current} onChange={(e) => onCurrentChange(e.target.value)} aria-label="Current version filter" className={selectClass}>
            <option value="">All versions</option>
            <option value="true">Current only</option>
            <option value="false">Previous only</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasFilters}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-muted"
        >
          <RotateCcw className="size-3.5" /> Reset
        </button>
      </div>

      {selectedCount > 0 && (
        <div
          className="flex flex-wrap items-center justify-between gap-2.5 border-b border-brand/25 bg-brand-soft/70 px-4 py-2.5"
          role="toolbar"
          aria-label={`${kind === 'cohort' ? 'Cohort' : 'Curriculum'} bulk actions`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {selectedCount} selected
            </span>
            {onSelectAll && !!totalCount && totalCount > selectedCount && (
              <button
                type="button"
                disabled={selectingAll}
                onClick={onSelectAll}
                className="rounded-md border border-brand/30 bg-white px-2 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft-strong/70 disabled:opacity-50"
              >
                {selectingAll ? 'Selecting…' : `Select all ${totalCount}`}
              </button>
            )}
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-muted hover:bg-brand-soft-strong/80 hover:text-ink-primary"
            >
              <X className="size-3.5" aria-hidden /> Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkAction('ACTIVE')}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <CheckCircle2 className="size-3.5" /> Set active
            </button>
            <button
              type="button"
              onClick={() => onBulkAction('INACTIVE')}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-ink-secondary ring-1 ring-line transition-colors hover:bg-surface-hover"
            >
              <CircleOff className="size-3.5" /> Set inactive
            </button>
            <button
              type="button"
              onClick={() => onBulkAction('DELETE')}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <Trash2 className="size-3.5" /> Delete selected
            </button>
          </div>
        </div>
      )}
    </>
  );
}
