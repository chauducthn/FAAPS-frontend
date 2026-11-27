import {
  ArrowCounterClockwise as RotateCcw,
  Clock,
  Lightning as Zap,
  Pulse as Activity,
  TrendUp as TrendingUp,
  WarningCircle as CircleAlert,
} from '@phosphor-icons/react';
import { AdminStatTile } from '../../components/AdminStatTile';
import type { PerformanceTotals } from './aiPerformanceUtils';
export { AiPerformanceSummaryTable } from './AiPerformanceSummaryTable';

export function AiPerformanceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/15">
        <CircleAlert className="size-5" weight="fill" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-primary">Could not load performance data</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The metrics failed to load. Your filters are kept — try again in a moment.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-primary px-4 text-xs font-semibold text-surface-page transition-colors hover:bg-ink-secondary"
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
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-line/80 bg-white px-4 py-3">
            <div className="size-9 shrink-0 animate-pulse rounded-md bg-line-soft" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-24 animate-pulse rounded-sm bg-line-soft" />
              <div className="h-5 w-20 animate-pulse rounded-sm bg-line-soft" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatTile
        icon={<Activity className="size-4" />}
        label="Total requests"
        value={totals.totalRequests.toLocaleString('en-US')}
        meta={peak ? `Peak ${peak.requests.toLocaleString('en-US')} on ${peak.date}` : 'No traffic yet'}
        tone="neutral"
      />
      <AdminStatTile
        icon={<TrendingUp className="size-4" />}
        label="Success rate"
        value={`${totals.successRate.toFixed(1)}%`}
        meta={`${totals.totalFailed.toLocaleString('en-US')} failed`}
        tone="success"
      />
      <AdminStatTile
        icon={<Clock className="size-4" />}
        label="Avg latency"
        value={`${totals.weightedLatency.toLocaleString('en-US')} ms`}
        meta="Weighted by volume"
        tone="neutral"
      />
      <AdminStatTile
        icon={<Zap className="size-4" />}
        label="Error rate"
        value={`${totals.errorRate.toFixed(2)}%`}
        meta={`${(totals.promptTokens + totals.completionTokens).toLocaleString('en-US')} tokens`}
        tone={totals.errorRate > 5 ? 'danger' : 'brand'}
      />
    </div>
  );
}
