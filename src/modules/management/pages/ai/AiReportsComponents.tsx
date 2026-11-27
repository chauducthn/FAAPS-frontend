import {
  ArrowCounterClockwise as RotateCcw,
  MagnifyingGlass as Search,
  Warning as AlertTriangle,
  X,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { AdminStatTile } from '../../components/AdminStatTile';
import type { AiReportStatus } from '../../types/admin';
import { REPORT_TABS } from './reportConstants';

export function StatusCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  active,
  onClick,
}: {
  label: string;
  value?: number;
  icon: typeof AlertTriangle;
  tone: 'neutral' | 'danger' | 'success' | 'warning' | 'brand';
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <AdminStatTile
      icon={<Icon className="size-4" />}
      label={label}
      value={value === undefined ? '—' : value.toLocaleString('en-US')}
      meta={hint}
      tone={tone}
      active={active}
      onClick={onClick}
    />
  );
}

export function AiReportsFilterBar({
  search,
  status,
  hasFilters,
  onSearchChange,
  onStatusChange,
  onClear,
}: {
  search: string;
  status: AiReportStatus | '';
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AiReportStatus | '') => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line-soft bg-surface-page/60 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by report ID, student ID, or student name..."
          aria-label="Search reports"
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

      <div
        role="tablist"
        aria-label="Report status"
        className="inline-flex h-9 shrink-0 items-center rounded-md border border-line bg-surface-page p-0.5"
      >
        {REPORT_TABS.map((t) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={status === t.value}
            onClick={() => onStatusChange(t.value)}
            className={cn(
              'h-full rounded-[5px] px-3 text-xs font-medium transition-colors',
              status === t.value
                ? 'bg-white text-ink-primary shadow-[0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-line'
                : 'text-ink-muted hover:text-ink-primary',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!hasFilters}
        onClick={onClear}
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
