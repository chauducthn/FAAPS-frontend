import { CaretDown as ChevronDown, MagicWand as WandSparkles } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { ModalBody } from '../../../shared/components/ui/ModalParts';
import type { SummaryCohort } from '../types/admin';
import { ADMIN_TAB_LIST_CLASS, adminTabClass } from './AdminTabBar';
import { userFieldClass } from './createUserSchema';
import { UserFormField } from './UserFormPrimitives';

export function CohortAssignModalBody({
  isBulk,
  bulkCount,
  mode,
  idleCount,
  alreadyAssignedCount,
  cohortsNeedingPool,
  majorCode,
  cohortId,
  fixedCohortId,
  majors,
  cohortOptions,
  error,
  onModeChange,
  onMajorChange,
  onCohortChange,
}: {
  isBulk: boolean;
  bulkCount: number;
  mode: 'manual' | 'auto';
  idleCount: number;
  alreadyAssignedCount: number;
  cohortsNeedingPool: number;
  majorCode: string;
  cohortId: string;
  fixedCohortId?: string;
  majors: string[];
  cohortOptions: SummaryCohort[];
  error: string | null;
  onModeChange: (next: 'manual' | 'auto') => void;
  onMajorChange: (next: string) => void;
  onCohortChange: (next: string) => void;
}) {
  return (
    <ModalBody className="flex flex-col gap-4">
      {isBulk && (
        <div role="tablist" aria-label="Assignment mode" className={cn(ADMIN_TAB_LIST_CLASS, 'grid w-full grid-cols-2')}>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'manual'}
            onClick={() => onModeChange('manual')}
            className={cn(adminTabClass(mode === 'manual'), 'justify-center')}
          >
            Manual
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'auto'}
            onClick={() => onModeChange('auto')}
            className={cn(adminTabClass(mode === 'auto'), 'justify-center')}
          >
            <WandSparkles className="size-4" aria-hidden /> Auto-distribute
          </button>
        </div>
      )}

      {isBulk && mode === 'auto' ? (
        <div className="divide-y divide-line-soft overflow-hidden rounded-lg bg-surface-page ring-1 ring-inset ring-line-soft">
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Ready advisors
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-ink-primary">
              {idleCount} idle{alreadyAssignedCount > 0 ? ` · ${alreadyAssignedCount} skipped` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Cohorts needing pool
            </span>
            <span className="text-[13px] font-semibold tabular-nums text-brand-ink">
              {cohortsNeedingPool} cohort{cohortsNeedingPool === 1 ? '' : 's'}
            </span>
          </div>
          <p className="px-3.5 py-2.5 text-xs leading-relaxed text-ink-muted">
            Distributes idle advisors to cohorts with unassigned students. Already-assigned advisors are left untouched.
          </p>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg bg-surface-page p-4 ring-1 ring-inset ring-line-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <UserFormField label="Major">
              <div className="relative">
                <select
                  value={majorCode}
                  disabled={!!fixedCohortId}
                  aria-label="Major"
                  onChange={(e) => onMajorChange(e.target.value)}
                  className={cn(userFieldClass(false), 'appearance-none pr-9')}
                >
                  <option value="">Choose a major…</option>
                  {majors.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
              </div>
            </UserFormField>
            <UserFormField label="Cohort">
              <div className="relative">
                <select
                  value={cohortId}
                  disabled={!!fixedCohortId || !majorCode}
                  aria-label="Cohort"
                  onChange={(e) => onCohortChange(e.target.value)}
                  className={cn(userFieldClass(false), 'appearance-none pr-9')}
                >
                  <option value="">{majorCode ? 'Choose a cohort…' : 'Select a major first…'}</option>
                  {cohortOptions.map((c) => (
                    <option key={c.cohortId} value={c.cohortId}>{c.cohort} ({c.total} students)</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
              </div>
            </UserFormField>
          </div>
          {isBulk && (
            <p className="text-xs text-ink-muted">
              Replaces any previous cohort for all {bulkCount} selected advisor{bulkCount === 1 ? '' : 's'}.
            </p>
          )}
        </div>
      )}

      {error && (
        <InlineAlert tone="error" role="alert">
          {error}
        </InlineAlert>
      )}
    </ModalBody>
  );
}
