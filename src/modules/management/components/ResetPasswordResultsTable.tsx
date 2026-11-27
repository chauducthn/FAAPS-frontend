import { Check, Copy } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { StaticTable, type StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { PasswordResetEntry } from '../types/admin';

const STATUS_STYLE = {
  SUCCESS: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Reset' },
  SKIPPED: { chip: 'bg-line-soft text-ink-muted ring-line', label: 'Skipped' },
  FAILED: { chip: 'bg-red-50 text-red-700 ring-red-200', label: 'Failed' },
} as const;
function MaskedPassword({ value }: { value: string }) {
  return (
    <span className="font-mono text-[13px] tracking-wide text-ink-muted select-all">
      {'•'.repeat(Math.min(value.length, 16))}
    </span>
  );
}

interface Props {
 results: PasswordResetEntry[];
  revealed: Record<string, boolean>;
  copiedId: string | null;
  onToggleReveal: (userId: string) => void;
  onCopyOne: (row: PasswordResetEntry) => void;
}

export function ResetPasswordResultsTable({
  results,
  revealed,
 copiedId,
  onToggleReveal,
  onCopyOne,
}: Props) {
  const columns: StaticColumn<PasswordResetEntry>[] = [
    {
      key: 'account',
      header: 'Account',
      render: (row) => (
        <>
          <span className="block truncate text-[13px] font-semibold text-ink-primary">{row.email}</span>
          {row.reason && (
            <span className="mt-0.5 block truncate text-[12px] text-ink-muted">{row.reason}</span>
          )}
        </>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const style = STATUS_STYLE[row.status];
        return (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
              style.chip,
            )}
          >
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'password',
      header: 'New password',
      render: (row) => {
        const hasPassword = row.status === 'SUCCESS' && !!row.newPassword;
        if (!hasPassword) return <span className="text-[12px] text-ink-muted">—</span>;
        const isRevealed = revealed[row.userId] ?? false;
        return (
          <div className="flex items-center gap-2">
            {isRevealed ? (
              <span className="select-all font-mono text-[13px] font-semibold tracking-wide text-ink-primary">
                {row.newPassword}
              </span>
            ) : (
              <MaskedPassword value={row.newPassword ?? ''} />
            )}
            <button
              type="button"
              onClick={() => onToggleReveal(row.userId)}
              className="text-[11px] font-bold text-ink-muted underline-offset-2 transition-colors hover:text-[var(--brand-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]"
            >
              {isRevealed ? 'Hide' : 'Show'}
            </button>
          </div>
        );
      },
    },
    {
      key: 'copy',
      header: '',
      headerClassName: 'w-px',
      align: 'right',
      render: (row) => {
        if (row.status !== 'SUCCESS' || !row.newPassword) return null;
        return (
          <button
            type="button"
            onClick={() => onCopyOne(row)}
            aria-label={`Copy the new password of ${row.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-line-soft px-2.5 py-1.5 text-[12px] font-bold text-[var(--ink-primary)] transition-colors hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]"
          >
            {copiedId === row.userId ? (
              <Check className="size-3.5 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copiedId === row.userId ? 'Copied' : 'Copy'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="max-h-[320px] overflow-y-auto">
        <StaticTable
          columns={columns}
          rows={results}
          rowKey={(row) => row.userId}
          emptyTitle="No accounts processed"
          emptyDescription="Select the accounts to reset and try again."
        />
      </div>
    </div>
  );
}
