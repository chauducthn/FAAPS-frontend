import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { useReplaceCohortPool } from '../../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../lib/apiError';
import type { AssignmentAdvisor, SummaryCohort } from '../../types/admin';

interface CohortPoolModalProps {
  open: boolean;
  cohort: SummaryCohort | null;
  advisors: AssignmentAdvisor[];
  currentIds: string[];
  onClose: () => void;
}

/** Choose which advisors look after a cohort. Works before any student has joined the cohort. */
export function CohortPoolModal({ open, cohort, advisors, currentIds, onClose }: CohortPoolModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const replace = useReplaceCohortPool();

  useEffect(() => {
    if (!open) return;
    setError(null);
    // Reset only when the dialog is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The current list arrives after the dialog opens.
  const currentKey = currentIds.join(',');
  useEffect(() => {
    if (open) setSelected(new Set(currentKey ? currentKey.split(',') : []));
  }, [open, currentKey]);

  if (!cohort) return null;
  const name = `${cohort.majorCode} ${cohort.cohort}`;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const save = async () => {
    setError(null);
    try {
      await replace.mutateAsync({ cohortId: cohort.cohortId, advisorIds: [...selected] });
      toast.success(`Advisors for ${name} saved.`);
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Configure advisors" className="max-w-xl">
      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div>
          <h2 className="text-xl font-semibold text-[#151c27]">Advisors for {name}</h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            Auto Assign only distributes this cohort&apos;s unassigned students among the advisors selected here. You can choose them before any student joins the cohort. Students
            who already have an advisor are not affected.
          </p>
        </div>
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {advisors.map((a) => (
            <li key={a.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50">
                <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="size-4 accent-[#f37021]" />
                <span className="flex-1 text-sm font-semibold text-[#151c27]">
                  {a.fullName} <span className="font-normal text-[#555f6f]">· {a.advisorCode}</span>
                </span>
                <span className="text-xs text-[#555f6f]">
                  {a.activeStudents} / {a.maxAdvisees ?? 'no limit'} students
                </span>
              </label>
            </li>
          ))}
        </ul>
        {selected.size === 0 && <p className="text-[13px] text-[#b45309]">No advisor selected: Auto Assign will be unavailable for this cohort.</p>}
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
        <button type="button" disabled={replace.isPending} onClick={save} className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60">
          {replace.isPending ? 'Saving...' : 'Save advisors'}
        </button>
      </div>
    </Modal>
  );
}
