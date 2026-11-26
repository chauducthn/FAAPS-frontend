import { ArrowsLeftRight as ArrowLeftRight, CheckCircle as CheckCircle2, Key as KeyRound, ShieldSlash as ShieldOff, Trash as Trash2 } from '@phosphor-icons/react';
import type { AdminUserSummary } from '../../types/admin';

interface Props {
  selectedRows: AdminUserSummary[];
  onSetRole: (rows: AdminUserSummary[]) => void;
  onResetPassword: (rows: AdminUserSummary[]) => void;
  onActivate: (rows: AdminUserSummary[]) => void;
  onSuspend: (rows: AdminUserSummary[]) => void;
  onDelete: (rows: AdminUserSummary[]) => void;
}

export function UserBulkActions({
  selectedRows,
  onSetRole,
  onResetPassword,
  onActivate,
  onSuspend,
  onDelete,
}: Props) {
  return (
    <>
      <button
        type="button"
        onClick={() => onSetRole(selectedRows)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
      >
        <ArrowLeftRight className="size-3.5" aria-hidden /> Set role
      </button>
      <button
        type="button"
        onClick={() => onResetPassword(selectedRows)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-gray-800 ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
      >
        <KeyRound className="size-3.5" aria-hidden /> Reset password
      </button>
      <button
        type="button"
        onClick={() => onActivate(selectedRows)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
      >
        <CheckCircle2 className="size-3.5" aria-hidden /> Activate
      </button>
      <button
        type="button"
        onClick={() => onSuspend(selectedRows)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[13px] font-medium text-amber-700 transition-colors hover:bg-amber-100"
      >
        <ShieldOff className="size-3.5" aria-hidden /> Suspend
      </button>
      <button
        type="button"
        onClick={() => onDelete(selectedRows)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-100"
      >
        <Trash2 className="size-3.5" aria-hidden /> Delete
      </button>
    </>
  );
}
