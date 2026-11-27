import { Warning as AlertTriangle, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { Modal } from '@/shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '@/shared/components/ui/ModalParts';
import type { DatabaseResetScope } from '../services/database.service';

interface Props {
  open: boolean;
  target: DatabaseResetScope | 'ALL' | null;
  preservedAdminEmail?: string;
  confirmText: string;
  isPending: boolean;
  onConfirmTextChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function DatabaseResetModal({
  open,
  target,
  preservedAdminEmail,
  confirmText,
  isPending,
  onConfirmTextChange,
  onClose,
  onConfirm,
}: Props) {
  const isAll = target === 'ALL' || !target;
  const canConfirm = confirmText.trim().toUpperCase() === 'RESET' && !isPending;
  const heading = isAll ? 'Reset entire database?' : `Reset ${target.label}?`;
  const description = isAll ? (
    <>
      Deletes all data except{' '}
      <span className="font-mono font-medium text-ink-primary">
        {preservedAdminEmail ?? 'your admin account'}
      </span>
      , roles &amp; categories.
    </>
  ) : (
    <>
      Clears {target.rowCount.toLocaleString()} rows across {target.tables.length} tables. {target.preserves}
    </>
  );

  return (
    <Modal open={open} onClose={() => !isPending && onClose()} title="Confirm database reset" className="max-w-md">
      <ModalHeader
        icon={<AlertTriangle />}
        tone="danger"
        title={heading}
        description={description}
        onClose={onClose}
        closeDisabled={isPending}
      />

      <ModalBody>
        <label htmlFor="confirm-reset-input" className="mb-1.5 block text-[13px] font-medium text-ink-secondary">
          Type <span className="font-mono font-semibold text-red-600">RESET</span> to confirm
        </label>
        <input
          id="confirm-reset-input"
          type="text"
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="RESET"
          className={
            'h-9 w-full rounded-md border border-line bg-white px-3 font-mono text-[13px] uppercase ' +
            'text-ink-primary placeholder:text-ink-subtle focus:border-red-500 focus:outline-none ' +
            'focus:ring-2 focus:ring-red-500/15'
          }
        />
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          disabled={isPending}
          onClick={onClose}
          className={modalButtonClass('secondary')}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirm}
          className={modalButtonClass('danger')}
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Confirm
        </button>
      </ModalFooter>
    </Modal>
  );
}
