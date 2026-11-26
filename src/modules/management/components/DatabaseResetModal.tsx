import { Warning as AlertTriangle, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { Modal } from '@/shared/components/ui/Modal';
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

  return (
    <Modal open={open} onClose={() => !isPending && onClose()} title="Confirm database reset" className="max-w-md">
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200/70">
            <AlertTriangle className="size-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">{heading}</h3>
            {isAll ? (
              <p className="mt-1 text-xs text-gray-600">
                Deletes all data except <span className="font-mono font-medium text-gray-900">{preservedAdminEmail ?? 'your admin account'}</span>, roles &amp; categories.
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-600">
                Clears {target.rowCount.toLocaleString()} rows across {target.tables.length} tables. {target.preserves}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="confirm-reset-input" className="mb-1.5 block text-xs font-medium text-gray-700">
            Type <span className="font-mono font-bold text-red-600">RESET</span> to confirm
          </label>
          <input
            id="confirm-reset-input"
            type="text"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            placeholder="RESET"
            className="h-9 w-full rounded-lg border border-gray-200 px-3 font-mono text-xs uppercase focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" />}
            {isPending ? 'Resetting…' : 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
