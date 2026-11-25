import type { AiUsageSummary } from '../../../ai/types/ai-config';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';

export function AiPerformanceSummaryTable({
  summary,
  isLoading,
  showEmpty,
}: {
  summary: AiUsageSummary[];
  isLoading: boolean;
  showEmpty: boolean;
}) {
  const columns: StaticColumn<AiUsageSummary>[] = [
    {
      key: 'config',
      header: 'Configuration',
      render: (row) => (
        <span className="text-[13px] font-bold text-gray-900">{row.configName}</span>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (row) => (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          {row.purpose}
        </span>
      ),
    },
    {
      key: 'requests',
      header: 'Requests',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-[12px] font-bold tabular-nums text-gray-900">
          {row.totalRequests.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      key: 'success',
      header: 'Success',
      align: 'right',
      render: (row) => {
        const rate = row.totalRequests ? (row.successRequests / row.totalRequests) * 100 : 0;
        return (
          <>
            <span className="text-[12px] font-bold text-emerald-700">{rate.toFixed(1)}%</span>
            <span className="ml-1 font-mono text-[11px] tabular-nums text-gray-400">
              ({row.successRequests.toLocaleString('en-US')})
            </span>
          </>
        );
      },
    },
    {
      key: 'failed',
      header: 'Failed',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-[12px] font-bold tabular-nums text-red-600">
          {row.failedRequests.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      key: 'fallback',
      header: 'Fallback',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-[12px] font-bold tabular-nums text-amber-700">
          {row.fallbackRequests.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      key: 'latency',
      header: 'Avg latency',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-[12px] font-semibold tabular-nums text-gray-500">
          {Math.round(row.averageLatencyMs).toLocaleString('en-US')} ms
        </span>
      ),
    },
    {
      key: 'tokens',
      header: 'Tokens (P / C)',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-[12px] tabular-nums text-gray-500">
          {row.totalPromptTokens.toLocaleString('en-US')} / {row.totalCompletionTokens.toLocaleString('en-US')}
        </span>
      ),
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-[13px] font-extrabold tracking-tight text-gray-900">
            Per-configuration summary
          </h2>
          <p className="mt-0.5 text-[11px] text-gray-400">Totals within the selected period</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
          {isLoading ? '…' : `${summary.length} configs`}
        </span>
      </div>
      <StaticTable
        columns={columns}
        rows={summary}
        rowKey={(row) => row.configId}
        loading={isLoading}
        minWidth="920px"
        emptyTitle="No summary in this period"
        emptyDescription="Widen the date range or clear the configuration filter to see per-model totals."
      />
    </section>
  );
}
