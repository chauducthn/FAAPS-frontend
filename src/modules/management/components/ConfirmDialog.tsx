import { Modal } from '../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, destructive, isLoading, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} className="max-w-md">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-[#151c27]">{title}</h2>
        <p className="mt-2 text-sm text-[#555f6f]">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60',
              destructive ? 'bg-[#b91c1c] hover:bg-[#991b1b]' : 'bg-[#047857] hover:bg-[#065f46]'
            )}
          >
            {isLoading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
