// Reset the password of one or more accounts.
//
// The backend issues a default password and reports it back once, so the
// dialog shows it in a copyable field. There is no second chance to read it,
// which is why the copy button is the primary action.

import { useEffect, useState } from 'react';
import { Check, Copy, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { apiErrorMessage } from '../../../shared/lib/apiError';
import { useBulkResetUserPassword, useResetUserPassword } from '../hooks/queries/useAdminUsers';

interface Props {
  open: boolean;
  /** The accounts to reset. One entry resets a single account. */
  users: { id: string; fullName: string }[];
  onClose: () => void;
  onDone?: () => void;
}

export function ResetPasswordModal({ open, users, onClose, onDone }: Props) {
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resetOne = useResetUserPassword();
  const resetMany = useBulkResetUserPassword();
  const isPending = resetOne.isPending || resetMany.isPending;

  useEffect(() => {
    if (!open) return;
    setPassword(null);
    setError(null);
    setCopied(false);
    // Reset only when the dialog is (re)opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const run = async () => {
    setError(null);
    try {
      const result =
        users.length === 1
          ? await resetOne.mutateAsync(users[0].id)
          : await resetMany.mutateAsync(users.map((user) => user.id));
      setPassword(result.defaultPassword);
      toast.success(
        `${result.updated} account${result.updated === 1 ? '' : 's'} reset. Share the new password securely.`,
      );
      onDone?.();
    } catch (cause) {
      setError(apiErrorMessage(cause));
    }
  };

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Password copied to the clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('The password could not be copied. Select it and copy it manually.');
    }
  };

  const title = users.length === 1 ? 'Reset password' : `Reset ${users.length} passwords`;

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]">
            <KeyRound className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold leading-snug text-[#111827]">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">
              {users.length === 1
                ? `${users[0].fullName} will sign in with the default password until they change it.`
                : `${users.length} accounts will sign in with the default password until they change it.`}
            </p>
          </div>
        </div>

        {password ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#9a3412]">Default password</p>
            <p className="mt-1.5 select-all font-mono text-lg font-bold tracking-wide text-[#7c2d12]">{password}</p>
            <button
              type="button"
              onClick={copy}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-bold text-[#9a3412] ring-1 ring-orange-200 transition-colors hover:bg-orange-100"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy password'}
            </button>
          </div>
        ) : (
          <p className="rounded-xl bg-[#f7f8fa] px-3.5 py-3 text-[13px] leading-relaxed text-[#555f6f]">
            The default password is shown only once, right after the reset. Share it with the account holders through a secure
            channel.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#e5e7eb] p-4 sm:flex-row sm:px-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200"
        >
          {password ? 'Done' : 'Cancel'}
        </button>
        {!password && (
          <button
            type="button"
            disabled={isPending || users.length === 0}
            onClick={run}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? 'Resetting…' : 'Reset password'}
          </button>
        )}
      </div>
    </Modal>
  );
}
