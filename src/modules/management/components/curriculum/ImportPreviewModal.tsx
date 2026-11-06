// Import XLSX — Preview & Confirm modal.
// Mock trả 5 dòng hợp lệ + 1 dòng lỗi để test cả happy case lẫn edge case.
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { cn } from '@/shared/lib/utils';
import type { MockImportPreview } from '../../mocks/curriculumMockApi';
import { MOCK_COURSE_BY_CODE } from '../../mocks/curriculumSupportMockData';

interface Props {
  open: boolean;
  fileName: string;
  preview: MockImportPreview | null;
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ImportPreviewModal({ open, fileName, preview, isConfirming, onClose, onConfirm }: Props) {
  const validRows = preview?.items.filter((r) => r.errors.length === 0) ?? [];
  const errorRows = preview?.items.filter((r) => r.errors.length > 0) ?? [];

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
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2.5">Row</th>
                    <th className="px-3 py-2.5">Course code</th>
                    <th className="px-3 py-2.5 text-center">Semester</th>
                    <th className="px-3 py-2.5 text-center">Specialization</th>
                    <th className="px-3 py-2.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {validRows.map((row) => {
                    const specialization = MOCK_COURSE_BY_CODE.get(row.courseCode)?.specialization ?? null;
                    return (
                    <tr key={row.rowNumber} className="bg-white">
                      <td className="px-3 py-2.5 tabular-nums text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-gray-900">{row.courseCode}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="rounded-md bg-orange-50 px-2 py-0.5 font-bold text-[#C2410C]">
                          Sem {row.semesterNumber}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {specialization ? (
                          <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800">
                            {specialization}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400">Foundation</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="size-3.5" /> Ready
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                  {errorRows.map((row) => (
                    <tr key={row.rowNumber} className="bg-red-50/50">
                      <td className="px-3 py-2.5 tabular-nums text-gray-500">{row.rowNumber}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-red-700">{row.courseCode}</td>
                      <td className="px-3 py-2.5 text-center text-gray-500">Sem {row.semesterNumber}</td>
                      <td className="px-3 py-2.5 text-center text-gray-500">—</td>
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
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!preview || validRows.length === 0 || isConfirming}
            onClick={onConfirm}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-xs font-bold text-white shadow-[0_1px_2px_rgba(242,111,33,0.4)] transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60',
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
