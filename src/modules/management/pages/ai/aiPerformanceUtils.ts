import type { AiConfig, AiPerformanceResult, AiPurpose } from '../../../ai/types/ai-config';
import { buildCsv, csvFilename, downloadCsv } from '@/shared/lib/csv';

export const PURPOSES: { value: 'ALL' | AiPurpose; label: string }[] = [
  { value: 'ALL', label: 'Purpose: All' },
  { value: 'CHAT', label: 'Chat' },
  { value: 'EMBEDDING', label: 'Embedding' },
  { value: 'OCR', label: 'OCR' },
];

export const today = () => new Date().toISOString().slice(0, 10);

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export interface PerformanceTotals {
  totalRequests: number;
  totalFailed: number;
  totalFallback: number;
  weightedLatency: number;
  promptTokens: number;
  completionTokens: number;
  errorRate: number;
  successRate: number;
}

export function computePerformanceTotals(data?: AiPerformanceResult): PerformanceTotals {
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
}

export function exportPerformanceCsv(args: {
  data?: AiPerformanceResult;
  configs: AiConfig[];
  configId: string;
  purpose: 'ALL' | AiPurpose;
  startDate: string;
  endDate: string;
  totals: PerformanceTotals;
}) {
  const { data, configs, configId, purpose, startDate, endDate, totals } = args;
  const summary = data?.summary ?? [];
  const daily = data?.byDay ?? [];
  const configName = configId
    ? configs.find((c) => c.id === configId)?.name ?? configId
    : 'All configurations';

  const csv = buildCsv([
    {
      title: 'Filters',
      rows: [
        ['Field', 'Value'],
        ['Configuration', configName],
        ['Purpose', purpose === 'ALL' ? 'All' : purpose],
        ['Start date', startDate],
        ['End date', endDate],
      ],
    },
    {
      title: 'Totals',
      rows: [
        ['Metric', 'Value'],
        ['Total requests', totals.totalRequests],
        ['Success requests', totals.totalRequests - totals.totalFailed],
        ['Failed requests', totals.totalFailed],
        ['Fallback requests', totals.totalFallback],
        ['Avg latency (ms)', totals.weightedLatency],
        ['Error rate (%)', totals.errorRate.toFixed(2)],
        ['Success rate (%)', totals.successRate.toFixed(1)],
        ['Prompt tokens', totals.promptTokens],
        ['Completion tokens', totals.completionTokens],
      ],
    },
    {
      title: 'Daily usage',
      rows: [
        ['Date', 'Requests', 'Failed', 'Avg latency (ms)', 'Prompt tokens', 'Completion tokens'],
        ...daily.map((d) => [
          d.date,
          d.requests,
          d.failed,
          Math.round(d.averageLatencyMs),
          d.promptTokens,
          d.completionTokens,
        ]),
      ],
    },
    {
      title: 'Per-configuration summary',
      rows: [
        [
          'Configuration',
          'Purpose',
          'Requests',
          'Success',
          'Failed',
          'Fallback',
          'Avg latency (ms)',
          'Prompt tokens',
          'Completion tokens',
        ],
        ...summary.map((s) => [
          s.configName,
          s.purpose,
          s.totalRequests,
          s.successRequests,
          s.failedRequests,
          s.fallbackRequests,
          Math.round(s.averageLatencyMs),
          s.totalPromptTokens,
          s.totalCompletionTokens,
        ]),
      ],
    },
  ]);

  downloadCsv(csv, csvFilename('ai-performance'));
}
