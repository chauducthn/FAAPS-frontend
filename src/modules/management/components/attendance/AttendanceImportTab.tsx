import { Clock, FileXls as FileSpreadsheet } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiErrorMessage } from '../../../../shared/lib/apiError';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import { useAttendanceImports } from '../../hooks/queries/useAttendance';
import { attendanceErrorsCsv } from '../../services/attendance.service';
import type { AttendanceImportHistoryItem, AttendanceImportPreview, AttendanceResult } from '../../types/attendance';
import { AttendanceImportPreviewTable, downloadAttendanceCsv, ImportSummaryChip } from './AttendanceImportPreviewTable';

const importHistoryColumns: StaticColumn<AttendanceImportHistoryItem>[] = [
  {
    key: 'fileName', header: 'File',
    render: (record) => (
      <span className="inline-flex items-center gap-2 font-semibold text-ink-primary">
        <FileSpreadsheet className="size-4 shrink-0 text-brand" aria-hidden />
        {record.fileName}
      </span>
    ),
  },
  { key: 'rowCount', header: 'Rows', align: 'right', render: (r) => <span className="font-medium tabular-nums text-ink-secondary">{r.rowCount}</span> },
  {
    key: 'warningCount', header: 'Warnings', align: 'right',
    render: (r) => (
      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums', r.warningCount > 0 ? 'bg-amber-50 text-amber-700' : 'text-ink-subtle')}>
        {r.warningCount}
      </span>
    ),
  },
  {
    key: 'failCount', header: 'Attendance fails', align: 'right',
    render: (r) => (
      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums', r.failCount > 0 ? 'bg-red-50 text-red-600' : 'text-ink-subtle')}>
        {r.failCount}
      </span>
    ),
  },
  {
    key: 'confirmedAt', header: 'Imported at',
    render: (r) => <span className="tabular-nums text-ink-muted">{new Date(r.confirmedAt).toLocaleString('en-GB')}</span>,
  },
];

interface AttendanceImportTabProps {
  current: AttendanceImportPreview | null;
  error: string | null;
  isConfirming: boolean;
  onConfirm: (importId: string) => Promise<{ rowCount: number }>;
  onClearCurrent: () => void;
  onError: (message: string | null) => void;
}

/** Review an uploaded attendance preview, confirm it, and inspect earlier imports. */
export function AttendanceImportTab({
  current,
  error,
  isConfirming,
  onConfirm,
  onClearCurrent,
  onError,
}: AttendanceImportTabProps) {
  const imports = useAttendanceImports();

  const runConfirm = async () => {
    if (!current) return;
    try {
      const done = await onConfirm(current.importId);
      toast.success(`Imported ${done.rowCount} row${done.rowCount === 1 ? '' : 's'}.`);
      onClearCurrent();
    } catch (err) {
      onError(apiErrorMessage(err));
    }
  };

  const count = (result: AttendanceResult) => current?.rows.filter((r) => r.result === result).length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-lg border border-red-200/80 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}

      {current && (
        <section className="flex flex-col gap-3 rounded-lg border border-line/80 bg-white p-4 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <FileSpreadsheet className="size-4 text-brand" aria-hidden />
            <span className="text-sm font-semibold text-ink-primary">{current.fileName}</span>
            <ImportSummaryChip label="Rows" value={current.rows.length} />
            <ImportSummaryChip label="Valid" value={current.validRows} className="bg-emerald-50 text-emerald-700" />
            {current.errorRows > 0 && <ImportSummaryChip label="Errors" value={current.errorRows} className="bg-red-50 text-red-600" />}
            <ImportSummaryChip label="Warning" value={count('WARNING')} className="bg-amber-50 text-amber-700" />
            <ImportSummaryChip label="Attendance fail" value={count('FAIL')} className="bg-red-50 text-red-600" />
          </div>
          <AttendanceImportPreviewTable rows={current.rows} />
          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <button type="button" onClick={onClearCurrent} className="h-9 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-ink-secondary hover:bg-surface-hover">
              Cancel
            </button>
            {current.errorRows > 0 && (
              <button type="button" onClick={() => downloadAttendanceCsv('attendance-errors.csv', attendanceErrorsCsv(current))} className="h-9 rounded-lg border border-line bg-white px-4 text-[13px] font-semibold text-ink-secondary hover:bg-surface-hover">
                Download errors
              </button>
            )}
            <button type="button" onClick={runConfirm} disabled={current.validRows === 0 || isConfirming} className="h-9 rounded-lg bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-hover disabled:opacity-50">
              {isConfirming ? 'Importing…' : `Import ${current.validRows} valid row${current.validRows === 1 ? '' : 's'}`}
            </button>
          </div>
        </section>
      )}

      <section aria-labelledby="history" className="overflow-hidden rounded-lg border border-line/80 bg-white shadow-2xs">
        <div className="flex items-center gap-2 border-b border-line-soft px-5 py-3.5">
          <Clock className="size-4 text-brand" aria-hidden />
          <h2 id="history" className="text-sm font-bold text-ink-primary">Import history</h2>
        </div>
        <div className="flex admin-fill flex-col">
          <StaticTable
            stickyHeader
            className="min-h-0 flex-1 overflow-auto"
            columns={importHistoryColumns}
            rows={imports.data ?? []}
            rowKey={(record) => record.id}
            loading={imports.isLoading}
            emptyTitle="No attendance has been imported yet."
            minWidth="560px"
          />
        </div>
      </section>
    </div>
  );
}
