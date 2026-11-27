import {
  CheckCircle as CheckCircle2,
  MagicWand as WandSparkles,
  Sparkle as Sparkles,
  SpinnerGap as Loader2,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { SmartBatchAssignResult } from '../types/admin';
export { CohortPickerFilters, type PoolFilter } from './CohortPickerFilters';

interface Props {
  waitingCount: number;
  unassignedTotal: number;
  readyCount: number;
  idleAdvisorCount: number;
  filteredCount: number;
  allowOverLimit: boolean;
  isPending: boolean;
  result: SmartBatchAssignResult | null;
  error: string | null;
  onToggleOverLimit: (next: boolean) => void;
  onRunSmartSetupAndAssign: () => void;
  onRunReadyOnly: () => void;
}

function MiniStat({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="px-3.5 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">{label}</p>
      <p className={cn('mt-0.5 text-base font-semibold leading-tight tabular-nums text-ink-primary', valueClass)}>
        {value}
      </p>
    </div>
  );
}

export function CohortPickerSmartBar({
  waitingCount,
  unassignedTotal,
  readyCount,
  idleAdvisorCount,
  filteredCount,
  allowOverLimit,
  isPending,
  result,
  error,
  onToggleOverLimit,
  onRunSmartSetupAndAssign,
  onRunReadyOnly,
}: Props) {
  const missingPoolCount = Math.max(0, waitingCount - readyCount);
  const scopeLabel = filteredCount < waitingCount ? `filtered (${filteredCount})` : `all (${waitingCount})`;
  const primaryDisabled = isPending || filteredCount === 0 || (idleAdvisorCount === 0 && readyCount === 0);

  return (
    <div className="shrink-0 space-y-2">
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="grid grid-cols-2 divide-y divide-line border-b border-line sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <MiniStat label="Unassigned" value={unassignedTotal.toLocaleString()} />
          <MiniStat label="Ready" value={readyCount} valueClass="text-emerald-700" />
          <MiniStat label="Missing pool" value={missingPoolCount} valueClass="text-amber-700" />
          <MiniStat label="Idle advisors" value={idleAdvisorCount} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-surface-page/70 px-3.5 py-2">
          <button
            type="button"
            role="switch"
            aria-checked={allowOverLimit}
            title="Allow exceeding max advisees"
            onClick={() => onToggleOverLimit(!allowOverLimit)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 text-xs font-medium',
              'text-ink-secondary transition-colors hover:text-ink-primary',
            )}
          >
            <span
              className={cn(
                'relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors',
                allowOverLimit ? 'bg-brand' : 'bg-line',
              )}
            >
              <span
                className={cn(
                  'inline-block size-3.5 rounded-full bg-primary-foreground shadow-2xs transition-transform',
                  allowOverLimit ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </span>
            <span>Allow over-limit</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {readyCount > 0 && missingPoolCount > 0 && (
              <button
                type="button"
                disabled={isPending}
                onClick={onRunReadyOnly}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5',
                  'text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-45',
                )}
              >
                <WandSparkles className="size-3.5 text-brand" />
                Ready only ({readyCount})
              </button>
            )}
            <button
              type="button"
              disabled={primaryDisabled}
              onClick={onRunSmartSetupAndAssign}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold',
                'text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-45',
              )}
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {idleAdvisorCount > 0 && missingPoolCount > 0
                ? `Auto-setup pools & assign ${scopeLabel}`
                : `Smart auto-assign ${scopeLabel}`}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" weight="fill" />
          <span>
            Assigned <strong>{result.assigned.toLocaleString()}</strong> students across{' '}
            <strong>{result.cohortsProcessed}</strong> cohorts
            {result.poolsConfigured > 0 && (
              <> · auto-configured <strong>{result.poolsConfigured}</strong> pools ({result.advisorsAddedToPools} advisors)</>
            )}
            {result.atRiskAssigned > 0 && (
              <> · balanced <strong>{result.atRiskAssigned}</strong> At-Risk</>
            )}
            {result.unassignedRemaining > 0 && (
              <> · <strong className="text-amber-800">{result.unassignedRemaining.toLocaleString()}</strong> left (capacity/pool limit)</>
            )}
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
