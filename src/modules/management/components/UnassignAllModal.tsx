import { useEffect, useState } from 'react';
import { FolderMinus, SpinnerGap, UserMinus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useUnassignAll } from '../hooks/queries/useAdminAssignments';

export interface UnassignAllTarget {
  advisorIds: string[];
  label: string;
}

interface Props {
  target: UnassignAllTarget | null;
  onClose: () => void;
  onDone?: () => void;
}

const TEXTAREA_CLASS =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] text-ink-primary ' +
  'placeholder:text-ink-subtle transition-colors hover:border-ink-subtle/50 ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

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
    <Modal open={!!target} onClose={mutation.isPending ? () => {} : onClose} title="Unassign advisor" className="max-w-md">
      <ModalHeader
        title="Unassign advisor"
        description="Choose whether to remove only assigned students or also clear cohort pools."
        icon={clearPools ? <FolderMinus /> : <UserMinus />}
        tone="danger"
        onClose={onClose}
        closeDisabled={mutation.isPending}
      />

      <ModalBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-page px-3.5 py-2.5 ring-1 ring-inset ring-line-soft">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Selected
          </span>
          <span className="min-w-0 truncate text-[13px] font-semibold text-ink-primary">
            {target.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('students')}
            className={cn(
              'rounded-md border px-3 py-2.5 text-left transition-colors',
              mode === 'students' ? 'border-brand bg-brand-soft/70' : 'border-line hover:bg-surface-hover',
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
              <UserMinus className="size-3.5 text-brand-ink" aria-hidden />
              Students only
            </span>
            <span className="mt-0.5 block text-[11px] text-ink-muted">Keep Major &amp; Cohort</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('cohorts')}
            className={cn(
              'rounded-md border px-3 py-2.5 text-left transition-colors',
              mode === 'cohorts' ? 'border-red-400 bg-red-50/70' : 'border-line hover:bg-surface-hover',
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
              <FolderMinus className="size-3.5 text-red-600" aria-hidden />
              Cohort &amp; Major
            </span>
            <span className="mt-0.5 block text-[11px] text-ink-muted">Clear pool + students</span>
          </button>
        </div>

        <div>
          <label htmlFor="unassign-all-note" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
            Note <span className="font-normal text-ink-subtle">(optional)</span>
          </label>
          <textarea
            id="unassign-all-note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Optional note…"
            className={TEXTAREA_CLASS}
          />
        </div>

        {error && (
          <InlineAlert tone="error" role="alert">
            {error}
          </InlineAlert>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={mutation.isPending} onClick={onClose} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => void handleConfirm()}
          className={modalButtonClass('danger')}
        >
          {mutation.isPending && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
          Confirm
        </button>
      </ModalFooter>
    </Modal>
  );
}
