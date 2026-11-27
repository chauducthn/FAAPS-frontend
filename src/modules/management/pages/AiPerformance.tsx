import { useMemo, useState } from 'react';
import { Warning as AlertTriangle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useAiConfigsQuery, useAiPerformanceQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import AiPerformanceChart from '../components/ai-config/AiPerformanceChart';
import type { AiPerformanceFilterParams, AiPurpose } from '../../ai/types/ai-config';
import {
  computePerformanceTotals,
  daysAgo,
  exportPerformanceCsv,
  today,
} from './ai/aiPerformanceUtils';
import { AiPerformanceFilters } from './ai/AiPerformanceFilters';
import {
  AiPerformanceErrorState,
  AiPerformanceKpiStrip,
  AiPerformanceSummaryTable,
} from './ai/AiPerformancePanels';

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

  const rangeError =
    startDate && endDate && startDate > endDate ? 'Start date must not be after end date.' : null;

  const { data, isLoading, isFetching, isError, refetch } = useAiPerformanceQuery(params, !rangeError);

  const totals = useMemo(() => computePerformanceTotals(data), [data]);
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
      <AiPerformanceFilters
        purpose={purpose}
        startDate={startDate}
        endDate={endDate}
        configId={configId}
        configs={configsQuery.data?.items ?? []}
        hasFilters={hasFilters}
        rangeError={rangeError}
        isFetching={isFetching}
        isLoading={isLoading}
        onPurposeChange={setPurpose}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onConfigChange={setConfigId}
        onApplyPreset={applyPreset}
        onReset={resetFilters}
        onRefresh={() => refetch()}
        onExport={handleExport}
      />

      {isError && !isLoading ? (
        <AiPerformanceErrorState onRetry={() => refetch()} />
      ) : rangeError ? (
        <div className="rounded-lg border border-red-200 bg-red-50/60 px-5 py-10 text-center">
          <p className="text-sm font-bold text-red-700">Invalid date range</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-red-600">
            Swap the dates or pick one of the quick ranges above to see the charts.
          </p>
        </div>
      ) : (
        <>
          <AiPerformanceKpiStrip isLoading={isLoading} totals={totals} peak={peak} />

          {totals.totalFallback > 0 && !isLoading && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              <AlertTriangle className="size-4 shrink-0" />
              <span>
                <span className="font-bold">{totals.totalFallback.toLocaleString('en-US')} fallback responses</span>{' '}
                were served because the upstream model failed or ran out of quota.
              </span>
            </div>
          )}

          <section className="rounded-lg border border-line/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[13px] font-extrabold tracking-tight text-ink-primary">Daily usage</h2>
                <p className="mt-0.5 text-[11px] text-ink-subtle">
                  {daily.length > 0 ? `${daily.length} days · ${startDate} → ${endDate}` : 'Requests, latency and tokens per day'}
                </p>
              </div>
              {isFetching && !isLoading && (
                <span className="text-[11px] font-bold text-brand-ink">Updating…</span>
              )}
            </div>
            <AiPerformanceChart data={rangeError ? [] : daily} isLoading={isLoading} />
          </section>

          <AiPerformanceSummaryTable
            summary={data?.summary ?? []}
            isLoading={isLoading}
            showEmpty={showEmpty}
          />
        </>
      )}
    </div>
  );
}
