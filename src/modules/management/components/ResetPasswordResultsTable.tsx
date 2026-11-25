import { Check, Copy } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PasswordResetEntry } from '../types/admin';

const STATUS_STYLE = {
  SUCCESS: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'Reset' },
  SKIPPED: { chip: 'bg-gray-100 text-gray-600 ring-gray-200', label: 'Skipped' },
  FAILED: { chip: 'bg-red-50 text-red-700 ring-red-200', label: 'Failed' },
} as const;

function MaskedPassword({ value }: { value: string }) {
  return (
    <span className="font-mono text-[13px] tracking-wide text-gray-500 select-all">
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
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="max-h-[320px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-600">
                Account
              </th>
              <th scope="col" className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-600">
                Status
              </th>
              <th scope="col" className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-600">
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
                          onClick={() => onToggleReveal(row.userId)}
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
                        onClick={() => onCopyOne(row)}
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
  );
}
