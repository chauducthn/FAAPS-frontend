import { useState } from 'react';
import { SpinnerGap as Loader2, Plus, Sparkle as Sparkles } from '@phosphor-icons/react';
import type { AssignmentAdvisor, CohortPoolAdvisor, SummaryCohort } from '../types/admin';

interface Props {
  cohort: SummaryCohort;
  pool: CohortPoolAdvisor[];
  selected: Set<string>;
  loadById: Map<string, number>;
  idleAdvisors: AssignmentAdvisor[];
  allowOverLimit: boolean;
  addingPool: boolean;
  onToggle: (id: string) => void;
  onToggleOverLimit: (next: boolean) => void;
  onQuickAdd: (advisorIds: string[]) => Promise<void>;
  onConfigurePool?: () => void;
}

export function AutoAssignAdvisorPanel({
  cohort,
  pool,
  selected,
  loadById,
  idleAdvisors,
  allowOverLimit,
  addingPool,
  onToggle,
  onToggleOverLimit,
  onQuickAdd,
  onConfigurePool,
}: Props) {
  const [pickedIdle, setPickedIdle] = useState<Set<string>>(new Set());

  const selectedPool = pool.filter((a) => selected.has(a.advisorId));
  const hasUnlimited = selectedPool.some((a) => a.maxAdvisees == null);
  const freeSlots = selectedPool.reduce((sum, a) => {
    if (a.maxAdvisees == null) return sum;
    const current = loadById.get(a.advisorId) ?? a.cohortStudents;
    return sum + Math.max(0, a.maxAdvisees - current);
  }, 0);
  const shortage = hasUnlimited ? 0 : Math.max(0, cohort.unassigned - freeSlots);
  const showQuickAdd = idleAdvisors.length > 0 && (pool.length === 0 || shortage > 0);

  const toggleIdle = (id: string) =>
    setPickedIdle((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAddIdle = async () => {
    if (pickedIdle.size === 0) return;
    await onQuickAdd([...pickedIdle]);
    setPickedIdle(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand/25 bg-brand-soft/70 px-3.5 py-2.5 text-xs">
        <div>
          <p className="font-semibold text-brand-ink">Capacity-ratio &amp; At-Risk balanced distribution</p>
          <p className="mt-0.5 text-ink-muted">
            Unassigned: <strong className="text-ink-primary">{cohort.unassigned}</strong> · Selected free slots:{' '}
            <strong className={shortage > 0 ? 'text-amber-700' : 'text-emerald-700'}>
              {hasUnlimited ? 'Unlimited' : freeSlots}
            </strong>
            {shortage > 0 && <span className="text-amber-700"> ({shortage} short)</span>}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-secondary">
          <input
            type="checkbox"
            checked={allowOverLimit}
            onChange={(e) => onToggleOverLimit(e.target.checked)}
            className="size-4 accent-brand"
          />
          Allow exceeding max advisees
        </label>
      </div>

      {pool.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line px-4 py-3 text-xs text-ink-muted">
          No advisors are in the pool for {cohort.majorCode} {cohort.cohort} yet.
          {idleAdvisors.length > 0 ? ' Pick available advisors below to add them directly.' : ' '}
          {onConfigurePool && (
            <button type="button" onClick={onConfigurePool} className="ml-1 font-semibold text-brand hover:underline">
              Open full pool settings
            </button>
          )}
        </div>
      ) : (
        <fieldset>
          <legend className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
            Cohort advisor pool ({selectedPool.length}/{pool.length} selected)
          </legend>
          <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border border-line/80 p-1.5">
            {pool.map((a) => {
              const load = loadById.get(a.advisorId) ?? a.cohortStudents;
              const free = a.maxAdvisees == null ? null : Math.max(0, a.maxAdvisees - load);
              return (
                <li key={a.advisorId}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 hover:bg-surface-hover">
                    <input
                      type="checkbox"
                      checked={selected.has(a.advisorId)}
                      onChange={() => onToggle(a.advisorId)}
                      className="size-4 accent-brand"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink-primary">
                      {a.fullName} <span className="font-normal text-ink-muted">· {a.email}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                      {load}/{a.maxAdvisees ?? '∞'}
                    </span>
                    {free !== null && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                          free > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {free > 0 ? `+${free} free` : 'Full'}
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}

      {showQuickAdd && (
        <div className="rounded-lg border border-line/80 bg-line-soft/40 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
              <Sparkles className="size-3.5 text-ink-secondary" />
              Available unassigned advisors ({idleAdvisors.length})
            </span>
            <button
              type="button"
              disabled={pickedIdle.size === 0 || addingPool}
              onClick={() => void handleAddIdle()}
              className="inline-flex h-7 items-center gap-1 rounded-md bg-brand px-2.5 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-45"
            >
              {addingPool ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              Add {pickedIdle.size > 0 ? `(${pickedIdle.size}) ` : ''}to pool
            </button>
          </div>
          <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto">
            {idleAdvisors.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md bg-white/80 px-2.5 py-1.5 text-xs hover:bg-white">
                  <input
                    type="checkbox"
                    checked={pickedIdle.has(a.id)}
                    onChange={() => toggleIdle(a.id)}
                    className="size-3.5 accent-indigo-600"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-ink-primary">{a.fullName}</span>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    {a.activeStudents}/{a.maxAdvisees ?? '∞'}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
