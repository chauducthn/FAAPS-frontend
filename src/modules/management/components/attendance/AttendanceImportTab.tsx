import { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { useAttendanceImportMutations, useAttendanceImports } from '../../hooks/queries/useAttendance';
import { attendanceErrorsCsv, attendanceTemplateCsv, TEMPLATE_HEADERS } from '../../services/attendance.service';
import type { AttendanceImportPreview, AttendanceResult } from '../../types/attendance';
import {
  AttendanceImportPreviewTable,
  downloadAttendanceCsv,
  ImportSummaryChip,
} from './AttendanceImportPreviewTable';

/** Upload a file, check the preview, confirm it, and see earlier imports. */
export function AttendanceImportTab() {
  const { preview, confirm } = useAttendanceImportMutations();
  const imports = useAttendanceImports();
  const [current, setCurrent] = useState<AttendanceImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setCurrent(null);
    try {
      setCurrent(await preview.mutateAsync(file));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    if (!current) return;
    try {
      const done = await confirm.mutateAsync(current.importId);
      toast.success(`Imported ${done.rowCount} row${done.rowCount === 1 ? '' : 's'}.`);
      setCurrent(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const count = (result: AttendanceResult) => current?.rows.filter((r) => r.result === result).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="upload" className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="upload" className="text-base font-semibold text-[#151c27]">
              Import attendance
            </h2>
            <p className="mt-0.5 max-w-[620px] text-sm text-[#555f6f]">
              One row per student, semester and course, with the columns: {TEMPLATE_HEADERS.join(', ')}. Each row is checked against the course&apos;s
              attendance condition. Importing a row again replaces the earlier numbers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadAttendanceCsv('attendance-template.csv', attendanceTemplateCsv())}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
            >
              <Download className="size-4" aria-hidden />
              Template
            </button>
            <label
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#f37021] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#d95f15]',
                preview.isPending && 'pointer-events-none opacity-60',
              )}
            >
              {preview.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              {preview.isPending ? 'Reading...' : 'Upload file'}
              <input
                type="file"
                accept=".csv,.xlsx"
                aria-label="Upload attendance file"
                className="sr-only"
                disabled={preview.isPending}
                onChange={(e) => {
                  void pick(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {current && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <FileSpreadsheet className="size-4 text-[#555f6f]" aria-hidden />
              <span className="text-sm font-semibold text-[#151c27]">{current.fileName}</span>
              <ImportSummaryChip label="Rows" value={current.rows.length} />
              <ImportSummaryChip label="Valid" value={current.validRows} className="bg-[#ecfdf5] text-[#047857]" />
              {current.errorRows > 0 && <ImportSummaryChip label="Errors" value={current.errorRows} className="bg-red-50 text-red-600" />}
              <ImportSummaryChip label="Warning" value={count('WARNING')} className="bg-[#fffbeb] text-[#b45309]" />
              <ImportSummaryChip label="Attendance fail" value={count('FAIL')} className="bg-red-50 text-red-600" />
            </div>
            <AttendanceImportPreviewTable rows={current.rows} />
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button type="button" onClick={() => setCurrent(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200">
                Cancel
              </button>
              {current.errorRows > 0 && (
                <button
                  type="button"
                  onClick={() => downloadAttendanceCsv('attendance-errors.csv', attendanceErrorsCsv(current))}
                  className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-50"
                >
                  Download errors
                </button>
              )}
              <button
                type="button"
                onClick={runConfirm}
                disabled={current.validRows === 0 || confirm.isPending}
                className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-50"
              >
                {confirm.isPending ? 'Importing...' : `Import ${current.validRows} valid row${current.validRows === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="history" className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <h2 id="history" className="text-base font-semibold text-[#151c27]">
          Import history
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[#e7eefe]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-[rgba(240,243,255,0.7)] text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Rows</th>
                <th className="px-4 py-3">Warnings</th>
                <th className="px-4 py-3">Attendance fails</th>
                <th className="px-4 py-3">Imported at</th>
              </tr>
            </thead>
            <tbody>
              {(imports.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#555f6f]">
                    {imports.isLoading ? 'Loading...' : 'No attendance has been imported yet.'}
                  </td>
                </tr>
              ) : (
                imports.data?.map((h) => (
                  <tr key={h.id} className="border-t border-[#e7eefe]">
                    <td className="px-4 py-3 font-semibold text-[#151c27]">{h.fileName}</td>
                    <td className="px-4 py-3 text-[#151c27]">{h.rowCount}</td>
                    <td className="px-4 py-3 text-[#b45309]">{h.warningCount}</td>
                    <td className="px-4 py-3 text-red-600">{h.failCount}</td>
                    <td className="px-4 py-3 text-[#555f6f]">{new Date(h.confirmedAt).toLocaleString('en-GB')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
