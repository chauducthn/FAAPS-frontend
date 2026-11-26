import { useEffect, useMemo, useState } from 'react';
import { SpinnerGap as Loader2, MagicWand as WandSparkles } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { useConfirmAutoAssign, usePreviewAutoAssign, useReplaceCohortPool } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignmentAdvisor, CohortAutoAssignResponse, CohortPoolAdvisor, SummaryCohort } from '../types/admin';
import { AutoAssignAdvisorPanel } from './AutoAssignAdvisorPanel';
import { AutoAssignAllocationResult } from './AutoAssignAllocationResult';
import {
  AssignmentModalFooter, AssignmentModalHeader, assignmentCancelBtn, assignmentPrimaryBtn, assignmentTextareaClass,
} from './AssignmentModalChrome';

interface AutoAssignModalProps {
  open: boolean;
  cohort: SummaryCohort | null;
  pool: CohortPoolAdvisor[];
  advisors?: AssignmentAdvisor[];
  idleAdvisors?: AssignmentAdvisor[];
  onClose: () => void;
  onBack?: () => void;
  onConfigurePool?: () => void;
}

export function AutoAssignModal({
  open, cohort, pool, advisors = [], idleAdvisors = [], onClose, onBack, onConfigurePool,
}: AutoAssignModalProps) {
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allowOverLimit, setAllowOverLimit] = useState(false);
  const [response, setResponse] = useState<CohortAutoAssignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const previewMutation = usePreviewAutoAssign();
  const confirmMutation = useConfirmAutoAssign();
  const replacePool = useReplaceCohortPool();

  useEffect(() => {
    if (!open) return;
    setDone(false);
    setAllowOverLimit(false);
    setResponse(null);
    setError(null);
    setNotes('');
  }, [open, cohort?.cohortId]);

  const poolKey = pool.map((a) => a.advisorId).join(',');
  useEffect(() => {
    if (open && !done) setSelected(new Set(poolKey ? poolKey.split(',') : []));
  }, [open, poolKey, done]);

  const selectedIds = useMemo(
    () => pool.filter((a) => selected.has(a.advisorId)).map((a) => a.advisorId),
    [pool, selected],
  );
  const selectedKey = selectedIds.join(',');

  // Live preview whenever selected advisors or over-limit policy changes.
  useEffect(() => {
    if (!open || !cohort || done) return;
    if (selectedIds.length === 0) {
      setResponse(null);
      return;
    }
    let cancelled = false;
    setError(null);
    previewMutation
      .mutateAsync({ cohortId: cohort.cohortId, advisorIds: selectedIds, allowOverLimit })
      .then((res) => { if (!cancelled) setResponse(res); })
      .catch((err) => { if (!cancelled) setError(apiErrorMessage(err)); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cohort?.cohortId, selectedKey, allowOverLimit, done]);

  if (!cohort) return null;
  const name = `${cohort.majorCode} ${cohort.cohort}`;
  const poolById = new Map(pool.map((a) => [a.advisorId, a]));
  const loadById = new Map(advisors.map((a) => [a.id, a.activeStudents]));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const handleQuickAdd = async (newIds: string[]) => {
    setError(null);
    try {
      const merged = [...new Set([...pool.map((a) => a.advisorId), ...newIds])];
      await replacePool.mutateAsync({ cohortId: cohort.cohortId, advisorIds: merged });
      toast.success(`Added ${newIds.length} advisor${newIds.length === 1 ? '' : 's'} to ${name}.`);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    setError(null);
    try {
      const res = await confirmMutation.mutateAsync({
        cohortId: cohort.cohortId, advisorIds: selectedIds, notes: notes.trim() || undefined, allowOverLimit,
      });
      setResponse(res);
      setDone(true);
      toast.success(`Auto Assign complete: ${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned.`);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Auto Assign" className="max-w-2xl">
      <AssignmentModalHeader
        icon={WandSparkles}
        title={done ? `Auto Assign — Complete (${name})` : `Smart Auto Assign — ${name}`}
        subtitle={
          done
            ? 'The distribution below has been saved.'
            : `Review live distribution for ${cohort.unassigned} unassigned student${cohort.unassigned === 1 ? '' : 's'} and confirm in one step.`
        }
        onClose={onClose}
      />
      <div className="flex max-h-[72vh] flex-col gap-4 overflow-y-auto px-6 py-5">
        {!done && (
          <AutoAssignAdvisorPanel
            cohort={cohort}
            pool={pool}
            selected={selected}
            loadById={loadById}
            idleAdvisors={idleAdvisors}
            allowOverLimit={allowOverLimit}
            addingPool={replacePool.isPending}
            onToggle={toggle}
            onToggleOverLimit={setAllowOverLimit}
            onQuickAdd={handleQuickAdd}
            onConfigurePool={onConfigurePool}
          />
        )}
        {previewMutation.isPending && !done && (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 className="size-3.5 animate-spin text-[#F26F21]" />
            Calculating optimal distribution…
          </p>
        )}
        {response && (
          <AutoAssignAllocationResult phase={done ? 'done' : 'preview'} response={response} poolById={poolById} />
        )}
        {!done && response && response.assigned > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">
              Note <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Why is this assignment being made?"
              className={assignmentTextareaClass}
            />
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
      <AssignmentModalFooter>
        {done ? (
          <button type="button" onClick={onBack ?? onClose} className={assignmentPrimaryBtn}>
            {onBack ? 'Back to cohorts' : 'Done'}
          </button>
        ) : (
          <>
            <button type="button" onClick={onBack ?? onClose} className={assignmentCancelBtn}>
              {onBack ? 'Back' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={confirmMutation.isPending || previewMutation.isPending || (response?.assigned ?? 0) === 0}
              onClick={runConfirm}
              className={assignmentPrimaryBtn}
            >
              {confirmMutation.isPending ? 'Assigning…' : `Confirm Auto Assign${response?.assigned ? ` (${response.assigned})` : ''}`}
            </button>
          </>
        )}
      </AssignmentModalFooter>
    </Modal>
  );
}
