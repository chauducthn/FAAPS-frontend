import { useEffect, useMemo, useState } from 'react';
import { MagicWand as WandSparkles } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalHeader } from '../../../shared/components/ui/ModalParts';
import { StaticTable } from '../../../shared/components/common/table/StaticTable';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useSmartAutoAssignAll } from '../hooks/queries/useAdminAssignments';
import type { SmartBatchAssignResult, SummaryCohort } from '../types/admin';
import { buildCohortPickerColumns } from './cohortPickerColumns';
import { CohortPickerFilters, CohortPickerSmartBar, type PoolFilter } from './CohortPickerSmartBar';

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

  const columns = buildCohortPickerColumns({ poolCountByCohort, onPick, onConfigurePool });

  return (
    <Modal open={open} onClose={onClose} title="Auto assign" className="max-w-3xl">
      <ModalHeader
        icon={<WandSparkles aria-hidden />}
        tone="brand"
        title="Smart Auto Assign"
        description="Auto-setup advisor pools and balance waiting cohorts in one click, or inspect any cohort individually."
        onClose={onClose}
      />
      <div className="flex max-h-[78vh] flex-col gap-3 overflow-hidden px-5 py-4">
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
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line">
            <StaticTable
              columns={columns}
              rows={rows}
              rowKey={(c) => c.cohortId}
              stickyHeader
              className="min-h-0 flex-1 overflow-y-auto [&_thead_th]:shadow-[inset_0_-1px_0_var(--line)]"
              emptyTitle="Every student has an advisor."
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
