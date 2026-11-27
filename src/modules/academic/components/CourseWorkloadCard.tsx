import { ChartLineUp, Gauge, SlidersHorizontal, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { CourseWorkload, WorkloadLevel } from '../types/course';
import { WorkloadBadge } from './WorkloadBadge';

const BAR_TONE: Record<WorkloadLevel, string> = {
  LIGHT: 'bg-emerald-500',
  MEDIUM: 'bg-amber-500',
  HEAVY: 'bg-red-500',
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
  const stats = workload.stats ?? {
    sampleSize: 0,
    failRate: null,
    avgScore: null,
    sufficientSample: false,
    dataAdjustment: 0,
  };
  const ruleReasons = workload.ruleReasons ?? [];

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white">
      <header
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 border-b border-line-soft',
          compact ? 'px-3 py-2' : 'px-4 py-2.5',
        )}
      >
        <div className="flex items-center gap-2">
          <Gauge className="size-4 text-brand" />
          <h3 className="text-[13px] font-semibold text-ink-primary">Course workload &amp; difficulty</h3>
        </div>
        <div className="flex items-center gap-2">
          <WorkloadBadge workload={workload} showSource />
          <span className="font-mono text-xs font-semibold tabular-nums text-ink-secondary">{workload.score}/100</span>
        </div>
      </header>

      <div className={cn('text-xs', compact ? 'space-y-2.5 p-3' : 'space-y-3.5 p-4')}>
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-ink-muted">
            <span>{SOURCE_DESCRIPTION[workload.source]}</span>
            <span className="font-mono tabular-nums">Auto score: {workload.ruleScore}/100 ({workload.ruleLevel})</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft">
            <div
              className={cn('h-full rounded-full transition-all', BAR_TONE[workload.level])}
              style={{ width: `${Math.min(100, Math.max(4, workload.score))}%` }}
            />
          </div>
        </div>

        <div className={cn('grid gap-3', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
          <div className="rounded-lg border border-line-soft bg-surface-page/70 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
              <Sparkle className="size-3.5 text-brand" /> Layer 1 · Rule signals
            </p>
            {ruleReasons.length === 0 ? (
              <p className="text-ink-muted">Standard baseline course parameters.</p>
            ) : (
              <ul className="space-y-1 text-ink-secondary">
                {ruleReasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-line-soft bg-surface-page/70 p-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
              <ChartLineUp className="size-3.5 text-brand" /> Layer 3 · Historical stats
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-line bg-white px-2 py-1.5">
                <p className="text-[10px] font-medium text-ink-muted">Sample</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-ink-primary">{stats.sampleSize}</p>
              </div>
              <div className="rounded-md border border-line bg-white px-2 py-1.5">
                <p className="text-[10px] font-medium text-ink-muted">Fail rate</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-ink-primary">
                  {stats.failRate != null ? `${stats.failRate.toFixed(1)}%` : '—'}
                </p>
              </div>
              <div className="rounded-md border border-line bg-white px-2 py-1.5">
                <p className="text-[10px] font-medium text-ink-muted">Avg score</p>
                <p className="font-mono text-xs font-semibold tabular-nums text-ink-primary">
                  {stats.avgScore != null ? stats.avgScore.toFixed(2) : '—'}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-ink-muted">
              {stats.sufficientSample
                ? `Active data adjustment: ${stats.dataAdjustment >= 0 ? '+' : ''}${stats.dataAdjustment} pts`
                : `Needs 30+ graded attempts to adjust score (${stats.sampleSize}/30)`}
            </p>
          </div>
        </div>

        {onOverride && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand/20 bg-brand-soft/60 px-3 py-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-secondary">
              <SlidersHorizontal className="size-3.5 text-brand" /> Layer 2 · Manual override
            </span>
            <div className="inline-flex rounded-md border border-line bg-white p-0.5" role="group" aria-label="Workload override">
              {OVERRIDE_CHOICES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={activeOverride === opt.value}
                  disabled={isSaving}
                  onClick={() => {
                    if (activeOverride !== opt.value) onOverride(opt.value);
                  }}
                  className={cn(
                    'rounded-[5px] px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-50',
                    activeOverride === opt.value
                      ? 'bg-brand text-white shadow-2xs'
                      : 'text-ink-muted hover:bg-surface-hover hover:text-ink-primary',
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
