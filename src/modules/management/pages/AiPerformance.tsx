// AI Performance — Operate-mode redesign synced with the Cam ecosystem:
// gradient Cam header, KPI strip, Date Range filters, Recharts visuals,
// skeleton / empty / error states, per-configuration summary table.
import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CircleAlert,
  Clock,
  RotateCcw,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAiConfigsQuery, useAiPerformanceQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import AiPerformanceChart from '../components/ai-config/AiPerformanceChart';
import type { AiPerformanceFilterParams, AiPurpose } from '../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';

const PURPOSES: { value: 'ALL' | AiPurpose; label: string }[] = [
  { value: 'ALL', label: 'Purpose: All' },
  { value: 'CHAT', label: 'Chat' },
  { value: 'EMBEDDING', label: 'Embedding' },
  { value: 'OCR', label: 'OCR' },
];

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';
const dateClass =
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-xs transition-colors focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';
const filterLabel = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

export default function AiPerformancePage() {
  const [purpose, setPurpose] = useState<'ALL' | AiPurpose>('ALL');
  const [startDate, setStartDate] = useState(daysAgo(29));
  const [endDate, setEndDate] = useState(today());
  const [configId, setConfigId] = useState('');

  const configsQuery = useAiConfigsQuery();

  const params: AiPerformanceFilterParams = useMemo(
    () => ({
      purpose: purpose === 'ALL' ? undefined : purpose,
      configId: configId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [purpose, configId, startDate, endDate],
  );

  const { data, isLoading, isFetching, isError, refetch } = useAiPerformanceQuery(params);

  const rangeError =
    startDate && endDate && startDate > endDate ? 'Start date must not be after end date.' : null;

  const totals = useMemo(() => {
    const summary = data?.summary ?? [];
    const totalRequests = summary.reduce((a, s) => a + s.totalRequests, 0);
    const totalFailed = summary.reduce((a, s) => a + s.failedRequests, 0);
    const totalFallback = summary.reduce((a, s) => a + s.fallbackRequests, 0);
    const weightedLatency = totalRequests
      ? summary.reduce((a, s) => a + s.averageLatencyMs * s.totalRequests, 0) / totalRequests
      : 0;
    const promptTokens = summary.reduce((a, s) => a + s.totalPromptTokens, 0);
    const completionTokens = summary.reduce((a, s) => a + s.totalCompletionTokens, 0);
    const errorRate = totalRequests ? (totalFailed / totalRequests) * 100 : 0;
    return {
      totalRequests,
      totalFailed,
      totalFallback,
      weightedLatency: Math.round(weightedLatency),
      promptTokens,
      completionTokens,
      errorRate,
      successRate: totalRequests ? ((totalRequests - totalFailed) / totalRequests) * 100 : 0,
    };
  }, [data]);

  const daily = data?.byDay ?? [];
  const peak = useMemo(
    () =>
      daily.reduce<{ date: string; requests: number } | null>(
        (max, d) => (!max || d.requests > max.requests ? { date: d.date, requests: d.requests } : max),
        null,
      ),
    [daily],
  );

  const applyPreset = (days: number) => {
    setStartDate(daysAgo(days - 1));
    setEndDate(today());
  };

  const resetFilters = () => {
    setPurpose('ALL');
    setStartDate(daysAgo(29));
    setEndDate(today());
    setConfigId('');
  };
  const hasFilters = purpose !== 'ALL' || configId !== '' || startDate !== daysAgo(29) || endDate !== today();
  const showEmpty = !isLoading && !isError && !rangeError && daily.length === 0;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
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
            onClick={() => refetch()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 shadow-xs transition-all hover:border-[#F26F21] hover:text-[#C2410C]"
          >
            <RotateCcw className="size-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="perf-purpose" className={filterLabel}>Purpose</label>
            <select
              id="perf-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as 'ALL' | AiPurpose)}
              className={selectClass}
            >
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="perf-start" className={filterLabel}>Start date</label>
            <input
              id="perf-start"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className={dateClass}
            />
          </div>
          <div>
            <label htmlFor="perf-end" className={filterLabel}>End date</label>
            <input
              id="perf-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={dateClass}
            />
          </div>
          <div>
            <label htmlFor="perf-config" className={filterLabel}>Configuration</label>
            <select
              id="perf-config"
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              className={selectClass}
            >
              <option value="">All configurations</option>
              {(configsQuery.data?.items ?? []).map((c) => (
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
                onClick={() => applyPreset(r.days)}
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
              onClick={resetFilters}
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

      {isError && !isLoading ? (
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
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
          >
            <RotateCcw className="size-3.5" /> Retry
          </button>
        </div>
      ) : rangeError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/60 px-5 py-10 text-center">
          <p className="text-sm font-bold text-red-700">Invalid date range</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-red-600">
            Swap the dates or pick one of the quick ranges above to see the charts.
          </p>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5"
                >
                  <div className="size-9 shrink-0 animate-pulse rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 w-24 animate-pulse rounded bg-gray-100" />
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}

          {totals.totalFallback > 0 && !isLoading && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                <span className="font-bold">{totals.totalFallback.toLocaleString('en-US')} fallback responses</span>{' '}
                were served because the upstream model failed or ran out of quota.
              </span>
            </div>
          )}

          {/* Charts */}
          <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-extrabold tracking-tight text-gray-900">Daily usage</h2>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {daily.length > 0 ? `${daily.length} days · ${startDate} → ${endDate}` : 'Requests, latency and tokens per day'}
                </p>
              </div>
              {isFetching && !isLoading && (
                <span className="text-[11px] font-bold text-[#9a3412]">Updating…</span>
              )}
            </div>
            <AiPerformanceChart data={rangeError ? [] : daily} isLoading={isLoading} />
          </section>

          {/* Summary table */}
          <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-[13px] font-extrabold tracking-tight text-gray-900">Per-configuration summary</h2>
                <p className="mt-0.5 text-[11px] text-gray-400">Totals within the selected period</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                {isLoading ? '…' : `${data?.summary.length ?? 0} configs`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className={th}>Configuration</th>
                    <th className={th}>Purpose</th>
                    <th className={cn(th, 'text-right')}>Requests</th>
                    <th className={cn(th, 'text-right')}>Success</th>
                    <th className={cn(th, 'text-right')}>Failed</th>
                    <th className={cn(th, 'text-right')}>Fallback</th>
                    <th className={cn(th, 'text-right')}>Avg latency</th>
                    <th className={cn(th, 'text-right')}>Tokens (P / C)</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-3.5 animate-pulse rounded bg-gray-100" style={{ width: `${40 + ((i + j) % 3) * 18}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : showEmpty || (data?.summary.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-14 text-center">
                        <p className="text-sm font-bold text-gray-900">No summary in this period</p>
                        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                          Widen the date range or clear the configuration filter to see per-model totals.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (data?.summary ?? []).map((s) => {
                      const rate = s.totalRequests ? (s.successRequests / s.totalRequests) * 100 : 0;
                      return (
                        <tr key={s.configId} className="border-t border-gray-100 transition-colors last:border-b-0 hover:bg-slate-50/70">
                          <td className="px-4 py-3.5 text-[13px] font-bold text-gray-900">{s.configName}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              {s.purpose}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] font-bold tabular-nums text-gray-900">
                            {s.totalRequests.toLocaleString('en-US')}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-[12px] font-bold text-emerald-700">{rate.toFixed(1)}%</span>
                            <span className="ml-1 font-mono text-[11px] tabular-nums text-gray-400">
                              ({s.successRequests.toLocaleString('en-US')})
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] font-bold tabular-nums text-red-600">
                            {s.failedRequests.toLocaleString('en-US')}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] font-bold tabular-nums text-amber-700">
                            {s.fallbackRequests.toLocaleString('en-US')}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] font-semibold tabular-nums text-gray-500">
                            {Math.round(s.averageLatencyMs).toLocaleString('en-US')} ms
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-[12px] tabular-nums text-gray-500">
                            {s.totalPromptTokens.toLocaleString('en-US')} / {s.totalCompletionTokens.toLocaleString('en-US')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600';

function Kpi({
  label,
  value,
  icon,
  hint,
  tone = 'gray',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
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
