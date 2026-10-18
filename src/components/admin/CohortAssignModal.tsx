import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { LoadBadge } from './LoadBadge';
import { useAssignCohort, usePreviewCohortAssign } from '../../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../lib/apiError';
import type { AssignmentAdvisor, CohortAssignPreview, SummaryCohort } from '../../types/admin';

interface CohortAssignModalProps {
  open: boolean;
  onClose: () => void;
  cohorts: SummaryCohort[];
  advisors: AssignmentAdvisor[];
  /** Fix one side of the choice (opened from a cohort row, or from an advisor row). */
  fixedCohortId?: string;
  fixedAdvisorId?: string;
}

const label = (c: SummaryCohort) => `${c.majorCode} ${c.cohort}`;

export function CohortAssignModal({ open, onClose, cohorts, advisors, fixedCohortId, fixedAdvisorId }: CohortAssignModalProps) {
  const [cohortId, setCohortId] = useState('');
  const [advisorId, setAdvisorId] = useState('');
  const [preview, setPreview] = useState<CohortAssignPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const previewMutation = usePreviewCohortAssign();
  const assignMutation = useAssignCohort();

  const run = async (nextCohort: string, nextAdvisor: string) => {
    setPreview(null);
    setError(null);
    if (!nextCohort || !nextAdvisor) return;
    try {
      setPreview(await previewMutation.mutateAsync({ cohortId: nextCohort, advisorId: nextAdvisor }));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  useEffect(() => {
    if (!open) return;
    const c = fixedCohortId ?? '';
    const a = fixedAdvisorId ?? '';
    setCohortId(c);
    setAdvisorId(a);
    setPreview(null);
    setError(null);
    setNotes('');
    if (c && a) run(c, a);
    // Reset only when the dialog is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cohort = cohorts.find((c) => c.cohortId === cohortId);
  const advisor = advisors.find((a) => a.id === advisorId);
  const options = fixedCohortId ? cohorts : cohorts.filter((c) => c.unassigned > 0 || c.cohortId === cohortId);

  const confirm = async () => {
    setError(null);
    try {
      const res = await assignMutation.mutateAsync({ cohortId, advisorId, notes: notes.trim() || undefined });
      toast.success(`${res.assigned} student${res.assigned === 1 ? '' : 's'} of ${cohort ? label(cohort) : 'the cohort'} assigned to ${advisor?.fullName}.`);
      if (res.warning) toast.warning(`${advisor?.fullName} is now ${res.overLimitBy} over the advisory limit.`);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const select =
    'h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-[#f7f8fa]';

  return (
    <Modal open={open} onClose={onClose} title="Assign a cohort to an advisor" className="max-w-xl">
      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#151c27]">Assign a cohort to an advisor</h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            The advisor takes only the students of the cohort who do not have an advisor yet. Students who already have one are not moved.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
          Cohort
          <select
            value={cohortId}
            disabled={!!fixedCohortId}
            onChange={(e) => {
              setCohortId(e.target.value);
              run(e.target.value, advisorId);
            }}
            className={select}
          >
            <option value="">Choose a cohort...</option>
            {options.map((c) => (
              <option key={c.cohortId} value={c.cohortId}>
                {label(c)} ({c.unassigned} unassigned)
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
          Advisor
          <select
            value={advisorId}
            disabled={!!fixedAdvisorId}
            onChange={(e) => {
              setAdvisorId(e.target.value);
              run(cohortId, e.target.value);
            }}
            className={select}
          >
            <option value="">Choose an advisor...</option>
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} ({a.activeStudents}/{a.maxAdvisees ?? 'no limit'})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#151c27]">
          Note <span className="font-normal text-[#555f6f]">(optional, saved in the assignment history)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Why is this assignment being made?"
            className="rounded-lg border border-[#e5e7eb] p-2 text-sm font-normal text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </label>

        {previewMutation.isPending && <p className="text-sm text-[#555f6f]">Calculating...</p>}
        {preview && (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Students to assign</p>
                <p className="mt-1 text-2xl font-bold text-[#151c27]">{preview.unassignedStudents}</p>
              </div>
              <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Advisor total after</p>
                <p className="mt-1">
                  <LoadBadge count={preview.totalAfter} limit={advisor?.maxAdvisees ?? null} />
                </p>
              </div>
            </div>
            {preview.unassignedStudents === 0 && (
              <p className="rounded-lg bg-[#f7f8fa] px-3 py-2 text-[13px] text-[#555f6f]">Every student of this cohort already has an advisor.</p>
            )}
            {preview.warning && (
              <p className="flex items-start gap-2 rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#b45309]">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {advisor?.fullName} would be {preview.overLimitBy} over the advisory limit. You can still continue; the limit is a warning, not a block.
              </p>
            )}
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e7eb] p-4 sm:flex-row sm:px-6">
        <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
          Cancel
        </button>
        <button
          type="button"
          disabled={!preview || preview.unassignedStudents === 0 || assignMutation.isPending}
          onClick={confirm}
          className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
        >
          {assignMutation.isPending ? 'Assigning...' : preview ? `Assign ${preview.unassignedStudents}` : 'Assign'}
        </button>
      </div>
    </Modal>
  );
}
