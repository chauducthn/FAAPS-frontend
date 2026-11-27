import { ChartBar } from '@phosphor-icons/react';
import type { AiUsageSummary } from '../../../ai/types/ai-config';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';

export function AiPerformanceSummaryTable({
  summary,
  isLoading,
}: {
  summary: AiUsageSummary[];
  isLoading: boolean;
}) {
  const columns: StaticColumn<AiUsageSummary>[] = [
    {
      key: 'config',
      header: 'Configuration',
      render: (row) => (
        <span className="text-[13px] font-semibold text-ink-primary">{row.configName}</span>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (row) => (
        <span className="rounded-sm bg-line-soft px-1.5 py-0.5 text-[11px] font-semibold uppercase text-ink-muted">
          {row.purpose}
        </span>
      ),
    },
    {
      key: 'requests',
      header: 'Requests',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-ink-primary">
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
            <span className="text-xs font-semibold tabular-nums text-emerald-700">{rate.toFixed(1)}%</span>
            <span className="ml-1 font-mono text-[11px] tabular-nums text-ink-subtle">
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
        <span className="font-mono text-xs font-semibold tabular-nums text-red-600">
          {row.failedRequests.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      key: 'fallback',
      header: 'Fallback',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold tabular-nums text-amber-700">
          {row.fallbackRequests.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      key: 'latency',
      header: 'Avg latency',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-medium tabular-nums text-ink-secondary">
          {Math.round(row.averageLatencyMs).toLocaleString('en-US')} ms
        </span>
      ),
    },
    {
      key: 'tokens',
      header: 'Tokens (P / C)',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs tabular-nums text-ink-muted">
          {row.totalPromptTokens.toLocaleString('en-US')} / {row.totalCompletionTokens.toLocaleString('en-US')}
        </span>
      ),
    },
  ];

  if (!isLoading && summary.length === 0) {
    return (
      <EmptyState
        className="min-h-0 flex-1 justify-center"
        icon={<ChartBar aria-hidden />}
        title="No summary in this period"
        description="Widen the date range or clear the configuration filter to see per-model totals."
      />
    );
  }

  return (
    <StaticTable
      columns={columns}
      rows={summary}
      rowKey={(row) => row.configId}
      loading={isLoading}
      stickyHeader
      minWidth="860px"
      className="min-h-0 flex-1 overflow-y-auto"
      emptyTitle="No summary in this period"
      emptyDescription="Widen the date range or clear the configuration filter to see per-model totals."
    />
  );
}
