import { useEffect, useState } from 'react';
import { FolderMinus, SpinnerGap as Loader2, UserMinus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useUnassignAll } from '../hooks/queries/useAdminAssignments';
import {
  AssignmentModalFooter,
  AssignmentModalHeader,
  assignmentCancelBtn,
  assignmentTextareaClass,
} from './AssignmentModalChrome';

export interface UnassignAllTarget {
  advisorIds: string[];
  label: string;
}

interface Props {
  target: UnassignAllTarget | null;
  onClose: () => void;
  onDone?: () => void;
}

export function UnassignAllModal({ target, onClose, onDone }: Props) {
  const [mode, setMode] = useState<'students' | 'cohorts'>('students');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useUnassignAll();

  useEffect(() => {
    if (!target) return;
    setMode('students');
    setNotes('');
    setError(null);
  }, [target]);

  if (!target) return null;
  const clearPools = mode === 'cohorts';

  const handleConfirm = async () => {
    setError(null);
    try {
      const res = await mutation.mutateAsync({
        advisorIds: target.advisorIds,
        clearPools,
        notes: notes.trim() || undefined,
      });
      toast.success(
        clearPools
          ? `Cleared ${res.clearedPools} cohort pools · unassigned ${res.unassignedStudents.toLocaleString()} students.`
          : `Unassigned ${res.unassignedStudents.toLocaleString()} students.`,
      );
      onDone?.();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={!!target} onClose={mutation.isPending ? () => {} : onClose} title="Unassign" className="max-w-md">
      <AssignmentModalHeader
        icon={clearPools ? FolderMinus : UserMinus}
        title="Unassign"
        subtitle={target.label}
        onClose={onClose}
      />
      <div className="flex flex-col gap-3.5 px-6 py-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('students')}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left transition-colors',
              mode === 'students' ? 'border-[#F26F21] bg-orange-50/70' : 'border-gray-200 hover:bg-gray-50',
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <UserMinus className="size-3.5 text-[#C2410C]" />
              Students only
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-500">Keep Major &amp; Cohort</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('cohorts')}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left transition-colors',
              mode === 'cohorts' ? 'border-red-400 bg-red-50/70' : 'border-gray-200 hover:bg-gray-50',
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <FolderMinus className="size-3.5 text-red-600" />
              Cohort &amp; Major
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-500">Clear pool + students</span>
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Note (optional)"
          className={assignmentTextareaClass}
        />

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
      </div>

      <AssignmentModalFooter>
        <button type="button" disabled={mutation.isPending} onClick={onClose} className={assignmentCancelBtn}>
          Cancel
        </button>
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => void handleConfirm()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-55"
        >
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          {mutation.isPending ? 'Unassigning…' : 'Confirm'}
        </button>
      </AssignmentModalFooter>
    </Modal>
  );
}
