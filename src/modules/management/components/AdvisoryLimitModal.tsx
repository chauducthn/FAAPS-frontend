// Quick modal to update an advisor's maximum advisee limit.
import { useEffect, useState } from 'react';
import { SlidersHorizontal, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { LoadBadge } from './LoadBadge';
import { useUpdateAdvisorLimit } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { userFieldClass } from './createUserSchema';
import { UserFormField } from './UserFormPrimitives';

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
      <ModalHeader
        title="Advisory limit"
        description={`Set the maximum recommended advisees for ${target.name}.`}
        icon={<SlidersHorizontal />}
        tone="brand"
        onClose={onClose}
        closeDisabled={updateLimit.isPending}
      />

      <ModalBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-page px-3.5 py-2.5 ring-1 ring-inset ring-line-soft">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            Current workload
          </span>
          <LoadBadge count={target.activeStudents} limit={target.limit} />
        </div>

        <UserFormField label="Maximum advisees" required>
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
            className={userFieldClass(!!error)}
          />
        </UserFormField>

        {overBy > 0 && (
          <InlineAlert tone="info">
            {target.name} currently has {target.activeStudents} students ({overBy} over this limit). The limit is a warning, not a block.
          </InlineAlert>
        )}

        {error && (
          <InlineAlert tone="error" role="alert">
            {error}
          </InlineAlert>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={updateLimit.isPending} onClick={onClose} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button type="button" disabled={updateLimit.isPending || !valid} onClick={() => void save()} className={modalButtonClass('primary')}>
          {updateLimit.isPending && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
          Save limit
        </button>
      </ModalFooter>
    </Modal>
  );
}
