import { Gauge, SlidersHorizontal, ChartLineUp, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { CourseWorkload, WorkloadLevel } from '../types/course';
import { WorkloadBadge } from './WorkloadBadge';

const BAR_TONE: Record<WorkloadLevel, string> = {
  LIGHT: 'bg-emerald-500',
  MEDIUM: 'bg-amber-500',
  HEAVY: 'bg-rose-500',
};

const SOURCE_DESCRIPTION: Record<CourseWorkload['source'], string> = {
  MANUAL: 'Layer 2 manual override active',
  DATA_ADJUSTED: 'Layer 1 rule-based + Layer 3 historical data',
  RULE_BASED: 'Layer 1 rule-based estimate',
};

const OVERRIDE_CHOICES: { value: WorkloadLevel | 'AUTO'; label: string }[] = [
  { value: 'AUTO', label: 'Auto' },
  { value: 'LIGHT', label: 'Light' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HEAVY', label: 'Heavy' },
];

export function CourseWorkloadCard({
  workload,
  onOverride,
  isSaving = false,
  compact = false,
}: {
  workload?: CourseWorkload | null;
  onOverride?: (level: WorkloadLevel | 'AUTO') => Promise<unknown> | void;
  isSaving?: boolean;
  compact?: boolean;
}) {
  if (!workload) return null;

  const activeOverride: WorkloadLevel | 'AUTO' = workload.manualLevel ?? 'AUTO';
  const stats = workload.stats ?? { sampleSize: 0, failRate: null, avgScore: null, sufficientSample: false, dataAdjustment: 0 };
  const ruleReasons = workload.ruleReasons ?? [];

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <header
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 border-b border-gray-100',
          compact ? 'px-3 py-2' : 'px-4 py-2.5',
        )}
      >
        <div className="flex items-center gap-2">
          <Gauge className="size-4 text-[#F26F21]" />
          <h3 className="text-[13px] font-bold text-gray-900">Course workload &amp; difficulty</h3>
        </div>
        <div className="flex items-center gap-2">
          <WorkloadBadge workload={workload} showSource />
          <span className="font-mono text-xs font-bold tabular-nums text-gray-700">{workload.score}/100</span>
        </div>
      </header>

      <div className={cn('text-xs', compact ? 'space-y-2.5 p-3' : 'space-y-3.5 p-4')}>
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-gray-500">
            <span>{SOURCE_DESCRIPTION[workload.source]}</span>
            <span className="font-mono tabular-nums">Auto score: {workload.ruleScore}/100 ({workload.ruleLevel})</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn('h-full rounded-full transition-all', BAR_TONE[workload.level])}
              style={{ width: `${Math.min(100, Math.max(4, workload.score))}%` }}
            />
          </div>
        </div>

        <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
          <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <Sparkle className="size-3.5 text-[#F26F21]" /> Layer 1 · Rule signals
            </p>
            {ruleReasons.length === 0 ? (
              <p className="text-gray-500">Standard baseline course parameters.</p>
            ) : (
              <ul className="space-y-1 text-gray-700">
                {ruleReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#F26F21]/70" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <ChartLineUp className="size-3.5 text-[#F26F21]" /> Layer 3 · Historical stats
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-gray-200/70">
                <p className="text-[10px] font-medium text-gray-500">Sample</p>
                <p className="font-mono text-xs font-bold tabular-nums text-gray-900">{stats.sampleSize}</p>
              </div>
              <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-gray-200/70">
                <p className="text-[10px] font-medium text-gray-500">Fail rate</p>
                <p className="font-mono text-xs font-bold tabular-nums text-gray-900">
                  {stats.failRate != null ? `${stats.failRate.toFixed(1)}%` : '--'}
                </p>
              </div>
              <div className="rounded-md bg-white px-2 py-1.5 ring-1 ring-gray-200/70">
                <p className="text-[10px] font-medium text-gray-500">Avg score</p>
                <p className="font-mono text-xs font-bold tabular-nums text-gray-900">
                  {stats.avgScore != null ? stats.avgScore.toFixed(2) : '--'}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              {stats.sufficientSample
                ? `Active data adjustment: ${stats.dataAdjustment >= 0 ? '+' : ''}${stats.dataAdjustment} pts`
                : `Needs 30+ graded attempts to adjust score (${stats.sampleSize}/30)`}
            </p>
          </div>
        </div>

        {onOverride && (
          <div
            className={
              'flex flex-wrap items-center justify-between gap-2 rounded-lg ' +
              'border border-orange-200/70 bg-orange-50/40 px-3 py-2.5'
            }
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-700">
              <SlidersHorizontal className="size-3.5 text-[#F26F21]" /> Layer 2 · Manual override
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5" role="group" aria-label="Workload override">
              {OVERRIDE_CHOICES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={activeOverride === opt.value}
                  disabled={isSaving}
                  onClick={() => {
                    if (activeOverride !== opt.value) {
                      onOverride(opt.value);
                    }
                  }}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50',
                    activeOverride === opt.value
                      ? 'bg-[#F26F21] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
