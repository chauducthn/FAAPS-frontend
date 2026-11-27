import type { ReactNode } from 'react';
import { Pulse as Activity, WarningCircle as CircleAlert, Clock, ArrowCounterClockwise as RotateCcw, TrendUp as TrendingUp, Lightning as Zap } from '@phosphor-icons/react';
import type { PerformanceTotals } from './aiPerformanceUtils';
import { AdminStatTile } from '../../components/AdminStatTile';
export { AiPerformanceSummaryTable } from './AiPerformanceSummaryTable';

function Kpi({
  label,
  value,
  icon,
  hint,
  tone = 'gray',
}: {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  tone?: 'gray' | 'green' | 'blue' | 'orange';
}) {
  return <AdminStatTile icon={icon} label={label} value={value} meta={hint} tone={tone} />;
}

export function AiPerformanceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-line/80 bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">Could not load performance data</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The chart failed to load. Your filters are kept — try again in a moment.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink-primary px-4 py-2 text-xs font-bold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function AiPerformanceKpiStrip({
  isLoading,
  totals,
  peak,
}: {
  isLoading: boolean;
  totals: PerformanceTotals;
  peak: { date: string; requests: number } | null;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-4 py-3.5">
            <div className="size-9 shrink-0 animate-pulse rounded-lg bg-line-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-24 animate-pulse rounded bg-line-soft" />
              <div className="h-5 w-20 animate-pulse rounded bg-line-soft" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi
        icon={<Activity className="size-4" />}
        label="Total requests"
        value={totals.totalRequests.toLocaleString('en-US')}
        hint={peak ? `Peak ${peak.requests.toLocaleString('en-US')} on ${peak.date}` : 'No traffic yet'}
      />
      <Kpi
        icon={<TrendingUp className="size-4" />}
        label="Success rate"
        value={`${totals.successRate.toFixed(1)}%`}
        hint={`${totals.totalFailed.toLocaleString('en-US')} failed`}
        tone="green"
      />
      <Kpi
        icon={<Clock className="size-4" />}
        label="Avg latency"
        value={`${totals.weightedLatency.toLocaleString('en-US')} ms`}
        hint="Weighted by volume"
        tone="blue"
      />
      <Kpi
        icon={<Zap className="size-4" />}
        label="Error rate"
        value={`${totals.errorRate.toFixed(2)}%`}
        hint={`${(totals.promptTokens + totals.completionTokens).toLocaleString('en-US')} tokens`}
        tone="orange"
      />
    </div>
  );
}
