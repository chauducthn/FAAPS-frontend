// Step 2 of the password reset: the results.
import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, DownloadSimple as Download, Key as KeyRound } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Modal } from '../../../shared/components/ui/Modal';
import { InlineAlert } from '../../../shared/components/ui/InlineAlert';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../shared/components/ui/ModalParts';
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
      <ModalHeader
        title="Password reset results"
        description={`${issued.length} of ${results.length} account${results.length === 1 ? '' : 's'} received a new password.`}
        icon={<KeyRound />}
        tone="warning"
        onClose={onClose}
        closeLabel="Close and discard the passwords"
        closeTitle="Close — the passwords are discarded"
      />

      <ModalBody className="flex flex-col gap-4">
        <InlineAlert tone="error" title="Lưu ngay kẻo mất">
          Mật khẩu chỉ hiển thị đúng một lần. Copy hoặc tải CSV xuống ngay — đóng cửa sổ này là mất vĩnh viễn.
        </InlineAlert>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">
            {issued.length} reset
          </span>
          {skipped.length > 0 && (
            <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium bg-line-soft text-ink-muted">
              {skipped.length} skipped
            </span>
          )}
          {failed.length > 0 && (
            <span className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700">
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
          <p className="rounded-md bg-surface-page px-3 py-2 text-[13px] text-ink-muted">
            No password was issued. Nothing to copy — check the skipped and failed rows above.
          </p>
        )}
      </ModalBody>

      <ModalFooter start={<p className="text-xs text-ink-muted">Đóng cửa sổ này là mất vĩnh viễn các mật khẩu này.</p>}>
        <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
          Đóng lại
        </button>
        <button type="button" onClick={exportCsv} className={modalButtonClass('secondary')}>
          <Download className="size-4" aria-hidden />
          Download CSV
        </button>
        <button
          type="button"
          disabled={issued.length === 0}
          onClick={() => void copyEverything()}
          className={modalButtonClass('primary')}
        >
          {copiedAll ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copiedAll ? 'Copied' : 'Copy All'}
        </button>
      </ModalFooter>
    </Modal>
  );
}
