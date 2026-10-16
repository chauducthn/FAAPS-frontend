import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { useConfirmAutoAssign, usePreviewAutoAssign } from '../../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../lib/apiError';
import type { AssignmentAdvisor, AutoAssignPreview, AutoAssignResult } from '../../types/admin';

interface AutoAssignModalProps {
  open: boolean;
  cohort: string;
  unassignedCount: number;
  advisors: AssignmentAdvisor[];
  /** Advisors that already have students in this cohort; pre-selected by default. */
  defaultAdvisorIds: string[];
  onClose: () => void;
}

type Phase = 'select' | 'preview' | 'done';

export function AutoAssignModal({ open, cohort, unassignedCount, advisors, defaultAdvisorIds, onClose }: AutoAssignModalProps) {
  const [phase, setPhase] = useState<Phase>('select');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<AutoAssignPreview | null>(null);
  const [result, setResult] = useState<AutoAssignResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Snapshot taken at preview time so the table stays stable after the advisor list refetches.
  const [before, setBefore] = useState<Record<string, number>>({});
  const previewMutation = usePreviewAutoAssign();
  const confirmMutation = useConfirmAutoAssign();

  useEffect(() => {
    if (!open) return;
    setPhase('select');
    setPreview(null);
    setResult(null);
    setError(null);
    setSelected(new Set(defaultAdvisorIds));
    // Reset only when the dialog is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const advisorById = new Map(advisors.map((a) => [a.id, a]));
  const ids = [...selected];

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const runPreview = async () => {
    setError(null);
    try {
      const res = await previewMutation.mutateAsync({ cohort, advisorIds: ids });
      setBefore(Object.fromEntries(advisors.map((a) => [a.id, a.activeStudents])));
      setPreview(res);
      setPhase('preview');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    setError(null);
    try {
      const res = await confirmMutation.mutateAsync({ cohort, advisorIds: ids });
      setResult(res);
      setPhase('done');
      toast.success(`Auto Assign complete: ${res.assigned} student${res.assigned === 1 ? '' : 's'} assigned.`);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const allocation = phase === 'done' ? result?.allocation : preview?.allocation;
  const newCount = phase === 'done' ? result?.assigned ?? 0 : preview?.unassignedStudents ?? 0;

  return (
    <Modal open={open} onClose={onClose} title="Auto Assign">
      <div className="flex flex-col gap-5 overflow-y-auto p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#151c27]">
            {phase === 'done' ? 'Auto Assign — Complete' : phase === 'preview' ? 'Auto Assign — Preview & Confirmation' : `Auto Assign — Cohort ${cohort}`}
          </h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            {phase === 'select' && `Choose the advisors who will share the ${unassignedCount} unassigned student${unassignedCount === 1 ? '' : 's'}.`}
            {phase === 'preview' && `Review the allocation for ${cohort} before confirming. No assignments have changed yet.`}
            {phase === 'done' && 'The allocation below has been saved.'}
          </p>
        </div>

        {phase === 'select' && (
          <>
            <div className="rounded-lg bg-[#fff7ed] px-4 py-3 text-[13px] text-[#555f6f]">
              <p className="font-semibold text-[#f37021]">All {unassignedCount} newly joined students with no advisor</p>
              Auto Assign covers every unassigned student in this cohort, independently of any selected rows. Existing assignments are never changed.
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-[#151c27]">Advisors</legend>
              {advisors.length === 0 ? (
                <p className="text-sm text-[#555f6f]">No active advisors available.</p>
              ) : (
                <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                  {advisors.map((a) => (
                    <li key={a.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
                        <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="size-4 accent-[#f37021]" />
                        <span className="flex-1 text-sm font-semibold text-[#151c27]">
                          {a.fullName} <span className="font-normal text-[#555f6f]">· {a.advisorCode}</span>
                        </span>
                        <span className="text-xs text-[#555f6f]">
                          {a.activeStudents}
                          {a.maxAdvisees !== null ? ` / ${a.maxAdvisees}` : ''} students
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>
          </>
        )}

        {phase !== 'select' && allocation && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{phase === 'done' ? 'Assigned' : 'New to assign'}</p>
                <p className="mt-1 text-2xl font-bold text-[#151c27]">{newCount}</p>
              </div>
              <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Advisors used</p>
                <p className="mt-1 text-2xl font-bold text-[#151c27]">{Object.keys(allocation).length}</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#e7eefe]">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-[rgba(240,243,255,0.7)] text-[#555f6f]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Advisor</th>
                    <th className="px-4 py-3 font-medium">Assigned before</th>
                    <th className="px-4 py-3 font-medium">New students</th>
                    <th className="px-4 py-3 font-medium">Assigned after</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(allocation).map(([id, added]) => {
                    const advisor = advisorById.get(id);
                    const prior = before[id] ?? 0;
                    return (
                      <tr key={id} className="border-t border-[#e7eefe]">
                        <td className="px-4 py-3 font-semibold text-[#151c27]">
                          {advisor?.fullName ?? id}
                          <span className="block text-xs font-normal text-[#555f6f]">{advisor?.advisorCode}</span>
                        </td>
                        <td className="px-4 py-3 text-[#151c27]">{prior}</td>
                        <td className="px-4 py-3 font-semibold text-[#f37021]">+{added}</td>
                        <td className="px-4 py-3 font-bold text-[#151c27]">{prior + added}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="flex flex-col gap-2 rounded-lg bg-[#f7f8fa] p-4 text-[13px] text-[#555f6f]">
              {[
                'Only newly joined students with no advisor are distributed.',
                'Allocation balances the advisors’ total assigned student counts.',
                'Existing assigned students are never reassigned.',
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
                disabled={ids.length === 0 || unassignedCount === 0 || previewMutation.isPending}
                onClick={runPreview}
                className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
              >
                {previewMutation.isPending ? 'Calculating...' : 'Preview allocation'}
              </button>
            ) : (
              <button
                type="button"
                disabled={confirmMutation.isPending || (preview?.unassignedStudents ?? 0) === 0}
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
