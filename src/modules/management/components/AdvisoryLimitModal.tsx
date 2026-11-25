// Quick modal to update an advisor's maximum advisee limit.
import { useEffect, useState } from 'react';
import { AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { LoadBadge } from './LoadBadge';
import { useUpdateAdvisorLimit } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentPrimaryBtn,
} from './AssignmentModalChrome';

export interface AdvisoryLimitTarget {
  id: string;
  name: string;
  activeStudents: number;
  limit: number | null;
}

export function AdvisoryLimitModal({
  target,
  onClose,
}: {
  target: AdvisoryLimitTarget | null;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const updateLimit = useUpdateAdvisorLimit();

  useEffect(() => {
    if (!target) return;
    setValue(target.limit != null ? String(target.limit) : '');
    setError(null);
  }, [target]);

  if (!target) return null;

  const parsed = Number(value);
  const valid = Number.isInteger(parsed) && parsed >= 1;
  const overBy = valid ? Math.max(0, target.activeStudents - parsed) : 0;

  const save = async () => {
    if (!valid) return setError('Enter a whole number of at least 1.');
    setError(null);
    try {
      const res = await updateLimit.mutateAsync({ advisorId: target.id, maxAdvisees: parsed });
      toast.success(`Advisory limit for ${target.name} set to ${res.maxAdvisees}.`);
      if (res.overLimitBy > 0) {
        toast.warning(`${target.name} is ${res.overLimitBy} over the new limit.`);
      }
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={!!target} onClose={() => !updateLimit.isPending && onClose()} title="Advisory limit" className="max-w-md">
      <AssignmentModalHeader
        icon={SlidersHorizontal}
        title="Advisory limit"
        subtitle={`Set the maximum recommended advisees for ${target.name}.`}
        onClose={onClose}
      />
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/70 px-3.5 py-2.5 text-xs">
          <span className="text-gray-600">Current workload</span>
          <LoadBadge count={target.activeStudents} limit={target.limit} />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
            Maximum advisees
          </label>
          <input
            type="number"
            min={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            aria-label="Maximum advisees"
            placeholder="e.g. 30"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-2xs focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
          />
        </div>

        {overBy > 0 && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {target.name} currently has {target.activeStudents} students ({overBy} over this limit). The limit is a warning, not a block.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
      <AssignmentModalFooter>
        <button type="button" disabled={updateLimit.isPending} onClick={onClose} className={assignmentCancelBtn}>
          Cancel
        </button>
        <button type="button" disabled={updateLimit.isPending || !valid} onClick={() => void save()} className={assignmentPrimaryBtn}>
          {updateLimit.isPending ? 'Saving...' : 'Save limit'}
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
