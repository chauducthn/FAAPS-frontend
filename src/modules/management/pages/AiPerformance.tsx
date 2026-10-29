// src/pages/management/AiPerformance.tsx
import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Clock, Gauge, TrendingUp, Zap } from 'lucide-react';
import { useAiPerformanceQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import { useAiConfigsQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import { AiPerformanceChart } from '../components/ai-config';

import type { AiPerformanceFilterParams, AiPurpose } from '../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';

const PURPOSES: { value: 'ALL' | AiPurpose; label: string }[] = [
  { value: 'ALL', label: 'All purposes' },
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

export default function AiPerformancePage() {
  const [purpose, setPurpose] = useState<'ALL' | AiPurpose>('ALL');
  const [startDate, setStartDate] = useState(daysAgo(29));
  const [endDate, setEndDate] = useState(today());
  const [configId, setConfigId] = useState('');

  const configsQuery = useAiConfigsQuery();

  const params: AiPerformanceFilterParams = {
    purpose: purpose === 'ALL' ? undefined : purpose,
    configId: configId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading, isError, refetch } = useAiPerformanceQuery(params);

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
    return {
      totalRequests,
      totalFailed,
      totalFallback,
      weightedLatency: Math.round(weightedLatency),
      promptTokens,
      completionTokens,
      successRate: totalRequests ? ((totalRequests - totalFailed) / totalRequests) * 100 : 0,
    };
  }, [data]);

  const daily = data?.byDay ?? [];
  const peak = useMemo(
    () => daily.reduce<{ date: string; requests: number } | null>(
      (max, d) => (!max || d.requests > max.requests ? { date: d.date, requests: d.requests } : max),
      null,
    ),
    [daily],
  );

  const applyPreset = (days: number) => {
    setStartDate(daysAgo(days - 1));
    setEndDate(today());
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#555f6f]">AI / Performance</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">AI Performance</h1>
          <p className="mt-2 text-sm text-[#555f6f]">
            Usage, success rate, and token consumption for each AI configuration.
          </p>
        </div>

      </div>



      {/* Bộ lọc */}
      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="perf-purpose" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              Purpose
            </label>
            <select
              id="perf-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as 'ALL' | AiPurpose)}
              className="h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="perf-start" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              Start date
            </label>
            <input
              id="perf-start"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="perf-end" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              End date
            </label>
            <input
              id="perf-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="perf-config" className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              Configuration
            </label>
            <select
              id="perf-config"
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              className="h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All configurations</option>
              {(configsQuery.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#555f6f]">Quick range:</span>
          {[
            { days: 7, label: '7 days' },
            { days: 30, label: '30 days' },
            { days: 90, label: '90 days' },
          ].map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => applyPreset(r.days)}
              className="rounded-lg border border-[#e5e7eb] px-2.5 py-1 text-xs font-semibold text-[#555f6f] hover:bg-[#f7f8fa]"
            >
              {r.label}
            </button>
          ))}
        </div>

        {rangeError && <p className="mt-3 text-sm font-medium text-red-600">{rangeError}</p>}
      </section>

      {isError && !data ? (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load performance data.
          <button type="button" onClick={() => refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total requests"
              value={totals.totalRequests.toLocaleString('en-US')}
              icon={Activity}
              tone="orange"
              hint={peak ? `Peak ${peak.requests.toLocaleString('en-US')} on ${peak.date}` : undefined}
            />
            <KpiCard
              label="Success rate"
              value={`${totals.successRate.toFixed(1)}%`}
              icon={TrendingUp}
              tone="emerald"
              hint={`${totals.totalFailed.toLocaleString('en-US')} failed requests`}
            />
            <KpiCard
              label="Average latency"
              value={`${totals.weightedLatency.toLocaleString('en-US')} ms`}
              icon={Clock}
              tone="blue"
              hint="Weighted by request volume"
            />
            <KpiCard
              label="Tokens consumed"
              value={(totals.promptTokens + totals.completionTokens).toLocaleString('en-US')}
              icon={Zap}
              tone="violet"
              hint={`${totals.promptTokens.toLocaleString('en-US')} prompt · ${totals.completionTokens.toLocaleString('en-US')} completion`}
            />
          </div>

          {totals.totalFallback > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                <span className="font-semibold">{totals.totalFallback.toLocaleString('en-US')} fallback responses</span> were
                served because the upstream model failed or ran out of quota.
              </span>
            </div>
          )}

          {/* Biểu đồ */}
          <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#151c27]">Daily usage</h2>
              {isLoading && <span className="text-xs text-[#98a2b3]">Loading...</span>}
            </div>
            <AiPerformanceChart data={daily} />
          </section>

          {/* Bảng tổng hợp */}
          <section className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e7eefe] px-5 py-4">
              <h2 className="text-base font-semibold text-[#151c27]">Per-configuration summary</h2>
              <span className="text-xs text-[#555f6f]">{data?.summary.length ?? 0} configurations</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[rgba(240,243,255,0.7)]">
                  <tr>
                    <th className={th}>Configuration</th>
                    <th className={th}>Purpose</th>
                    <th className={`${th} text-right`}>Requests</th>
                    <th className={`${th} text-right`}>Success</th>
                    <th className={`${th} text-right`}>Failed</th>
                    <th className={`${th} text-right`}>Fallback</th>
                    <th className={`${th} text-right`}>Avg latency</th>
                    <th className={`${th} text-right`}>Tokens (P / C)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.summary.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                        No summary data in the selected period.
                      </td>
                    </tr>
                  ) : (
                    data!.summary.map((s) => {
                      const rate = s.totalRequests ? (s.successRequests / s.totalRequests) * 100 : 0;
                      return (
                        <tr key={s.configId} className="border-t border-[#f1f5f9] hover:bg-[#f7f8fa]">
                          <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{s.configName}</td>
                          <td className="px-3 py-4">
                            <span className="rounded bg-[#f7f8fa] px-2 py-0.5 text-[11px] font-bold uppercase text-[#555f6f]">
                              {s.purpose}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right text-[13px] font-semibold text-[#151c27]">
                            {s.totalRequests.toLocaleString('en-US')}
                          </td>
                          <td className="px-3 py-4 text-right">
                            <span className="text-[13px] font-semibold text-[#047857]">
                              {rate.toFixed(1)}%
                            </span>
                            <span className="ml-1 text-[11px] text-[#98a2b3]">
                              ({s.successRequests.toLocaleString('en-US')})
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right text-[13px] font-semibold text-[#b91c1c]">
                            {s.failedRequests.toLocaleString('en-US')}
                          </td>
                          <td className="px-3 py-4 text-right text-[13px] font-semibold text-amber-700">
                            {s.fallbackRequests.toLocaleString('en-US')}
                          </td>
                          <td className="px-3 py-4 text-right text-[13px] font-medium text-[#555f6f]">
                            {Math.round(s.averageLatencyMs).toLocaleString('en-US')} ms
                          </td>
                          <td className="px-3 py-4 text-right text-[13px] text-[#555f6f]">
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

const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
  tone: 'orange' | 'emerald' | 'blue' | 'violet';
  hint?: string;
}) {
  const tones = {
    orange: 'bg-[#fff7ed] text-[#f37021]',
    emerald: 'bg-[#ecfdf5] text-[#047857]',
    blue: 'bg-[#eff6ff] text-[#2563eb]',
    violet: 'bg-[#f5f3ff] text-[#7c3aed]',
  };
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cn('flex size-10 items-center justify-center rounded-full', tones[tone])}>
          <Icon className="size-5" />
        </span>
        <p className="text-[13px] font-medium text-[#555f6f]">{label}</p>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-9 text-[#151c27]">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-[#98a2b3]">{hint}</p>}
    </div>
  );
}
