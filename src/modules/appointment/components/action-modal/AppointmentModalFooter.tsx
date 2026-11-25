// Footer action buttons for the advisor appointment action modal.

import { CheckCircle2, UserX, XCircle } from 'lucide-react';
import {
  APPOINTMENT_RESULT_UPDATE_ENABLED,
  FEATURE_PENDING_TOOLTIP,
  type ActionMode,
} from './types';

interface AppointmentModalFooterProps {
  status: string;
  mode: ActionMode;
  isUpdating: boolean;
  isCancelling: boolean;
  onClose: () => void;
  onBack: () => void;
  onEnterMode: (mode: ActionMode) => void;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onComplete: () => void;
  onSaveSummary: () => void;
}

export function AppointmentModalFooter({
  status,
  mode,
  isUpdating,
  isCancelling,
  onClose,
  onBack,
  onEnterMode,
  onAccept,
  onReject,
  onCancel,
  onNoShow,
  onComplete,
  onSaveSummary,
}: AppointmentModalFooterProps) {
  const isPending = status === 'PENDING';
  const isAccepted = status === 'ACCEPTED';
  const isCompleted = status === 'COMPLETED';
  const busy = isUpdating || isCancelling;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-5 py-3.5">
      <button
        type="button"
        onClick={mode === 'idle' ? onClose : onBack}
        disabled={busy}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        {mode === 'idle' ? 'Close' : 'Back'}
      </button>

      {isPending && mode === 'idle' && (
        <>
          <button
            type="button"
            onClick={() => onEnterMode('reject')}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="size-4" aria-hidden />
            Reject
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" aria-hidden />
            {isUpdating ? 'Updating...' : 'Accept'}
          </button>
        </>
      )}

      {isPending && mode === 'reject' && (
        <button
          type="button"
          onClick={onReject}
          disabled={isUpdating}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isUpdating ? 'Rejecting...' : 'Confirm rejection'}
        </button>
      )}

      {isAccepted && mode === 'idle' && (
        <>
          <button
            type="button"
            onClick={() => onEnterMode('cancel')}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <XCircle className="size-4" aria-hidden />
            Hủy lịch
          </button>
          <button
            type="button"
            onClick={() => onEnterMode('noShow')}
            disabled={busy || !APPOINTMENT_RESULT_UPDATE_ENABLED}
            title={APPOINTMENT_RESULT_UPDATE_ENABLED ? undefined : FEATURE_PENDING_TOOLTIP}
            aria-disabled={!APPOINTMENT_RESULT_UPDATE_ENABLED}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-purple-50"
          >
            <UserX className="size-4" aria-hidden />
            Vắng mặt
          </button>
          <button
            type="button"
            onClick={() => onEnterMode('complete')}
            disabled={busy || !APPOINTMENT_RESULT_UPDATE_ENABLED}
            title={APPOINTMENT_RESULT_UPDATE_ENABLED ? undefined : FEATURE_PENDING_TOOLTIP}
            aria-disabled={!APPOINTMENT_RESULT_UPDATE_ENABLED}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#F26F21]"
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Hoàn thành
          </button>
        </>
      )}

      {isAccepted && mode === 'cancel' && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isCancelling ? 'Cancelling...' : 'Xác nhận hủy'}
        </button>
      )}

      {isAccepted && mode === 'noShow' && (
        <button
          type="button"
          onClick={onNoShow}
          disabled={isUpdating}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Xác nhận vắng mặt'}
        </button>
      )}

      {isAccepted && mode === 'complete' && (
        <button
          type="button"
          onClick={onComplete}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" aria-hidden />
          {isUpdating ? 'Saving...' : 'Xác nhận hoàn thành'}
        </button>
      )}

      {isCompleted && mode === 'idle' && (
        <button
          type="button"
          onClick={() => onEnterMode('editSummary')}
          disabled={isUpdating || !APPOINTMENT_RESULT_UPDATE_ENABLED}
          title={APPOINTMENT_RESULT_UPDATE_ENABLED ? undefined : FEATURE_PENDING_TOOLTIP}
          aria-disabled={!APPOINTMENT_RESULT_UPDATE_ENABLED}
          className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#F26F21]"
        >
          Sửa tóm tắt
        </button>
      )}

      {isCompleted && mode === 'editSummary' && (
        <button
          type="button"
          onClick={onSaveSummary}
          disabled={isUpdating}
          className="rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
        >
          {isUpdating ? 'Saving...' : 'Lưu tóm tắt'}
        </button>
      )}
    </div>
  );
}
