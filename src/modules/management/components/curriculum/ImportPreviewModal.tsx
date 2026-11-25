// Import XLSX — Preview & Confirm modal.
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { cn } from '@/shared/lib/utils';
import type { CurriculumImportPreview, CurriculumImportPreviewRow } from '../../../academic/types/curriculum';

interface Props {
  open: boolean;
  fileName: string;
  preview: CurriculumImportPreview | null;
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const columns: StaticColumn<CurriculumImportPreviewRow>[] = [
  {
    key: 'rowNumber',
    header: 'Row',
    render: (row) => <span className="tabular-nums">{row.rowNumber}</span>,
    cellClassName: 'text-[var(--ink-muted)]',
  },
  {
    key: 'courseCode',
    header: 'Course code',
    render: (row) => (
      <span className={row.errors.length > 0 ? 'font-mono font-bold text-red-700' : 'font-mono font-bold'}>
        {row.courseCode}
      </span>
    ),
  },
  {
    key: 'semesterNumber',
    header: 'Semester',
    align: 'center',
    render: (row) =>
      row.errors.length > 0 ? (
        <span className="text-[var(--ink-muted)]">Sem {row.semesterNumber}</span>
      ) : (
        <span className="rounded-md bg-[var(--brand-soft)] px-2 py-0.5 font-bold text-[var(--brand-ink)]">
          Sem {row.semesterNumber}
        </span>
      ),
  },
  {
    key: 'result',
    header: 'Result',
    render: (row) =>
      row.errors.length === 0 ? (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
          <CheckCircle2 className="size-3.5" /> Ready
        </span>
      ) : (
        <span className="flex flex-col gap-0.5">
          {row.errors.map((error) => (
            <span key={error} className="flex items-start gap-1 text-[11px] font-medium text-red-600">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" /> {error}
            </span>
          ))}
        </span>
      ),
  },
];

export default function ImportPreviewModal({ open, fileName, preview, isConfirming, onClose, onConfirm }: Props) {
  const validRows = preview?.items.filter((r) => r.errors.length === 0) ?? [];
  const rows = preview?.items ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Preview XLSX import" className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed] text-[#F26F21]">
            <FileSpreadsheet className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900">Preview import</h2>
            <p className="mt-0.5 truncate text-xs text-gray-500" title={fileName}>
              {fileName} · {preview?.totalRows ?? 0} rows read
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="size-4" />
        </button>
      </div>

      {!preview ? (
        <div className="space-y-3 px-6 py-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ))}
          <p className="text-center text-xs text-gray-500">Reading spreadsheet…</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 px-6 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="size-3.5" /> {preview.validRows} valid
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700">
              <AlertTriangle className="size-3.5" /> {preview.errorRows} error
            </span>
            <span className="ml-auto text-[11px] text-gray-500">
              Only valid rows will be imported on Confirm.
            </span>
          </div>

          <div className="max-h-[46vh] overflow-y-auto px-6 py-4">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <StaticTable
                columns={columns}
                rows={rows}
                rowKey={(row) => String(row.rowNumber)}
                emptyTitle="No rows to import"
                emptyDescription="The spreadsheet did not contain any curriculum row."
              />
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
        <p className="text-[11px] text-gray-500">
          Error rows are skipped automatically — fix the file and re-upload to include them.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
                'rounded-lg border border-gray-200 bg-white px-4 py-2',
                'text-xs font-semibold text-gray-700',
                'transition-colors hover:bg-gray-50'
              )}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!preview || validRows.length === 0 || isConfirming}
            onClick={onConfirm}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-xs font-bold text-white',
              'shadow-[0_1px_2px_rgba(242,111,33,0.4)] transition-colors hover:bg-[#e05f14]',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <Upload className="size-3.5" />
            {isConfirming ? 'Importing…' : `Confirm · import ${validRows.length} rows`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
