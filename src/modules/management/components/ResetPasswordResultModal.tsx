// Step 2 of the password reset: the results.
//
// The backend hands over one new random password per account. This dialog
// shows them once and then forgets them: the passwords live in the component
// state of this dialog only, never in a query cache, a store or the console.
//
// The dialog is deliberately hard to dismiss by accident. Clicking the
// backdrop or pressing Escape does nothing: the admin has to copy what they
// need or download the CSV first. The way out is the explicit button, which
// says out loud that closing loses the passwords.

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, TriangleAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import { buildResetCsv, copyToClipboard, downloadResetCsv } from '../utils/passwordReset';
import type { PasswordResetEntry } from '../types/admin';

interface Props {
  open: boolean;
  /** One row per account the reset touched. */
  results: PasswordResetEntry[];
  /** Closes the dialog for good. The passwords are dropped with it. */
  onClose: () => void;
}

/** The look of each outcome. */
const STATUS_STYLE = {
  SUCCESS: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Reset' },
  SKIPPED: { chip: 'bg-gray-100 text-gray-600 ring-gray-200', label: 'Skipped' },
  FAILED: { chip: 'bg-red-50 text-red-700 ring-red-200', label: 'Failed' },
} as const;

/** A password is masked until the admin asks to see it. */
function MaskedPassword({ value }: { value: string }) {
  return (
    <span className="font-mono text-[13px] tracking-wide text-gray-500 select-all">
      {'•'.repeat(Math.min(value.length, 16))}
    </span>
  );
}

export function ResetPasswordResultModal({ open, results, onClose }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Every new attempt starts from a clean slate.
  useEffect(() => {
    if (!open) return;
    setCopiedId(null);
    setCopiedAll(false);
    setRevealed({});
  }, [open]);

  const issued = useMemo(() => results.filter((row) => row.status === 'SUCCESS'), [results]);
  const skipped = useMemo(() => results.filter((row) => row.status === 'SKIPPED'), [results]);
  const failed = useMemo(() => results.filter((row) => row.status === 'FAILED'), [results]);

  /** The clipboard text of every issued password, one per line. */
  const allPasswords = useMemo(
    () => issued.map((row) => `${row.email}\t${row.newPassword ?? ''}`).join('\n'),
    [issued],
  );

  const copyOne = async (row: PasswordResetEntry) => {
    if (!row.newPassword) return;
    const ok = await copyToClipboard(row.newPassword);
    if (!ok) {
      toast.error('The password could not be copied. Reveal it and copy it manually.');
      return;
    }
    setCopiedId(row.userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyEverything = async () => {
    if (!allPasswords) return;
    const ok = await copyToClipboard(allPasswords);
    if (!ok) {
      toast.error('The passwords could not be copied. Download the CSV instead.');
      return;
    }
    setCopiedAll(true);
    toast.success(`${issued.length} password${issued.length === 1 ? '' : 's'} copied.`);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const exportCsv = () => {
    const csv = buildResetCsv(
      results.map((row) => ({
        email: row.email,
        status: row.status,
        newPassword: row.newPassword,
        reason: row.reason,
      })),
    );
    downloadResetCsv(csv, 'faaps-password-reset.csv');
    toast.success('The CSV was downloaded.');
  };

  return (
    // The backdrop click and Escape are ignored: the passwords are only here once.
    <Modal open={open} onClose={() => {}} title="Password reset results" className="max-w-3xl">
      {/* The header names the dialog and carries the one way out of it. */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 pb-4 pt-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold leading-snug text-[#111827]">Password reset results</h2>
          <p className="mt-1 text-[12.5px] font-medium text-gray-500">
            {issued.length} of {results.length} account{results.length === 1 ? '' : 's'} received a new password.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close and discard the passwords"
          title="Close — the passwords are discarded"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-6">
        {/* The warning sits above everything: it is the reason the dialog cannot be dismissed by accident. */}
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3.5">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-red-800">Lưu ngay kẻo mất</p>
            <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-red-700">
              Mật khẩu chỉ hiển thị đúng một lần. Copy hoặc tải CSV xuống ngay — đóng cửa sổ này là mất vĩnh viễn.
            </p>
          </div>
        </div>

        {/* The tally, so a partial reset is readable at a glance. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            {issued.length} reset
          </span>
          {skipped.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-bold text-gray-600 ring-1 ring-inset ring-gray-200">
              {skipped.length} skipped
            </span>
          )}
          {failed.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-bold text-red-700 ring-1 ring-inset ring-red-200">
              {failed.length} failed
            </span>
          )}
        </div>

        {/* The results. */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th
                    scope="col"
                    className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-600"
                  >
                    Account
                  </th>
                  <th
                    scope="col"
                    className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-600"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-600"
                  >
                    New password
                  </th>
                  <th scope="col" className="w-px px-3.5 py-2.5">
                    <span className="sr-only">Copy</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((row) => {
                  const style = STATUS_STYLE[row.status];
                  const hasPassword = row.status === 'SUCCESS' && !!row.newPassword;
                  const isRevealed = revealed[row.userId] ?? false;
                  return (
                    <tr key={row.userId} className="align-middle">
                      <td className="px-3.5 py-2.5">
                        <span className="block truncate text-[13px] font-semibold text-gray-900">{row.email}</span>
                        {row.reason && (
                          <span className="mt-0.5 block truncate text-[12px] text-gray-500">{row.reason}</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
                            style.chip,
                          )}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {hasPassword ? (
                          <div className="flex items-center gap-2">
                            {isRevealed ? (
                              <span className="select-all font-mono text-[13px] font-semibold tracking-wide text-gray-900">
                                {row.newPassword}
                              </span>
                            ) : (
                              <MaskedPassword value={row.newPassword ?? ''} />
                            )}
                            <button
                              type="button"
                              onClick={() => setRevealed((prev) => ({ ...prev, [row.userId]: !isRevealed }))}
                              className="text-[11px] font-bold text-gray-500 underline-offset-2 transition-colors hover:text-[#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
                            >
                              {isRevealed ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        {hasPassword && (
                          <button
                            type="button"
                            onClick={() => void copyOne(row)}
                            aria-label={`Copy the new password of ${row.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[12px] font-bold text-[#151c27] transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
                          >
                            {copiedId === row.userId ? (
                              <Check className="size-3.5 text-emerald-600" aria-hidden />
                            ) : (
                              <Copy className="size-3.5" aria-hidden />
                            )}
                            {copiedId === row.userId ? 'Copied' : 'Copy'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {issued.length === 0 && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-[13px] font-medium text-gray-600">
            No password was issued. Nothing to copy — check the skipped and failed rows above.
          </p>
        )}
      </div>

      {/* The footer carries the two ways to save the passwords, plus the way out. */}
      <div className="flex flex-col gap-3 border-t border-[#e5e7eb] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[12px] font-medium text-gray-500">Đóng cửa sổ này là mất vĩnh viễn các mật khẩu này.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#555f6f] transition-colors hover:bg-gray-50 hover:text-[#151c27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
          >
            Đóng lại
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-[#151c27] transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
          >
            <Download className="size-4" aria-hidden />
            Download CSV
          </button>
          <button
            type="button"
            disabled={issued.length === 0}
            onClick={() => void copyEverything()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C2410C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9a3412] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40"
          >
            {copiedAll ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copiedAll ? 'Copied' : 'Copy All'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
