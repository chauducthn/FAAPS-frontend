import { Activity, AlertTriangle, Download, RotateCcw } from 'lucide-react';
import type { AiConfig, AiPurpose } from '../../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';
import { PURPOSES, daysAgo, today } from './aiPerformanceUtils';

const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';
const dateClass =
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-xs transition-colors focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';
const filterLabel = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

export function AiPerformanceHeader({
  isFetching,
  isLoading,
  onRefresh,
  onExport,
}: {
  isFetching: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
          <Activity className="size-5.5" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">AI Performance</h1>
          <p className="mt-0.5 max-w-[600px] text-xs leading-relaxed text-gray-500">
            Usage, success rate and token consumption for each AI configuration
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isFetching && !isLoading && (
          <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[11px] font-bold text-[#9a3412] ring-1 ring-orange-200">
            Refreshing…
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-xs transition-all hover:border-[#F26F21] hover:text-[#C2410C]"
        >
          <RotateCcw className="size-3.5" /> Refresh
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={isLoading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <Download className="size-3.5" /> Export CSV
        </button>
      </div>
    </div>
  );
}

export function AiPerformanceFilters({
  purpose,
  startDate,
  endDate,
  configId,
  configs,
  hasFilters,
  rangeError,
  onPurposeChange,
  onStartDateChange,
  onEndDateChange,
  onConfigChange,
  onApplyPreset,
  onReset,
}: {
  purpose: 'ALL' | AiPurpose;
  startDate: string;
  endDate: string;
  configId: string;
  configs: AiConfig[];
  hasFilters: boolean;
  rangeError: string | null;
  onPurposeChange: (val: 'ALL' | AiPurpose) => void;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onConfigChange: (val: string) => void;
  onApplyPreset: (days: number) => void;
  onReset: () => void;
}) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="perf-purpose" className={filterLabel}>Purpose</label>
          <select id="perf-purpose" value={purpose} onChange={(e) => onPurposeChange(e.target.value as 'ALL' | AiPurpose)} className={selectClass}>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
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
          <select id="perf-config" value={configId} onChange={(e) => onConfigChange(e.target.value)} className={selectClass}>
            <option value="">All configurations</option>
            {configs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Quick range:</span>
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
                'rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors',
                activeRange
                  ? 'border-[#F26F21] bg-[#fff7ed] text-[#9a3412]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {r.label}
            </button>
          );
        })}
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-2.5 py-1 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        )}
      </div>

      {rangeError && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <AlertTriangle className="size-3.5" /> {rangeError}
        </p>
      )}
    </section>
  );
}
