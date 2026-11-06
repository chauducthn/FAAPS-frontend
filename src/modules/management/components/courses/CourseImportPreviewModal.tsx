// Import XLSX — Preview & Confirm modal cho phân hệ Courses.
// Đồng bộ visual với ImportPreviewModal của Curriculum: header gradient,
// badge valid/error, bảng preview, footer confirm.
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import type { CourseImportPreview } from '../../../academic/types/course';

interface Props {
  open: boolean;
  fileName: string;
  preview: CourseImportPreview | null;
  isConfirming?: boolean;
  isReading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CourseImportPreviewModal({ open, fileName, preview, isConfirming, isReading, onClose, onConfirm }: Props) {
  const validRows = preview?.items.filter((r) => r.errors.length === 0) ?? [];
  const errorRows = preview?.items.filter((r) => r.errors.length > 0) ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Preview course import" className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)]">
            <FileSpreadsheet className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-tight text-gray-900">Preview import</h2>
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

      {!preview || isReading ? (
        <div className="space-y-3 px-6 py-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
          <p className="text-center text-xs font-medium text-gray-400">Reading spreadsheet…</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 px-6 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="size-3.5" /> {preview.validRows} valid
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-700 ring-1 ring-red-200">
              <AlertTriangle className="size-3.5" /> {preview.errorRows} error
            </span>
            <span className="ml-auto text-[11px] text-gray-500">
              Only valid rows will be imported on Confirm.
            </span>
          </div>

          <div className="max-h-[46vh] overflow-y-auto px-6 py-4">
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2.5">Row</th>
                    <th className="px-3 py-2.5">Code</th>
                    <th className="px-3 py-2.5">Course name</th>
                    <th className="px-3 py-2.5 text-center">Credits</th>
                    <th className="px-3 py-2.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {validRows.map((row) => (
                    <tr key={row.rowNumber} className="bg-white">
                      <td className="px-3 py-2.5 tabular-nums text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-gray-900">{row.code}</td>
                      <td className="max-w-[220px] truncate px-3 py-2.5 font-medium text-gray-700" title={row.name}>{row.name}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="rounded-md bg-orange-50 px-2 py-0.5 font-bold tabular-nums text-[#C2410C]">{row.credits}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="size-3.5" /> Ready
                        </span>
                      </td>
                    </tr>
                  ))}
                  {errorRows.map((row) => (
                    <tr key={row.rowNumber} className="bg-red-50/50">
                      <td className="px-3 py-2.5 tabular-nums text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-red-700">{row.code || '—'}</td>
                      <td className="max-w-[220px] truncate px-3 py-2.5 text-gray-500" title={row.name}>{row.name || '—'}</td>
                      <td className="px-3 py-2.5 text-center text-gray-500">{row.credits}</td>
                      <td className="px-3 py-2.5">
                        {row.errors.map((e) => (
                          <p key={e} className="flex items-start gap-1 text-[11px] font-medium text-red-600">
                            <AlertTriangle className="mt-0.5 size-3 shrink-0" /> {e}
                          </p>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!preview || validRows.length === 0 || isConfirming || isReading}
            onClick={onConfirm}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white shadow-[0_1px_2px_rgba(242,111,33,0.4)] transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60',
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
