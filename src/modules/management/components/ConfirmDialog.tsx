import { Modal } from '../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import { AlertTriangle } from 'lucide-react';

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
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
              destructive ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-[#F26F21]'
            )}
          >
            <AlertTriangle className="size-5" strokeWidth={2} />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-[15px] font-bold text-[#111827] leading-snug">{title}</h2>
            <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-[#111827] hover:bg-gray-100 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2.5 text-[13px] font-semibold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              destructive
                ? 'bg-[#b91c1c] hover:bg-[#991b1b] focus-visible:ring-red-500/40 shadow-[0_1px_2px_rgba(185,28,28,0.4)]'
                : 'bg-[#F26F21] hover:bg-[#d95e13] focus-visible:ring-[#F26F21]/40 shadow-[0_1px_2px_rgba(242,111,33,0.4)]'
            )}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
