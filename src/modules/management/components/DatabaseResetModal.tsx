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
      <div className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200/70">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-900">{heading}</h3>
            {isAll ? (
              <p className="mt-1 text-[13px] text-gray-600">
                This cannot be undone. Every record will be deleted except your admin account (
                <span className="font-mono font-medium text-gray-900">{preservedAdminEmail}</span>).
              </p>
            ) : (
              <>
                <p className="mt-1 text-[13px] text-gray-600">{target.description}</p>
                <p className="mt-1.5 text-xs font-medium text-emerald-700">{target.preserves}</p>
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Tables ({target.tables.length}): <span className="font-mono">{target.tables.join(', ')}</span>
                </p>
              </>
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
            className="h-10 w-full rounded-lg border border-gray-200 px-3 font-mono text-[13px] uppercase focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? 'Resetting…' : 'Confirm reset'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
