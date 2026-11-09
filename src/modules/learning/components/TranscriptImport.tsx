// Student / Transcript: import the grades from an Excel file (preview first, then confirm).
// The backend refuses to confirm a preview that still has invalid rows, so every error has to be fixed in the file.

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { studentAcademicService, type ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptStatusBadge } from './TranscriptRecords';

const COLUMNS = ['CourseCode', 'SemesterCode', 'FinalScore', 'Status', 'AttemptNumber'];

const formatDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function RowsTable({ preview }: { preview: ImportPreview }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-[#e5e7eb]">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 bg-[#f7f8fa] text-[11px] font-semibold uppercase tracking-wide text-[#555f6f]">
          <tr>
            <th className="px-3 py-2">Row</th>
            <th className="px-3 py-2">Course</th>
            <th className="px-3 py-2">Semester</th>
            <th className="px-3 py-2 text-right">Score</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Attempt</th>
            <th className="px-3 py-2">Issue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">
          {preview.rows.map((row) => (
            <tr key={row.rowNumber} className={cn(row.error && 'bg-red-50')}>
              <td className="px-3 py-2 tabular-nums">{row.rowNumber}</td>
              <td className="px-3 py-2 font-semibold text-[#151c27]">{row.courseCode}</td>
              <td className="px-3 py-2">{row.semesterCode}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.finalScore ?? '—'}</td>
              <td className="px-3 py-2">
                <TranscriptStatusBadge status={row.status} />
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{row.attemptNumber}</td>
              <td className="px-3 py-2 text-red-700">{row.error ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TranscriptImport() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useQuery({ queryKey: ['student', 'imports'], queryFn: studentAcademicService.importHistory });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<ImportPreview | null>(null);

  const refreshAll = () =>
    Promise.all(['transcript', 'progress', 'imports'].map((key) => queryClient.invalidateQueries({ queryKey: ['student', key] })));

  const showPreview = async () => {
    if (!file) return;
    setBusy(true);
    try {
      setPreview(await studentAcademicService.importPreview(file));
      await queryClient.invalidateQueries({ queryKey: ['student', 'imports'] });
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!preview || preview.errorCount) return;
    setBusy(true);
    try {
      const result = await studentAcademicService.confirmImport(preview.importId);
      toast.success(`${result.importedCount} transcript row(s) imported`);
      setPreview(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      await refreshAll();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const downloadErrors = async (id: string) => {
    try {
      download(await studentAcademicService.downloadImportErrors(id), 'transcript-import-errors.xlsx');
    } catch {
      toast.error('Unable to download the transcript error report.');
    }
  };

  const openDetail = async (id: string) => {
    try {
      setDetail(await studentAcademicService.importDetail(id));
    } catch (error) {
      toast.error(apiMessage(error));
    }
  };

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-[#f1f5f9] px-5 py-4">
        <h2 className="text-sm font-semibold text-[#151c27]">Import Transcript</h2>
        <p className="mt-0.5 text-[13px] text-[#555f6f]">Upload an Excel file with your grades, check the preview, then confirm.</p>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#555f6f]">
          <span>Columns:</span>
          {COLUMNS.map((column) => (
            <code key={column} className="rounded bg-[#f7f8fa] px-1.5 py-0.5 font-mono text-[11px] text-[#151c27]">
              {column}
            </code>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50">
            <Upload className="size-4" />
            Choose XLSX file
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              aria-label="Transcript XLSX"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
              }}
            />
          </label>
          {file && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#151c27]">
              <FileSpreadsheet className="size-4 text-[#98a2b3]" />
              {file.name}
            </span>
          )}
          <button
            type="button"
            disabled={!file || busy}
            onClick={showPreview}
            className="rounded-lg bg-[#F26F21] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && !preview ? 'Reading...' : 'Preview'}
          </button>
        </div>

        {preview && (
          <div className="space-y-3">
            <p className="text-[13px] text-[#151c27]">
              <strong>{preview.rowCount}</strong> row(s) ·{' '}
              <strong className={preview.errorCount ? 'text-red-700' : 'text-emerald-700'}>{preview.errorCount}</strong> error(s)
            </p>
            <RowsTable preview={preview} />
            {preview.errorCount > 0 && (
              <p className="text-[13px] text-red-700">Fix the rows marked in red in your file and preview it again. The import is only possible when every row is valid.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy || preview.errorCount > 0}
                onClick={confirm}
                className="rounded-lg bg-[#F26F21] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Importing...' : `Confirm import (${preview.rowCount})`}
              </button>
              {preview.errorCount > 0 && (
                <button type="button" onClick={() => downloadErrors(preview.importId)} className="text-[13px] font-semibold text-red-700 underline">
                  Download error report
                </button>
              )}
              <button type="button" onClick={() => setPreview(null)} className="text-[13px] font-semibold text-[#555f6f] underline">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#f1f5f9] px-5 py-4">
        <h3 className="text-[13px] font-semibold text-[#151c27]">Import history</h3>
        {history.isError ? (
          <p className="mt-2 text-[13px] text-red-700">Could not load the import history.</p>
        ) : !history.data?.length ? (
          <p className="mt-2 text-[13px] text-[#555f6f]">No imports yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-[#f1f5f9]">
            {history.data.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[13px]">
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#151c27]">{entry.fileName}</p>
                  <p className="text-[12px] text-[#98a2b3]">
                    {formatDateTime(entry.createdAt)} · {entry.rowCount} row(s) · {entry.errorCount} error(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                      entry.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 ring-emerald-200' : 'bg-gray-100 text-gray-700 ring-gray-200'
                    )}
                  >
                    {entry.status === 'CONFIRMED' ? 'Confirmed' : 'Preview only'}
                  </span>
                  <button type="button" onClick={() => openDetail(entry.id)} className="font-semibold text-[#F26F21] hover:underline">
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {detail && (
          <div className="mt-3 space-y-2 rounded-lg border border-[#e5e7eb] p-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#151c27]">
                Import detail · {detail.rowCount} row(s), {detail.errorCount} error(s)
              </p>
              <button type="button" onClick={() => setDetail(null)} className="text-[13px] font-semibold text-[#555f6f] underline">
                Close
              </button>
            </div>
            <RowsTable preview={detail} />
          </div>
        )}
      </div>
    </section>
  );
}
