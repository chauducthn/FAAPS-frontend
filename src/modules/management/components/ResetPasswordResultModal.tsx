// Step 2 of the password reset: the results.
import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, DownloadSimple as Download, Warning as TriangleAlert, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { buildResetCsv, copyToClipboard, downloadResetCsv } from '../utils/passwordReset';
import type { PasswordResetEntry } from '../types/admin';
import { ResetPasswordResultsTable } from './ResetPasswordResultsTable';

interface Props {
  open: boolean;
  /** One row per account the reset touched. */
  results: PasswordResetEntry[];
  /** Closes the dialog for good. The passwords are dropped with it. */
  onClose: () => void;
}

export function ResetPasswordResultModal({ open, results, onClose }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setCopiedId(null);
    setCopiedAll(false);
    setRevealed({});
  }, [open]);

  const issued = useMemo(() => results.filter((row) => row.status === 'SUCCESS'), [results]);
  const skipped = useMemo(() => results.filter((row) => row.status === 'SKIPPED'), [results]);
  const failed = useMemo(() => results.filter((row) => row.status === 'FAILED'), [results]);

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
    <Modal open={open} onClose={() => {}} title="Password reset results" className="max-w-3xl">
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
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3.5">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-red-800">Lưu ngay kẻo mất</p>
            <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-red-700">
              Mật khẩu chỉ hiển thị đúng một lần. Copy hoặc tải CSV xuống ngay — đóng cửa sổ này là mất vĩnh viễn.
            </p>
          </div>
        </div>

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

        <ResetPasswordResultsTable
          results={results}
          revealed={revealed}
          copiedId={copiedId}
          onToggleReveal={(id) => setRevealed((prev) => ({ ...prev, [id]: !prev[id] }))}
          onCopyOne={(row) => void copyOne(row)}
        />

        {issued.length === 0 && (
          <p className="rounded-lg bg-gray-50 px-3 py-2 text-[13px] font-medium text-gray-600">
            No password was issued. Nothing to copy — check the skipped and failed rows above.
          </p>
        )}
      </div>

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
