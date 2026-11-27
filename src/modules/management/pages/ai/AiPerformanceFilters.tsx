import {
  ArrowCounterClockwise as RotateCcw,
  CaretDown as ChevronDown,
  Warning as AlertTriangle,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AiConfig, AiPurpose } from '../../../ai/types/ai-config';
import { PURPOSES, daysAgo, today } from './aiPerformanceUtils';

const SELECT_CLS = cn(
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-8',
  'text-[13px] font-medium text-ink-secondary transition-colors',
  'hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
);

const DATE_CLS = cn(
  'h-9 rounded-md border border-line bg-white px-2.5 text-[13px] font-medium text-ink-secondary',
  'transition-colors hover:border-ink-subtle/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
);

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
    <div className="shrink-0 border-b border-line-soft bg-surface-page/60">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 xl:flex-nowrap">
        <div className="inline-flex h-9 shrink-0 items-center rounded-md border border-line bg-white p-0.5 text-xs font-medium">
          {[
            { days: 7, label: '7d' },
            { days: 30, label: '30d' },
            { days: 90, label: '90d' },
          ].map((r) => {
            const active = startDate === daysAgo(r.days - 1) && endDate === today();
            return (
              <button
                key={r.days}
                type="button"
                onClick={() => onApplyPreset(r.days)}
                aria-pressed={active}
                className={cn(
                  'h-full rounded-[5px] px-2.5 transition-colors',
                  active ? 'bg-brand-soft font-semibold text-brand-ink' : 'text-ink-muted hover:text-ink-primary',
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            id="perf-start"
            type="date"
            aria-label="Start date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={DATE_CLS}
          />
          <span className="text-xs text-ink-subtle" aria-hidden>→</span>
          <input
            id="perf-end"
            type="date"
            aria-label="End date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={DATE_CLS}
          />
        </div>

        <div className="relative min-w-[132px] flex-1 sm:max-w-[160px]">
          <select
            id="perf-purpose"
            aria-label="Filter by purpose"
            value={purpose}
            onChange={(e) => onPurposeChange(e.target.value as 'ALL' | AiPurpose)}
            className={SELECT_CLS}
          >
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <div className="relative min-w-[156px] flex-1">
          <select
            id="perf-config"
            aria-label="Filter by configuration"
            value={configId}
            onChange={(e) => onConfigChange(e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All configurations</option>
            {configs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasFilters}
          aria-label="Reset filters"
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

      {rangeError && (
        <p role="alert" className="flex items-center gap-1.5 border-t border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
          <AlertTriangle className="size-3.5 shrink-0" weight="fill" /> {rangeError}
        </p>
      )}
    </div>
  );
}
