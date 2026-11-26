import { Warning as AlertTriangle, CaretDown as ChevronDown, DownloadSimple as Download, ArrowsClockwise as RefreshCw, ArrowCounterClockwise as RotateCcw } from '@phosphor-icons/react';
import type { AiConfig, AiPurpose } from '../../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';
import { PURPOSES, daysAgo, today } from './aiPerformanceUtils';

const selectClass =
  'h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';
const dateClass =
  'h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15';
const filterLabel = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500';

export function AiPerformanceFilters({
  purpose,
  startDate,
  endDate,
  configId,
  configs,
  hasFilters,
  rangeError,
  isFetching,
  isLoading,
  onPurposeChange,
  onStartDateChange,
  onEndDateChange,
  onConfigChange,
  onApplyPreset,
  onReset,
  onRefresh,
  onExport,
}: {
  purpose: 'ALL' | AiPurpose;
  startDate: string;
  endDate: string;
  configId: string;
  configs: AiConfig[];
  hasFilters: boolean;
  rangeError: string | null;
  isFetching: boolean;
  isLoading: boolean;
  onPurposeChange: (val: 'ALL' | AiPurpose) => void;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onConfigChange: (val: string) => void;
  onApplyPreset: (days: number) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExport: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-gray-100 bg-gray-50/50 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-gray-500">Range:</span>
          {[
            { days: 7, label: '7 days' },
            { days: 30, label: '30 days' },
            { days: 90, label: '90 days' },
          ].map((r) => {
            const activeRange = startDate === daysAgo(r.days - 1) && endDate === today();
            return (
              <button
                key={r.days}
                type="button"
                onClick={() => onApplyPreset(r.days)}
                aria-pressed={activeRange}
                className={cn(
                  'h-8 rounded-lg border px-3 text-xs font-semibold transition-colors',
                  activeRange
                    ? 'border-[#F26F21]/60 bg-orange-50 text-[#C2410C]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                {r.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onReset}
            disabled={!hasFilters}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#F26F21] hover:text-[#C2410C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={cn('size-3.5', isFetching && !isLoading && 'animate-spin')} />
            Refresh
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isLoading || !!rangeError}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Download className="size-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="perf-purpose" className={filterLabel}>Purpose</label>
          <div className="relative">
            <select id="perf-purpose" value={purpose} onChange={(e) => onPurposeChange(e.target.value as 'ALL' | AiPurpose)} className={selectClass}>
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label htmlFor="perf-start" className={filterLabel}>Start date</label>
          <input id="perf-start" type="date" value={startDate} max={endDate || undefined} onChange={(e) => onStartDateChange(e.target.value)} className={dateClass} />
        </div>
        <div>
          <label htmlFor="perf-end" className={filterLabel}>End date</label>
          <input id="perf-end" type="date" value={endDate} min={startDate || undefined} onChange={(e) => onEndDateChange(e.target.value)} className={dateClass} />
        </div>
        <div>
          <label htmlFor="perf-config" className={filterLabel}>Configuration</label>
          <div className="relative">
            <select id="perf-config" value={configId} onChange={(e) => onConfigChange(e.target.value)} className={selectClass}>
              <option value="">All configurations</option>
              {configs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {rangeError && (
        <p role="alert" className="flex items-center gap-1.5 border-t border-red-100 bg-red-50/60 px-4 py-2.5 text-xs font-semibold text-red-600">
          <AlertTriangle className="size-3.5" /> {rangeError}
        </p>
      )}
    </section>
  );
}
