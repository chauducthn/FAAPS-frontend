// Import XLSX — Preview & Confirm modal for the Courses catalogue.
import {
  CheckCircle as CheckCircle2,
  DownloadSimple,
  FileXls as FileSpreadsheet,
  SpinnerGap as Loader2,
  UploadSimple as Upload,
  Warning as AlertTriangle,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { Modal } from '../../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../../shared/components/ui/ModalParts';
import { StaticTable, type StaticColumn } from '../../../../shared/components/common/table/StaticTable';
import type { CourseImportPreview, CourseImportRow } from '../../../academic/types/course';

interface Props {
  open: boolean;
  fileName: string;
  preview: CourseImportPreview | null;
  isConfirming?: boolean;
  isReading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDownloadErrors?: () => void;
}

const columns: StaticColumn<CourseImportRow>[] = [
  {
    key: 'rowNumber',
    header: 'Row',
    render: (row) => <span className="tabular-nums text-ink-muted">{row.rowNumber}</span>,
  },
  {
    key: 'code',
    header: 'Code',
    render: (row) => (
      <span className={row.errors.length > 0 ? 'font-mono font-semibold text-red-700' : 'font-mono font-semibold text-ink-primary'}>
        {row.code || '—'}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Course name',
    render: (row) => (
      <span className="block max-w-[220px] truncate text-ink-primary" title={row.name}>
        {row.name || '—'}
      </span>
    ),
  },
  {
    key: 'credits',
    header: 'Credits',
    align: 'center',
    render: (row) => (
      <span
        className={
          row.errors.length > 0
            ? 'tabular-nums text-ink-muted'
            : 'rounded-sm bg-brand-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-ink'
        }
      >
        {row.credits}
      </span>
    ),
  },
  {
    key: 'courseStatus',
    header: 'Status',
    render: (row) => (
      <span className={cn('text-xs font-semibold', (row.courseStatus ?? 'ACTIVE') === 'INACTIVE' ? 'text-ink-muted' : 'text-emerald-700')}>
        {(row.courseStatus ?? 'ACTIVE') === 'INACTIVE' ? 'Inactive' : 'Active'}
      </span>
    ),
  },
  {
    key: 'prerequisites',
    header: 'Prerequisites',
    render: (row) => <span className="font-mono text-xs text-ink-muted">{row.prerequisites || '—'}</span>,
  },
  {
    key: 'result',
    header: 'Result',
    render: (row) =>
      row.errors.length === 0 ? (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
          <CheckCircle2 className="size-3.5" weight="fill" /> Ready
        </span>
      ) : (
        <span className="flex flex-col gap-0.5">
          {row.errors.map((error) => (
            <span key={error} className="flex items-start gap-1 text-[11px] font-medium text-red-600">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" weight="fill" /> {error}
            </span>
          ))}
        </span>
      ),
  },
];

const PREVIEW_CAP = 200;

export default function CourseImportPreviewModal({
  open,
  fileName,
  preview,
  isConfirming,
  isReading,
  onClose,
  onConfirm,
  onDownloadErrors,
}: Props) {
  const rows = preview?.items ?? [];
  const validCount = preview?.validRows ?? 0;
  const displayRows =
    rows.length <= PREVIEW_CAP
      ? rows
      : [...rows.filter((r) => r.errors.length > 0), ...rows.filter((r) => r.errors.length === 0)].slice(0, PREVIEW_CAP);

  return (
    <Modal open={open} onClose={onClose} title="Preview course import" className="max-w-3xl">
      <ModalHeader
        icon={<FileSpreadsheet aria-hidden />}
        tone="brand"
        title="Preview import"
        description={`${fileName} · ${preview?.totalRows ?? 0} rows read`}
        onClose={onClose}
      />

      {!preview || isReading ? (
        <ModalBody className="space-y-3 py-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-line-soft" />
          ))}
          <p className="text-center text-xs font-medium text-ink-subtle">Reading spreadsheet…</p>
        </ModalBody>
      ) : (
        <ModalBody className="flex max-h-[60vh] flex-col gap-3 overflow-hidden">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200/80 tabular-nums">
              <CheckCircle2 className="size-3.5" weight="fill" /> {preview.validRows} valid
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200/80 tabular-nums">
              <AlertTriangle className="size-3.5" weight="fill" /> {preview.errorRows} error
            </span>
            <span className="ml-auto text-xs text-ink-muted">
              {rows.length > PREVIEW_CAP
                ? `Showing first ${PREVIEW_CAP} of ${rows.length} rows · all ${validCount} valid rows import on Confirm.`
                : 'Only valid rows will be imported on Confirm.'}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line">
            <StaticTable
              columns={columns}
              rows={displayRows}
              rowKey={(row) => String(row.rowNumber)}
              stickyHeader
              className="min-h-0 flex-1 overflow-y-auto [&_thead_th]:shadow-[inset_0_-1px_0_var(--line)]"
              emptyTitle="No rows to import"
              emptyDescription="The spreadsheet did not contain any course row."
            />
          </div>
        </ModalBody>
      )}

      <ModalFooter
        start={
          preview?.errorRows && onDownloadErrors ? (
            <button
              type="button"
              onClick={onDownloadErrors}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline"
            >
              <DownloadSimple className="size-3.5" /> Download error report (CSV)
            </button>
          ) : (
            <span>Error rows are skipped automatically.</span>
          )
        }
      >
        <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!preview || validCount === 0 || isConfirming || isReading}
          onClick={onConfirm}
          className={modalButtonClass('primary')}
        >
          {isConfirming ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {`Confirm · import ${validCount} rows`}
        </button>
      </ModalFooter>
    </Modal>
  );
}
