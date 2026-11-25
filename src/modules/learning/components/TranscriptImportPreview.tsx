// Preview summary and confirm/error actions for TranscriptImport.

import type { ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptImportRowsTable } from './TranscriptImportRowsTable';

interface TranscriptImportPreviewProps {
  preview: ImportPreview;
  busy: boolean;
  onConfirm: () => void;
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
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-[#151c27]">
        <strong>{preview.rowCount}</strong> row(s) ·{' '}
        <strong className={preview.errorCount ? 'text-red-700' : 'text-emerald-700'}>
          {preview.errorCount}
        </strong>{' '}
        error(s)
      </p>
      <TranscriptImportRowsTable preview={preview} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || preview.errorCount > 0}
          onClick={onConfirm}
          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {busy ? 'Importing...' : `Confirm import (${preview.rowCount})`}
        </button>
        {preview.errorCount > 0 && (
          <button
            type="button"
            onClick={() => onDownloadErrors(preview.importId)}
            className="text-[13px] font-semibold text-red-700 underline"
          >
            Download error report
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] font-semibold text-[#555f6f] underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
