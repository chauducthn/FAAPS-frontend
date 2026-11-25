import type { AiUsageSummary } from '../../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';

const th = 'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600';

export function AiPerformanceSummaryTable({
  summary,
  isLoading,
  showEmpty,
}: {
  summary: AiUsageSummary[];
  isLoading: boolean;
  showEmpty: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-[13px] font-extrabold tracking-tight text-gray-900">Per-configuration summary</h2>
          <p className="mt-0.5 text-[11px] text-gray-400">Totals within the selected period</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
          {isLoading ? '…' : `${summary.length} configs`}
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
            ) : showEmpty || summary.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-14 text-center">
                  <p className="text-sm font-bold text-gray-900">No summary in this period</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                    Widen the date range or clear the configuration filter to see per-model totals.
                  </p>
                </td>
              </tr>
            ) : (
              summary.map((s) => {
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
  );
}
