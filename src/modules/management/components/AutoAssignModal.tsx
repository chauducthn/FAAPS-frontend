import { useEffect, useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { useConfirmAutoAssign, usePreviewAutoAssign } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { CohortAutoAssignResponse, CohortPoolAdvisor, SummaryCohort } from '../types/admin';
import { AutoAssignAllocationResult } from './AutoAssignAllocationResult';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentPrimaryBtn,
  assignmentTextareaClass,
} from './AssignmentModalChrome';

interface AutoAssignModalProps {
  open: boolean;
  cohort: SummaryCohort | null;
  pool: CohortPoolAdvisor[];
  onClose: () => void;
  onBack?: () => void;
  onConfigurePool?: () => void;
}

type Phase = 'select' | 'preview' | 'done';

export function AutoAssignModal({ open, cohort, pool, onClose, onBack, onConfigurePool }: AutoAssignModalProps) {
  const [phase, setPhase] = useState<Phase>('select');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [response, setResponse] = useState<CohortAutoAssignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const previewMutation = usePreviewAutoAssign();
  const confirmMutation = useConfirmAutoAssign();

  useEffect(() => {
    if (!open) return;
    setPhase('select');
    setResponse(null);
    setError(null);
    setNotes('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const poolKey = pool.map((a) => a.advisorId).join(',');
  useEffect(() => {
    if (open && phase === 'select') setSelected(new Set(poolKey ? poolKey.split(',') : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, poolKey]);

  if (!cohort) return null;
  const name = `${cohort.majorCode} ${cohort.cohort}`;
  const ids = pool.filter((a) => selected.has(a.advisorId)).map((a) => a.advisorId);
  const poolById = new Map(pool.map((a) => [a.advisorId, a]));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runPreview = async () => {
    setError(null);
    try {
      setResponse(await previewMutation.mutateAsync({ cohortId: cohort.cohortId, advisorIds: ids }));
      setPhase('preview');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    setError(null);
    try {
      const res = await confirmMutation.mutateAsync({ cohortId: cohort.cohortId, advisorIds: ids, notes: notes.trim() || undefined });
      setResponse(res);
      setPhase('done');
      toast.success(`Auto Assign complete: ${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned.`);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const title = phase === 'done' ? 'Auto Assign — Complete' : phase === 'preview' ? 'Auto Assign — Preview' : `Auto Assign — ${name}`;
  const subtitle =
    phase === 'select'
      ? `Distribute ${cohort.unassigned} unassigned student${cohort.unassigned === 1 ? '' : 's'} of ${name}.`
      : phase === 'preview'
        ? `Review the distribution for ${name}. Nothing has changed yet.`
        : 'The distribution below has been saved.';

  return (
    <Modal open={open} onClose={onClose} title="Auto Assign" className="max-w-xl">
      <AssignmentModalHeader icon={WandSparkles} title={title} subtitle={subtitle} onClose={onClose} />
      <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        {phase === 'select' && (
          <>
            <div className="rounded-lg border border-orange-200/70 bg-orange-50/70 px-3.5 py-2.5 text-xs text-gray-600">
              <p className="font-semibold text-[#C2410C]">Only unassigned students are distributed</p>
              <p className="mt-0.5">Balances total advisee counts across selected advisors without moving already assigned students.</p>
            </div>
            {pool.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500">
                No advisors are configured for {name} yet.{' '}
                {onConfigurePool && (
                  <button type="button" onClick={onConfigurePool} className="font-semibold text-[#F26F21] hover:underline">
                    Configure advisors
                  </button>
                )}
              </div>
            ) : (
              <fieldset>
                <legend className="mb-2 text-[13px] font-medium text-gray-700">Advisors of this cohort</legend>
                <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto rounded-lg border border-gray-100 p-1.5">
                  {pool.map((a) => (
                    <li key={a.advisorId}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-gray-50">
                        <input type="checkbox" checked={selected.has(a.advisorId)} onChange={() => toggle(a.advisorId)} className="size-4 accent-[#F26F21]" />
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900">
                          {a.fullName} <span className="font-normal text-gray-500">· {a.email}</span>
                        </span>
                        <span className="shrink-0 text-xs text-gray-500 tabular-nums">{a.cohortStudents} here</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </>
        )}

        {phase === 'preview' && (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
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

        {phase !== 'select' && response && (
          <AutoAssignAllocationResult phase={phase} response={response} poolById={poolById} />
        )}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      </div>
      <AssignmentModalFooter>
        {phase === 'done' ? (
          <button type="button" onClick={onBack ?? onClose} className={assignmentPrimaryBtn}>
            {onBack ? 'Back to cohorts' : 'Done'}
          </button>
        ) : (
          <>
            <button type="button" onClick={phase === 'preview' ? () => setPhase('select') : (onBack ?? onClose)} className={assignmentCancelBtn}>
              {phase === 'preview' || onBack ? 'Back' : 'Cancel'}
            </button>
            {phase === 'select' ? (
              <button type="button" disabled={ids.length === 0 || cohort.unassigned === 0 || previewMutation.isPending} onClick={runPreview} className={assignmentPrimaryBtn}>
                {previewMutation.isPending ? 'Calculating...' : 'Preview distribution'}
              </button>
            ) : (
              <button type="button" disabled={confirmMutation.isPending || (response?.assigned ?? 0) === 0} onClick={runConfirm} className={assignmentPrimaryBtn}>
                {confirmMutation.isPending ? 'Assigning...' : 'Confirm Auto Assign'}
              </button>
            )}
          </>
        )}
      </AssignmentModalFooter>
    </Modal>
  );
}
