import type { ReactNode } from 'react';
import { Activity, CircleAlert, Clock, RotateCcw, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PerformanceTotals } from './aiPerformanceUtils';
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
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-[#C2410C]',
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="truncate text-lg font-extrabold tabular-nums leading-tight text-gray-900">{value}</p>
        {hint && <p className="truncate text-[11px] text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

export function AiPerformanceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">Could not load performance data</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
          The chart failed to load. Your filters are kept — try again in a moment.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
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
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5">
            <div className="size-9 shrink-0 animate-pulse rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
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
