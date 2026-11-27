import { useState } from 'react';
import { CheckCircle, DownloadSimple, WarningCircle } from '@phosphor-icons/react';
import type { ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptImportRowsTable } from './TranscriptImportRowsTable';

interface TranscriptImportPreviewProps {
  preview: ImportPreview;
  busy: boolean;
  onConfirm: (skipErrors?: boolean) => void;
  onDownloadErrors: (id: string) => void;
  onCancel: () => void;
}

export function TranscriptImportPreview({
  preview,
  busy,
  onConfirm,
  onDownloadErrors,
  onCancel,
}: TranscriptImportPreviewProps) {
  const [filter, setFilter] = useState<'all' | 'valid' | 'errors'>('all');
  const validCount = preview.rowCount - preview.errorCount;
  const filteredRows =
    filter === 'errors'
      ? preview.rows.filter((r) => r.error !== null)
      : filter === 'valid'
        ? preview.rows.filter((r) => r.error === null)
        : preview.rows;

  const chipCls = (active: boolean) =>
    `inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold transition-colors ${
      active ? 'bg-[#F26F21] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
    }`;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200/80 bg-gray-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
            <CheckCircle className="size-3.5" weight="fill" /> {validCount} valid
          </span>
          {preview.errorCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
              <WarningCircle className="size-3.5" weight="fill" /> {preview.errorCount} error(s)
            </span>
          )}
        </div>

        {preview.errorCount > 0 && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setFilter('all')} className={chipCls(filter === 'all')}>
              All ({preview.rowCount})
            </button>
            <button type="button" onClick={() => setFilter('valid')} className={chipCls(filter === 'valid')}>
              Valid ({validCount})
            </button>
            <button type="button" onClick={() => setFilter('errors')} className={chipCls(filter === 'errors')}>
              Errors ({preview.errorCount})
            </button>
          </div>
        )}
      </div>

      <TranscriptImportRowsTable preview={{ ...preview, rows: filteredRows }} />

      <div className="flex flex-wrap items-center gap-3">
        {preview.errorCount === 0 ? (
          <button
            type="button"
            disabled={busy || validCount === 0}
            onClick={() => onConfirm(false)}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
          >
            {busy ? 'Importing...' : `Confirm import (${preview.rowCount})`}
          </button>
        ) : validCount > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(true)}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
          >
            {busy ? 'Importing...' : `Import ${validCount} valid row(s) & skip ${preview.errorCount} error(s)`}
          </button>
        ) : null}

        {preview.errorCount > 0 && (
          <button
            type="button"
            onClick={() => onDownloadErrors(preview.importId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <DownloadSimple className="size-3.5" /> Error report (.xlsx)
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] font-semibold text-[#555f6f] hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
