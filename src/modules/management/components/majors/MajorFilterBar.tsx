import { CheckCircle as CheckCircle2, CaretDown as ChevronDown, Prohibit as CircleOff, NotePencil as FileEdit, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, Trash as Trash2, X } from '@phosphor-icons/react';
import type { MajorStatus } from '../../../academic/types/major';

interface MajorFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCode: string;
  codeOptions: string[];
  onCodeChange: (value: string) => void;
  selectedDuration: string;
  durationOptions: number[];
  onDurationChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearContext: () => void;
  selectedCount: number;
  totalItems?: number;
  isSelectingAll?: boolean;
  onSelectAllMatching?: () => void;
  isUpdatingStatus?: boolean;
  onClearSelection: () => void;
  onBulkStatus: (status: MajorStatus) => void;
  onDeleteSelected: () => void;
}

const selectClass =
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-7 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

export default function MajorFilterBar(p: MajorFilterBarProps) {
  const { search, onSearchChange, selectedCode, codeOptions, onCodeChange, selectedDuration, durationOptions, onDurationChange, selectedStatus, onStatusChange, onClearContext, selectedCount, totalItems, isSelectingAll = false, onSelectAllMatching, isUpdatingStatus, onClearSelection, onBulkStatus, onDeleteSelected } = p;
  const hasFilters = search !== '' || selectedCode !== 'ALL' || selectedDuration !== 'ALL' || selectedStatus !== 'ALL';
  const codes = Array.from(new Set([...(selectedCode !== 'ALL' ? [selectedCode] : []), ...codeOptions])).sort();
  const durations = Array.from(
    new Set([...(selectedDuration !== 'ALL' ? [Number(selectedDuration)] : []), ...durationOptions]),
  ).sort((a, b) => a - b);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/50 px-4 py-3 lg:flex-nowrap">
        <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="search"
            placeholder="Search by code, major name, credits, or duration..."
            aria-label="Search majors"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
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

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
          <select
            value={selectedCode}
            onChange={(e) => onCodeChange(e.target.value)}
            className={selectClass}
            aria-label="Filter by major code"
          >
            <option value="ALL">All codes</option>
            {codes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[144px]">
          <select
            value={selectedDuration}
            onChange={(e) => onDurationChange(e.target.value)}
            className={selectClass}
            aria-label="Filter by duration"
          >
            <option value="ALL">All durations</option>
            {durations.map((d) => (
              <option key={d} value={String(d)}>{d} {d === 1 ? 'year' : 'years'}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative w-[calc(50%-0.25rem)] shrink-0 sm:w-[132px]">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <button
          type="button"
          onClick={onClearContext}
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
          aria-label="Major bulk actions"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {selectedCount} selected
            </span>
            {onSelectAllMatching && !!totalItems && totalItems > selectedCount && (
              <button
                type="button"
                disabled={isSelectingAll}
                onClick={onSelectAllMatching}
                className="rounded-md border border-brand/30 bg-white px-2 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft-strong/70 disabled:opacity-50"
              >
                {isSelectingAll ? 'Selecting…' : `Select all ${totalItems}`}
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
              disabled={isUpdatingStatus}
              onClick={() => onBulkStatus('ACTIVE')}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
            >
              <CheckCircle2 className="size-3.5" /> Set active
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onBulkStatus('DRAFT')}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-[13px] font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
            >
              <FileEdit className="size-3.5" /> Set draft
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onBulkStatus('INACTIVE')}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-ink-secondary ring-1 ring-line transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <CircleOff className="size-3.5" /> Set inactive
            </button>
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={onDeleteSelected}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" /> Delete selected
            </button>
          </div>
        </div>
      )}
    </>
  );
}
