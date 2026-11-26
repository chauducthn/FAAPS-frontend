import { Warning as AlertTriangle, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import type { AiReportStatus } from '../../types/admin';
import { cn } from '@/shared/lib/utils';
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
  tone: 'slate' | 'red' | 'green' | 'gray';
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const iconTone: Record<typeof tone, string> = {
    slate: 'bg-gray-100 text-gray-700',
    red: 'bg-red-50 text-red-600',
    green: 'bg-emerald-50 text-emerald-700',
    gray: 'bg-gray-100 text-gray-500',
  };
  const activeTone: Record<typeof tone, string> = {
    slate: 'border-gray-400 bg-gray-50/70',
    red: 'border-red-300 bg-red-50/40',
    green: 'border-emerald-400/70 bg-emerald-50/40',
    gray: 'border-gray-400 bg-gray-50/70',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? activeTone[tone] : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconTone[tone])}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-lg font-bold leading-none tabular-nums text-gray-900">
            {value === undefined ? '—' : value.toLocaleString('en-US')}
          </span>
          {hint && <span className="truncate text-xs text-gray-400">{hint}</span>}
        </div>
      </div>
    </div>
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
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3 lg:flex-nowrap">
      <div className="relative min-w-0 flex-1 basis-full lg:basis-auto">
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by report ID, student ID, or student name..."
          aria-label="Search reports"
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Report status"
        className="inline-flex h-9 shrink-0 items-center rounded-lg border border-gray-200/80 bg-white p-0.5"
      >
        {REPORT_TABS.map((t) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={status === t.value}
            onClick={() => onStatusChange(t.value)}
            className={cn(
              'h-7 rounded-md px-3 text-xs font-semibold transition-colors',
              status === t.value
                ? 'bg-[#F26F21] text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
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
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
