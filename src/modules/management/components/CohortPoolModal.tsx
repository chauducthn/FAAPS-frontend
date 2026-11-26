import { useEffect, useState } from 'react';
import { SlidersHorizontal as Settings2 } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { useReplaceCohortPool } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignmentAdvisor, SummaryCohort } from '../types/admin';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentPrimaryBtn,
} from './AssignmentModalChrome';

interface CohortPoolModalProps {
  open: boolean;
  cohort: SummaryCohort | null;
  advisors: AssignmentAdvisor[];
  currentIds: string[];
  onClose: () => void;
  onBack?: () => void;
}

export function CohortPoolModal({ open, cohort, advisors, currentIds, onClose, onBack }: CohortPoolModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const replace = useReplaceCohortPool();

  useEffect(() => {
    if (!open) return;
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const currentKey = currentIds.join(',');
  useEffect(() => {
    if (open) setSelected(new Set(currentKey ? currentKey.split(',') : []));
  }, [open, currentKey]);

  if (!cohort) return null;
  const name = `${cohort.majorCode} ${cohort.cohort}`;

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    setError(null);
    try {
      await replace.mutateAsync({ cohortId: cohort.cohortId, advisorIds: [...selected] });
      toast.success(`Advisors for ${name} saved.`);
      if (onBack) onBack();
      else onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Configure advisors" className="max-w-xl">
      <AssignmentModalHeader
        icon={Settings2}
        title={`Advisors for ${name}`}
        subtitle="Auto Assign distributes unassigned students only among the advisors selected here."
        onClose={onClose}
      />
      <div className="flex flex-col gap-3 overflow-y-auto px-6 py-5">
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border border-gray-100 p-1.5">
          {advisors.map((a) => (
            <li key={a.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-gray-50">
                <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="size-4 accent-[#F26F21]" />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900">
                  {a.fullName} <span className="font-normal text-gray-500">· {a.email}</span>
                </span>
                <span className="shrink-0 text-xs text-gray-500 tabular-nums">
                  {a.activeStudents} / {a.maxAdvisees ?? 'no limit'}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {selected.size === 0 && (
          <p className="text-xs text-amber-700">No advisor selected: Auto Assign will be unavailable for this cohort.</p>
        )}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
      </div>
      <AssignmentModalFooter>
        <button type="button" onClick={onBack ?? onClose} className={assignmentCancelBtn}>
          {onBack ? 'Back' : 'Cancel'}
        </button>
        <button type="button" disabled={replace.isPending} onClick={save} className={assignmentPrimaryBtn}>
          {replace.isPending ? 'Saving...' : 'Save advisors'}
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
