import { useEffect, useState } from 'react';
import { Warning as AlertTriangle, SpinnerGap, UserMinus } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { Modal } from '../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
import { usePreviewUnassign, useUnassignStudents } from '../hooks/queries/useAdminAssignments';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import type { AssignPreview } from '../types/admin';

interface Props {
  students: { id: string; name: string }[] | null;
  onClose: () => void;
  onDone?: () => void;
}

export function UnassignAdvisorModal({ students, onClose, onDone }: Props) {
  const previewMutation = usePreviewUnassign();
  const unassignMutation = useUnassignStudents();
  const [preview, setPreview] = useState<AssignPreview | null>(null);
  const [acknowledge, setAcknowledge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ids = students?.map((student) => student.id) ?? [];
  const key = ids.join(',');

  useEffect(() => {
    if (!students?.length) return;
    setPreview(null);
    setAcknowledge(false);
    setError(null);
    previewMutation.mutate(ids, {
      onSuccess: setPreview,
      onError: (cause) => setError(apiErrorMessage(cause)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, !!students?.length]);

  const confirm = async () => {
    setError(null);
    try {
      const result = await unassignMutation.mutateAsync({ studentIds: ids, acknowledge });
      toast.success(`${result.unassigned} student${result.unassigned === 1 ? '' : 's'} unassigned.`);
      onDone?.();
      onClose();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const count = students?.length ?? 0;
  const targetLabel = count === 1 ? students![0].name : `${count} selected students`;

  return (
    <Modal open={count > 0} onClose={unassignMutation.isPending ? () => {} : onClose} title="Unassign advisor" className="max-w-md">
      <ModalHeader
        title="Unassign advisor"
        icon={<UserMinus />}
        tone="danger"
        onClose={onClose}
        closeDisabled={unassignMutation.isPending}
      />

      <ModalBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-page px-3.5 py-2.5 ring-1 ring-inset ring-line-soft">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            {count === 1 ? 'Student' : 'Selected students'}
          </span>
          <span className="min-w-0 truncate text-[13px] font-semibold text-ink-primary">
            {targetLabel}
          </span>
        </div>

        {previewMutation.isPending && (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <SpinnerGap className="size-3.5 animate-spin" aria-hidden />
            Checking upcoming appointments…
          </p>
        )}

        {(preview?.appointmentCount ?? 0) > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              {preview?.appointmentCount} future appointment(s) and open advising requests will be cancelled.
            </p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={acknowledge}
                onChange={(event) => setAcknowledge(event.target.checked)}
                className="size-3.5 accent-brand"
              />
              I understand these appointments will be cancelled.
            </label>
          </div>
        )}

        {error && (
          <InlineAlert tone="error" role="alert">
            {error}
          </InlineAlert>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={unassignMutation.isPending} onClick={onClose} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={!preview || previewMutation.isPending || unassignMutation.isPending || ((preview.appointmentCount ?? 0) > 0 && !acknowledge)}
          className={modalButtonClass('danger')}
        >
          {unassignMutation.isPending && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
          Unassign
        </button>
      </ModalFooter>
    </Modal>
  );
}
