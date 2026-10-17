import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { LoadBadge } from './LoadBadge';
import { useConfirmAutoAssign, usePreviewAutoAssign } from '../../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../lib/apiError';
import type { CohortAutoAssignResponse, CohortPoolAdvisor, SummaryCohort } from '../../types/admin';

interface AutoAssignModalProps {
  open: boolean;
  cohort: SummaryCohort | null;
  /** Advisors configured for this cohort. Auto assign only distributes among them. */
  pool: CohortPoolAdvisor[];
  onClose: () => void;
  onConfigurePool?: () => void;
}

type Phase = 'select' | 'preview' | 'done';

export function AutoAssignModal({ open, cohort, pool, onClose, onConfigurePool }: AutoAssignModalProps) {
  const [phase, setPhase] = useState<Phase>('select');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [response, setResponse] = useState<CohortAutoAssignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewMutation = usePreviewAutoAssign();
  const confirmMutation = useConfirmAutoAssign();

  useEffect(() => {
    if (!open) return;
    setPhase('select');
    setResponse(null);
    setError(null);
    // Reset only when the dialog is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The advisor list arrives after the dialog opens; keep every advisor ticked until the admin changes the selection.
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
      next.has(id) ? next.delete(id) : next.add(id);
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
      const res = await confirmMutation.mutateAsync({ cohortId: cohort.cohortId, advisorIds: ids });
      setResponse(res);
      setPhase('done');
      toast.success(`Auto Assign complete: ${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned.`);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const title =
    phase === 'done' ? 'Auto Assign — Complete' : phase === 'preview' ? 'Auto Assign — Preview & Confirmation' : `Auto Assign — ${name}`;

  return (
    <Modal open={open} onClose={onClose} title="Auto Assign">
      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#151c27]">{title}</h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            {phase === 'select' && `Distribute the ${cohort.unassigned} unassigned student${cohort.unassigned === 1 ? '' : 's'} of ${name} across the advisors of this cohort.`}
            {phase === 'preview' && `Review the distribution for ${name}. Nothing has changed yet.`}
            {phase === 'done' && 'The distribution below has been saved.'}
          </p>
        </div>

        {phase === 'select' && (
          <>
            <div className="rounded-lg bg-[#fff7ed] px-4 py-3 text-[13px] text-[#555f6f]">
              <p className="font-semibold text-[#f37021]">Only students without an advisor are distributed</p>
              The split balances the advisors&apos; <strong>total</strong> student counts, taking their existing students into account. Students who already have an
              advisor are never moved. Students who join later stay unassigned until you run Auto Assign again.
            </div>
            {pool.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] p-4 text-sm text-[#555f6f]">
                No advisors are configured for {name} yet.{' '}
                {onConfigurePool && (
                  <button type="button" onClick={onConfigurePool} className="font-semibold text-orange-600 hover:underline">
                    Configure advisors
                  </button>
                )}
              </div>
            ) : (
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-[#151c27]">Advisors of this cohort</legend>
                <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                  {pool.map((a) => (
                    <li key={a.advisorId}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
                        <input type="checkbox" checked={selected.has(a.advisorId)} onChange={() => toggle(a.advisorId)} className="size-4 accent-[#f37021]" />
                        <span className="flex-1 text-sm font-semibold text-[#151c27]">
                          {a.fullName} <span className="font-normal text-[#555f6f]">· {a.advisorCode}</span>
                        </span>
                        <span className="text-xs text-[#555f6f]">{a.cohortStudents} in this cohort</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </>
        )}

        {phase !== 'select' && response && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{phase === 'done' ? 'Assigned' : 'New to assign'}</p>
                <p className="mt-1 text-2xl font-bold text-[#151c27]">{response.assigned}</p>
              </div>
              <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Advisors used</p>
                <p className="mt-1 text-2xl font-bold text-[#151c27]">{response.allocation.length}</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#e7eefe]">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead className="bg-[rgba(240,243,255,0.7)] text-[#555f6f]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Advisor</th>
                    <th className="px-4 py-3 font-medium">Total before</th>
                    <th className="px-4 py-3 font-medium">New students</th>
                    <th className="px-4 py-3 font-medium">Total after</th>
                  </tr>
                </thead>
                <tbody>
                  {response.allocation.map((row) => {
                    const advisor = poolById.get(row.advisorId);
                    return (
                      <tr key={row.advisorId} className="border-t border-[#e7eefe]">
                        <td className="px-4 py-3 font-semibold text-[#151c27]">
                          {advisor?.fullName ?? row.advisorId}
                          <span className="block text-xs font-normal text-[#555f6f]">{advisor?.advisorCode}</span>
                        </td>
                        <td className="px-4 py-3 text-[#151c27]">{row.totalAfter - row.assigned}</td>
                        <td className="px-4 py-3 font-semibold text-[#f37021]">+{row.assigned}</td>
                        <td className="px-4 py-3">
                          <LoadBadge count={row.totalAfter} limit={advisor?.maxAdvisees ?? null} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {response.warning && (
              <p className="flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                At least one advisor ends up over the advisory limit. You can still continue; the limit is a warning, not a block.
              </p>
            )}
            {phase === 'preview' && response.assigned === 0 && (
              <p className="rounded-lg bg-[#f7f8fa] px-3 py-2 text-[13px] text-[#555f6f]">There are no unassigned students in this cohort.</p>
            )}
            <ul className="flex flex-col gap-2 rounded-lg bg-[#f7f8fa] p-4 text-[13px] text-[#555f6f]">
              {[
                'Only students without an advisor are distributed.',
                'The split balances the advisors’ total student counts.',
                'Existing assignments are never changed.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#047857]" />
                  {line}
                </li>
              ))}
            </ul>
          </>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e7eb] p-4 sm:flex-row sm:px-6">
        {phase === 'done' ? (
          <button type="button" onClick={onClose} className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]">
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={phase === 'preview' ? () => setPhase('select') : onClose}
              className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200"
            >
              {phase === 'preview' ? 'Back' : 'Cancel'}
            </button>
            {phase === 'select' ? (
              <button
                type="button"
                disabled={ids.length === 0 || cohort.unassigned === 0 || previewMutation.isPending}
                onClick={runPreview}
                className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
              >
                {previewMutation.isPending ? 'Calculating...' : 'Preview distribution'}
              </button>
            ) : (
              <button
                type="button"
                disabled={confirmMutation.isPending || (response?.assigned ?? 0) === 0}
                onClick={runConfirm}
                className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
              >
                {confirmMutation.isPending ? 'Assigning...' : 'Confirm Auto Assign'}
              </button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
