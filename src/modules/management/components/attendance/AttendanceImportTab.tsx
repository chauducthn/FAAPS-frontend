import { useState, type DragEvent } from 'react';
import { Clock, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { useAttendanceImportMutations, useAttendanceImports } from '../../hooks/queries/useAttendance';
import { attendanceErrorsCsv, attendanceTemplateCsv, TEMPLATE_HEADERS } from '../../services/attendance.service';
import type { AttendanceImportHistoryItem, AttendanceImportPreview, AttendanceResult } from '../../types/attendance';
import { AttendanceImportPreviewTable, downloadAttendanceCsv, ImportSummaryChip } from './AttendanceImportPreviewTable';

const importHistoryColumns: StaticColumn<AttendanceImportHistoryItem>[] = [
  {
    key: 'fileName', header: 'File',
    render: (record) => (
      <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
        <FileSpreadsheet className="size-4 shrink-0 text-[#F26F21]" aria-hidden />
        {record.fileName}
      </span>
    ),
  },
  { key: 'rowCount', header: 'Rows', align: 'right', render: (r) => <span className="font-medium tabular-nums text-gray-700">{r.rowCount}</span> },
  {
    key: 'warningCount', header: 'Warnings', align: 'right',
    render: (r) => (
      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums', r.warningCount > 0 ? 'bg-amber-50 text-amber-700' : 'text-gray-400')}>
        {r.warningCount}
      </span>
    ),
  },
  {
    key: 'failCount', header: 'Attendance fails', align: 'right',
    render: (r) => (
      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums', r.failCount > 0 ? 'bg-red-50 text-red-600' : 'text-gray-400')}>
        {r.failCount}
      </span>
    ),
  },
  {
    key: 'confirmedAt', header: 'Imported at',
    render: (r) => <span className="tabular-nums text-gray-500">{new Date(r.confirmedAt).toLocaleString('en-GB')}</span>,
  },
];

/** Upload a file, check the preview, confirm it, and see earlier imports. */
export function AttendanceImportTab() {
  const { preview, confirm } = useAttendanceImportMutations();
  const imports = useAttendanceImports();
  const [current, setCurrent] = useState<AttendanceImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

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

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    void pick(e.dataTransfer.files?.[0]);
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
      <section aria-labelledby="upload" className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
          <div>
            <h2 id="upload" className="text-sm font-bold text-gray-900">Import attendance</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              One row per student, semester, and course. Re-importing a row updates the earlier record.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadAttendanceCsv('attendance-template.csv', attendanceTemplateCsv())}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs hover:bg-gray-50"
          >
            <Download className="size-4 text-gray-500" aria-hidden /> Template
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex flex-col items-center justify-between gap-4 rounded-xl border-2 border-dashed px-5 py-5 transition-colors sm:flex-row',
              dragging ? 'border-[#F26F21] bg-orange-50/50' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300',
            )}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]">
                <Upload className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900">Drop a CSV or Excel (.xlsx) attendance sheet here</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {TEMPLATE_HEADERS.map((h) => (
                    <span key={h} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200">{h}</span>
                  ))}
                </div>
              </div>
            </div>
            <label className={cn('inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white shadow-2xs hover:bg-[#e05f14]', preview.isPending && 'pointer-events-none opacity-60')}>
              {preview.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              {preview.isPending ? 'Reading…' : 'Upload file'}
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

          {error && (
            <p role="alert" className="rounded-xl border border-red-200/80 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">
              {error}
            </p>
          )}

          {current && (
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-gray-50/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <FileSpreadsheet className="size-4 text-[#F26F21]" aria-hidden />
                <span className="text-sm font-semibold text-gray-900">{current.fileName}</span>
                <ImportSummaryChip label="Rows" value={current.rows.length} />
                <ImportSummaryChip label="Valid" value={current.validRows} className="bg-emerald-50 text-emerald-700" />
                {current.errorRows > 0 && <ImportSummaryChip label="Errors" value={current.errorRows} className="bg-red-50 text-red-600" />}
                <ImportSummaryChip label="Warning" value={count('WARNING')} className="bg-amber-50 text-amber-700" />
                <ImportSummaryChip label="Attendance fail" value={count('FAIL')} className="bg-red-50 text-red-600" />
              </div>
              <AttendanceImportPreviewTable rows={current.rows} />
              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button type="button" onClick={() => setCurrent(null)} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                {current.errorRows > 0 && (
                  <button type="button" onClick={() => downloadAttendanceCsv('attendance-errors.csv', attendanceErrorsCsv(current))} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
                    Download errors
                  </button>
                )}
                <button type="button" onClick={runConfirm} disabled={current.validRows === 0 || confirm.isPending} className="h-9 rounded-lg bg-[#F26F21] px-4 text-[13px] font-semibold text-white hover:bg-[#e05f14] disabled:opacity-50">
                  {confirm.isPending ? 'Importing…' : `Import ${current.validRows} valid row${current.validRows === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="history" className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
          <Clock className="size-4 text-[#F26F21]" aria-hidden />
          <h2 id="history" className="text-sm font-bold text-gray-900">Import history</h2>
        </div>
        <div className="p-4 sm:p-5">
          <StaticTable columns={importHistoryColumns} rows={imports.data ?? []} rowKey={(record) => record.id} loading={imports.isLoading} emptyTitle="No attendance has been imported yet." minWidth="560px" />
        </div>
      </section>
    </div>
  );
}
