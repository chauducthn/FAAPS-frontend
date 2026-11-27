import { Link } from 'react-router';
import { CaretLeft as ChevronLeft, SlidersHorizontal as Settings2, Sparkle as Sparkles } from '@phosphor-icons/react';
import type { SummaryCohort } from '../../types/admin';

export function CohortDetailsHeader({
  title,
  cohort,
  onOpenPool,
  onOpenAssign,
  onOpenAuto,
}: {
  title: string;
  cohort: SummaryCohort | null;
  onOpenPool: () => void;
  onOpenAssign: () => void;
  onOpenAuto: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <Link to="/admin/assignments" className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-brand">
          <ChevronLeft className="size-3.5" /> Back to Advisor Assignments
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-lg font-bold tracking-tight text-ink-primary">Cohort {title}</h1>
          <span className="rounded-md bg-line-soft px-2 py-0.5 text-xs font-medium text-ink-secondary tabular-nums">
            Total {cohort?.total ?? '–'}
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 tabular-nums">
            Assigned {cohort?.assigned ?? '–'}
          </span>
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 tabular-nums">
            Unassigned {cohort?.unassigned ?? '–'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenPool}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover"
        >
          <Settings2 className="size-3.5" /> Configure advisors
        </button>
        {(cohort?.unassigned ?? 0) > 0 && (
          <>
            <button
              type="button"
              onClick={onOpenAssign}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover"
            >
              Assign advisor
            </button>
            <button
              type="button"
              onClick={onOpenAuto}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover"
            >
              <Sparkles className="size-3.5" /> Auto Assign
            </button>
          </>
        )}
      </div>
    </div>
  );
}
