// Step 1 of the password reset: the confirmation.
//
// The admin is about to replace the password of several accounts with a
// random one that is shown exactly once. This dialog makes that irreversible
// step explicit: it lists every account about to be touched and asks the
// admin to acknowledge that the new passwords cannot be read a second time.
//
// The list scrolls when it grows, so the dialog never grows past the screen.

import { useEffect, useMemo, useState } from 'react';
import { Key as KeyRound, ShieldWarning as ShieldAlert } from '@phosphor-icons/react';
import { Modal } from '../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';

export interface ResetPasswordTarget {
  id: string;
  fullName: string;
  email: string;
}

interface Props {
  open: boolean;
  /** The accounts about to be reset. */
  users: ResetPasswordTarget[];
  /** Runs the reset. The dialog stays open while this is pending. */
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: string | null;
}

/** How many accounts are listed before the list scrolls. */
const VISIBLE_ROWS = 6;

export function ResetPasswordConfirmDialog({ open, users, onConfirm, onCancel, isPending, error }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  // The acknowledgement belongs to one attempt, so it resets with the dialog.
  useEffect(() => {
    if (!open) return;
    setAcknowledged(false);
  }, [open]);

  const heading = useMemo(
    () => (users.length === 1 ? 'Reset this password?' : `Reset ${users.length} passwords?`),
    [users.length],
  );

  return (
    <Modal open={open} onClose={isPending ? () => {} : onCancel} title={heading} className="max-w-lg">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]">
            <KeyRound className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold leading-snug text-[#111827]">{heading}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
              Each account will be reset to the default password (<span className="font-mono font-semibold text-gray-900">FPTUniversity@2026</span>).
              The user will be required to change it immediately on their first sign-in after the reset.
            </p>
          </div>
        </div>

        {/* The accounts about to be touched, so nothing is reset by surprise. */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3.5 py-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
              {users.length} account{users.length === 1 ? '' : 's'}
            </span>
          </div>
          <ul
            className={cn(
              'divide-y divide-gray-100 overflow-y-auto',
              users.length > VISIBLE_ROWS ? 'max-h-[168px]' : undefined,
            )}
          >
            {users.map((user) => (
              <li key={user.id} className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
                <span className="min-w-0 truncate text-[13px] font-semibold text-gray-900">{user.fullName}</span>
                <span className="min-w-0 truncate text-[12px] text-[#555f6f]">{user.email}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The acknowledgement is the gate: no reset without it. */}
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors',
            acknowledged
              ? 'border-orange-200 bg-orange-50'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300',
          )}
        >
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#F26F21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
          />
          <span className="text-[13px] font-semibold leading-relaxed text-gray-800">
            Tôi hiểu password chỉ hiện 1 lần
            <span className="mt-0.5 block text-[12px] font-medium text-gray-500">
              The new passwords are shown once, right after the reset. I will save them before closing this window.
            </span>
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e7eb] p-4 sm:flex-row sm:px-6">
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!acknowledged || isPending}
          onClick={onConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2410C] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
        >
          <ShieldAlert className="size-4" />
          {isPending ? 'Resetting…' : 'Reset password'}
        </button>
      </div>
    </Modal>
  );
}
