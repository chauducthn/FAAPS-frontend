import { useMemo, useState } from 'react';
import {
  ArrowsClockwise as RefreshCw,
  ChartBar,
  DownloadSimple as Download,
  Table,
  Warning as AlertTriangle,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useAiConfigsQuery, useAiPerformanceQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import type { AiPerformanceFilterParams, AiPurpose } from '../../ai/types/ai-config';
import { AdminTabBar } from '../components/AdminTabBar';
import AiPerformanceChart from '../components/ai-config/AiPerformanceChart';
import { AiPerformanceFilters } from './ai/AiPerformanceFilters';
import {
  AiPerformanceErrorState,
  AiPerformanceKpiStrip,
  AiPerformanceSummaryTable,
} from './ai/AiPerformancePanels';
import {
  computePerformanceTotals,
  daysAgo,
  exportPerformanceCsv,
  today,
} from './ai/aiPerformanceUtils';

type PerfViewTab = 'charts' | 'summary';

export default function AiPerformancePage() {
  const [viewTab, setViewTab] = useState<PerfViewTab>('charts');
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

  const rangeError =
    startDate && endDate && startDate > endDate ? 'Start date must not be after end date.' : null;

  const { data, isLoading, isFetching, isError, refetch } = useAiPerformanceQuery(params, !rangeError);

  const totals = useMemo(() => computePerformanceTotals(data), [data]);
  const daily = data?.byDay ?? [];
  const summary = data?.summary ?? [];
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

  const handleExport = () => {
    if (rangeError) {
      toast.error(rangeError);
      return;
    }
    exportPerformanceCsv({
      data,
      configs: configsQuery.data?.items ?? [],
      configId,
      purpose,
      startDate,
      endDate,
      totals,
    });
    toast.success('Performance data exported.');
  };

  return (
    <div className="w-full space-y-4">
      <AdminTabBar<PerfViewTab>
        ariaLabel="AI performance views"
        activeKey={viewTab}
        onChange={setViewTab}
        tabs={[
          { key: 'charts', label: 'Daily charts', icon: ChartBar },
          { key: 'summary', label: 'Per-config summary', icon: Table, count: summary.length },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover disabled:opacity-60"
            >
              <RefreshCw className={cn('size-3.5', isFetching && !isLoading && 'animate-spin')} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isLoading || !!rangeError}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-55"
            >
              <Download className="size-4" /> Export CSV
            </button>
          </div>
        }
      />

      <AiPerformanceKpiStrip isLoading={isLoading} totals={totals} peak={peak} />

      <section className="overflow-hidden rounded-lg border border-line/80 bg-white shadow-2xs">
        <AiPerformanceFilters
          purpose={purpose}
          startDate={startDate}
          endDate={endDate}
          configId={configId}
          configs={configsQuery.data?.items ?? []}
          hasFilters={hasFilters}
          rangeError={rangeError}
          onPurposeChange={setPurpose}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onConfigChange={setConfigId}
          onApplyPreset={applyPreset}
          onReset={resetFilters}
        />

        {totals.totalFallback > 0 && !isLoading && !isError && !rangeError && (
          <div className="flex shrink-0 items-center gap-2 border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            <AlertTriangle className="size-4 shrink-0" weight="fill" />
            <span>
              <strong className="font-semibold">{totals.totalFallback.toLocaleString('en-US')} fallback responses</strong>{' '}
              served because the upstream model failed or reached quota.
            </span>
          </div>
        )}

        <div className="admin-fill">
          {isError && !isLoading ? (
            <AiPerformanceErrorState onRetry={() => refetch()} />
          ) : rangeError ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <p className="text-sm font-semibold text-red-700">Invalid date range</p>
              <p className="mt-1 max-w-sm text-xs text-ink-muted">
                Swap the dates or pick one of the quick ranges above to view metrics.
              </p>
            </div>
          ) : viewTab === 'charts' ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
              <AiPerformanceChart data={daily} isLoading={isLoading} />
            </div>
          ) : (
            <AiPerformanceSummaryTable summary={summary} isLoading={isLoading} />
          )}
        </div>
      </section>
    </div>
  );
}
