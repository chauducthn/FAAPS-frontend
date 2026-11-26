// Transcript import workflow supporting Excel (.xlsx) and AI OCR uploads.

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileXls as FileSpreadsheet, Scan as ScanText, UploadSimple as Upload } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { studentAcademicService, type ImportPreview } from '../../academic/services/studentAcademicService';
import { TranscriptImportHistory } from './TranscriptImportHistory';
import { TranscriptImportPreview } from './TranscriptImportPreview';

const COLUMNS = ['CourseCode', 'SemesterCode', 'FinalScore', 'Status', 'AttemptNumber'];

type ImportMode = 'excel' | 'ocr';

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TranscriptImport() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useQuery({ queryKey: ['student', 'imports'], queryFn: studentAcademicService.importHistory });
  const [mode, setMode] = useState<ImportMode>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<ImportPreview | null>(null);

  const refreshAll = () =>
    Promise.all(['transcript', 'progress', 'imports'].map((key) => queryClient.invalidateQueries({ queryKey: ['student', key] })));

  const switchMode = (nextMode: ImportMode) => {
    setMode(nextMode);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const showPreview = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const result =
        mode === 'ocr'
          ? await studentAcademicService.importOcrPreview(file)
          : await studentAcademicService.importPreview(file);
      setPreview(result);
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
    } catch (error) {
      toast.error(apiMessage(error));
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#151c27]">Import Transcript</h2>
          <p className="mt-0.5 text-[13px] text-[#555f6f]">
            Upload an Excel file or a FAP screenshot/PDF (AI OCR), review the preview, then confirm.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchMode('excel')}
            className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5', mode === 'excel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600')}
          >
            <FileSpreadsheet className="size-3.5" /> Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => switchMode('ocr')}
            className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5', mode === 'ocr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600')}
          >
            <ScanText className="size-3.5" /> AI OCR (Image / PDF)
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {mode === 'excel' ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#555f6f]">
              <span>Columns:</span>
              {COLUMNS.map((column) => (
                <code key={column} className="rounded bg-[#f7f8fa] px-1.5 py-0.5 font-mono text-[11px] text-[#151c27]">
                  {column}
                </code>
              ))}
            </div>
            <p className="rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2 text-xs text-[#9a3412]">
              Tip: Use the <strong>FAAPS · FAP Transcript Exporter</strong> Chrome extension on your FAP Grade Report page to download a ready-to-import <code>.xlsx</code> file in one click.
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-[#555f6f]">
            Upload a clear FAP grade table screenshot (PNG, JPG, WEBP) or PDF up to 8 MB. Gemini OCR extracts rows for your review.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50">
            <Upload className="size-4" />
            {mode === 'ocr' ? 'Choose Image / PDF' : 'Choose XLSX file'}
            <input
              ref={inputRef}
              type="file"
              accept={mode === 'ocr' ? 'image/png,image/jpeg,image/webp,application/pdf' : '.xlsx'}
              aria-label={mode === 'ocr' ? 'Transcript OCR file' : 'Transcript XLSX'}
              className="hidden"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPreview(null);
              }}
            />
          </label>
          {file && <span className="text-[13px] text-[#151c27]">{file.name}</span>}
          <button
            type="button"
            disabled={!file || busy}
            onClick={showPreview}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
          >
            {busy && !preview ? (mode === 'ocr' ? 'Extracting with OCR...' : 'Reading...') : 'Preview'}
          </button>
        </div>

        {preview && (
          <TranscriptImportPreview
            preview={preview}
            busy={busy}
            onConfirm={confirm}
            onDownloadErrors={downloadErrors}
            onCancel={() => setPreview(null)}
          />
        )}
      </div>

      <TranscriptImportHistory
        entries={history.data}
        isError={history.isError}
        detail={detail}
        onOpenDetail={openDetail}
        onCloseDetail={() => setDetail(null)}
      />
    </section>
  );
}
