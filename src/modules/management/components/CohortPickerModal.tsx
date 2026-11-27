import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal as Settings2, MagicWand as WandSparkles } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useSmartAutoAssignAll } from '../hooks/queries/useAdminAssignments';
import type { SmartBatchAssignResult, SummaryCohort } from '../types/admin';
import { AssignmentModalHeader } from './AssignmentModalChrome';
import { CohortPickerFilters, CohortPickerSmartBar, type PoolFilter } from './CohortPickerSmartBar';
import { cn } from '@/shared/lib/utils';

interface CohortPickerModalProps {
  open: boolean;
  cohorts: SummaryCohort[];
  poolCountByCohort?: Map<string, number>;
  idleAdvisorCount?: number;
  onClose: () => void;
  onPick: (cohort: SummaryCohort) => void;
  onConfigurePool?: (cohort: SummaryCohort) => void;
}

export function CohortPickerModal({
  open, cohorts, poolCountByCohort, idleAdvisorCount = 0, onClose, onPick, onConfigurePool,
}: CohortPickerModalProps) {
  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [poolFilter, setPoolFilter] = useState<PoolFilter>('all');
  const [allowOverLimit, setAllowOverLimit] = useState(false);
  const [batchResult, setBatchResult] = useState<SmartBatchAssignResult | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const smartBatch = useSmartAutoAssignAll();

  useEffect(() => {
    if (!open) return;
    setBatchResult(null);
    setBatchError(null);
  }, [open]);

  const waiting = useMemo(() => cohorts.filter((c) => c.unassigned > 0), [cohorts]);
  const majors = useMemo(() => [...new Set(waiting.map((c) => c.majorCode))].sort(), [waiting]);
  const cohortVersions = useMemo(
    () => [...new Set(waiting.map((c) => c.cohort))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [waiting],
  );
  const readyCount = useMemo(
    () => waiting.filter((c) => (poolCountByCohort?.get(c.cohortId) ?? 0) > 0).length,
    [waiting, poolCountByCohort],
  );
  const unassignedTotal = useMemo(() => waiting.reduce((sum, c) => sum + c.unassigned, 0), [waiting]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return waiting
      .filter((c) => {
        if (majorFilter && c.majorCode !== majorFilter) return false;
        if (cohortFilter && c.cohort !== cohortFilter) return false;
        const hasPool = (poolCountByCohort?.get(c.cohortId) ?? 0) > 0;
        if (poolFilter === 'ready' && !hasPool) return false;
        if (poolFilter === 'missing' && hasPool) return false;
        return !q || `${c.majorCode} ${c.cohort}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const aReady = (poolCountByCohort?.get(a.cohortId) ?? 0) > 0 ? 1 : 0;
        const bReady = (poolCountByCohort?.get(b.cohortId) ?? 0) > 0 ? 1 : 0;
        return bReady - aReady || b.unassigned - a.unassigned || a.majorCode.localeCompare(b.majorCode);
      });
  }, [waiting, search, majorFilter, cohortFilter, poolFilter, poolCountByCohort]);

  const runBatch = async (autoConfigurePools: boolean) => {
    setBatchError(null);
    try {
      const res = await smartBatch.mutateAsync({
        cohortIds: rows.length < waiting.length ? rows.map((r) => r.cohortId) : undefined,
        autoConfigurePools,
        allowOverLimit,
      });
      setBatchResult(res);
      toast.success(`Smart Auto Assign complete: ${res.assigned} students assigned.`);
    } catch (err) {
      setBatchError(apiErrorMessage(err));
    }
  };

  const columns: StaticColumn<SummaryCohort>[] = [
    { key: 'major', header: 'Major', render: (c) => <span className="inline-flex rounded-md bg-line-soft px-2 py-0.5 text-xs font-semibold text-ink-primary">{c.majorCode}</span> },
    { key: 'cohort', header: 'Cohort', render: (c) => <span className="font-semibold text-ink-primary">{c.cohort}</span> },
    {
      key: 'pool',
      header: 'Advisor pool',
      render: (c) => {
        const count = poolCountByCohort?.get(c.cohortId) ?? 0;
        return count > 0 ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/70 tabular-nums">
            {count} advisor{count === 1 ? '' : 's'}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200/80">Not set</span>
        );
      },
    },
    {
      key: 'coverage',
      header: 'Coverage',
      render: (c) => {
        const pct = c.total > 0 ? Math.round((c.assigned / c.total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line-soft">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs tabular-nums text-ink-muted">{c.assigned}/{c.total}</span>
          </div>
        );
      },
    },
    { key: 'unassigned', header: 'Unassigned', render: (c) => <span className="font-semibold tabular-nums text-amber-700">{c.unassigned}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => {
        const hasPool = (poolCountByCohort?.get(c.cohortId) ?? 0) > 0;
        return (
          <div className="flex justify-end gap-1.5">
            {onConfigurePool && (
              <button type="button" onClick={() => onConfigurePool(c)} aria-label={`Configure advisors for ${c.majorCode} ${c.cohort}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-xs font-semibold text-ink-secondary hover:bg-surface-hover">
                <Settings2 className="size-3.5 text-ink-subtle" aria-hidden /> Pool
              </button>
            )}
            <button type="button" onClick={() => onPick(c)} aria-label={`Auto assign ${c.majorCode} ${c.cohort}`} className={cn('inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors', hasPool ? 'border-brand/30 bg-brand-soft/70 text-brand-ink hover:border-brand hover:bg-brand hover:text-white' : 'border-line bg-surface-page text-ink-muted hover:border-ink-subtle/50 hover:bg-line-soft hover:text-ink-secondary')}>
              <WandSparkles className="size-3.5" aria-hidden /> Auto
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Auto assign" className="max-w-4xl">
      <AssignmentModalHeader
        icon={WandSparkles}
        title="Smart Auto Assign"
        subtitle="Auto-setup advisor pools and balance all waiting cohorts in one click, or inspect any cohort individually."
        onClose={onClose}
      />
      <div className="flex max-h-[75vh] flex-col gap-3.5 overflow-y-auto px-6 py-5">
        {waiting.length > 0 && (
          <>
            <CohortPickerSmartBar
              waitingCount={waiting.length} unassignedTotal={unassignedTotal} readyCount={readyCount}
              idleAdvisorCount={idleAdvisorCount} filteredCount={rows.length} allowOverLimit={allowOverLimit}
              isPending={smartBatch.isPending} result={batchResult} error={batchError}
              onToggleOverLimit={setAllowOverLimit}
              onRunSmartSetupAndAssign={() => void runBatch(true)}
              onRunReadyOnly={() => void runBatch(false)}
            />
            <CohortPickerFilters
              search={search} majorFilter={majorFilter} cohortFilter={cohortFilter} poolFilter={poolFilter}
              majors={majors} cohortVersions={cohortVersions}
              onSearch={setSearch} onMajor={setMajorFilter} onCohort={setCohortFilter} onPoolFilter={setPoolFilter}
            />
          </>
        )}
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            {waiting.length === 0 ? 'Every student has an advisor.' : 'No cohorts match your filters.'}
          </p>
        ) : (
          <div className="max-h-[380px] overflow-y-auto rounded-lg border border-line/80">
            <StaticTable columns={columns} rows={rows} rowKey={(c) => c.cohortId} emptyTitle="Every student has an advisor." />
          </div>
        )}
      </div>
    </Modal>
  );
}
