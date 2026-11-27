import { SlidersHorizontal as Settings2, MagicWand as WandSparkles } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { StaticColumn } from '../../../shared/components/common/table/StaticTable';
import type { SummaryCohort } from '../types/admin';

const HEAD_CLS = 'px-3 py-2.5';
const CELL_CLS = 'px-3 py-2';

export function buildCohortPickerColumns({
  poolCountByCohort,
  onPick,
  onConfigurePool,
}: {
  poolCountByCohort?: Map<string, number>;
  onPick: (cohort: SummaryCohort) => void;
  onConfigurePool?: (cohort: SummaryCohort) => void;
}): StaticColumn<SummaryCohort>[] {
  return [
    {
      key: 'major',
      header: 'Major',
      headerClassName: cn(HEAD_CLS, 'w-[76px]'),
      cellClassName: CELL_CLS,
      render: (c) => (
        <span className="inline-flex rounded-sm bg-line-soft px-1.5 py-0.5 font-mono text-xs font-semibold text-ink-primary">
          {c.majorCode}
        </span>
      ),
    },
    {
      key: 'cohort',
      header: 'Cohort',
      headerClassName: cn(HEAD_CLS, 'w-[76px]'),
      cellClassName: CELL_CLS,
      render: (c) => <span className="font-mono text-xs font-semibold text-ink-primary">{c.cohort}</span>,
    },
    {
      key: 'pool',
      header: 'Advisor pool',
      headerClassName: cn(HEAD_CLS, 'w-[120px]'),
      cellClassName: CELL_CLS,
      render: (c) => {
        const count = poolCountByCohort?.get(c.cohortId) ?? 0;
        return count > 0 ? (
          <span className="inline-flex rounded-sm bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/70 tabular-nums">
            {count} advisor{count === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="inline-flex rounded-sm bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200/80">
            Not set
          </span>
        );
      },
    },
    {
      key: 'coverage',
      header: 'Coverage',
      headerClassName: HEAD_CLS,
      cellClassName: CELL_CLS,
      render: (c) => {
        const pct = c.total > 0 ? Math.round((c.assigned / c.total) * 100) : 0;
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-line-soft">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs tabular-nums text-ink-muted">{c.assigned}/{c.total}</span>
          </div>
        );
      },
    },
    {
      key: 'unassigned',
      header: 'Unassigned',
      align: 'right',
      headerClassName: cn(HEAD_CLS, 'w-[96px]'),
      cellClassName: CELL_CLS,
      render: (c) => <span className="text-xs font-semibold tabular-nums text-amber-700">{c.unassigned}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      headerClassName: cn(HEAD_CLS, 'w-[148px]'),
      cellClassName: CELL_CLS,
      render: (c) => {
        const hasPool = (poolCountByCohort?.get(c.cohortId) ?? 0) > 0;
        return (
          <div className="flex justify-end gap-1.5">
            {onConfigurePool && (
              <button
                type="button"
                onClick={() => onConfigurePool(c)}
                aria-label={`Configure advisors for ${c.majorCode} ${c.cohort}`}
                className={cn(
                  'inline-flex h-7 items-center gap-1 rounded-md border border-line bg-white px-2',
                  'text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover',
                )}
              >
                <Settings2 className="size-3.5 text-ink-subtle" aria-hidden /> Pool
              </button>
            )}
            <button
              type="button"
              onClick={() => onPick(c)}
              aria-label={`Auto assign ${c.majorCode} ${c.cohort}`}
              className={cn(
                'inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition-colors',
                hasPool
                  ? 'border-brand/30 bg-brand-soft/70 text-brand-ink hover:border-brand hover:bg-brand hover:text-white'
                  : 'border-line bg-surface-page text-ink-muted hover:border-ink-subtle/50 hover:bg-line-soft hover:text-ink-secondary',
              )}
            >
              <WandSparkles className="size-3.5" aria-hidden /> Auto
            </button>
          </div>
        );
      },
    },
  ];
}
