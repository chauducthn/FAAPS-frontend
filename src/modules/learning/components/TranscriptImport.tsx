// Simplified Excel-only Transcript Import with version history switching.

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, DownloadSimple, FileXls, UploadSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { studentAcademicService, type ImportHistory, type ImportPreview } from '../../academic/services/studentAcademicService';
import { STUDENT_QUERY_KEYS } from '../hooks/queries/useStudentQueries';
import { TranscriptImportHistory } from './TranscriptImportHistory';
import { TranscriptImportPreview } from './TranscriptImportPreview';

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TranscriptImport({ compact = false }: { compact?: boolean } = {}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useQuery({ queryKey: ['student', 'imports'], queryFn: studentAcademicService.importHistory });
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<ImportPreview | null>(null);

  const refreshAll = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all }),
      queryClient.invalidateQueries({ queryKey: ['student', 'imports'] }),
    ]);

  const resetFile = () => {
    setPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const notifySuccess = (msg: string) => {
    setLastSuccess(msg);
    toast.success(msg);
  };

  const runBusy = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const runImport = () => file && runBusy(async () => {
    setLastSuccess(null);
    const result = await studentAcademicService.importPreview(file);
    if (result.errorCount === 0 && result.rowCount > 0) {
      const confirmed = await studentAcademicService.confirmImport(result.importId, false);
      notifySuccess(`Imported ${confirmed.importedCount} course(s). GPA, credits, and curriculum updated.`);
      resetFile();
      await refreshAll();
    } else {
      setPreview(result);
      toast.warning(`Found ${result.rowCount - result.errorCount} valid row(s) and ${result.errorCount} error(s).`);
      await queryClient.invalidateQueries({ queryKey: ['student', 'imports'] });
    }
  });

  const confirm = (skipErrors = false) => preview && (skipErrors || preview.errorCount === 0) && runBusy(async () => {
    const result = await studentAcademicService.confirmImport(preview.importId, skipErrors);
    notifySuccess(`Imported ${result.importedCount} course(s). GPA, credits, and curriculum updated.`);
    resetFile();
    await refreshAll();
  });

  const activateVersion = (entry: ImportHistory) => runBusy(async () => {
    const result = await studentAcademicService.activateImport(entry.id);
    notifySuccess(`Switched active transcript to "${entry.fileName}" (${result.importedCount} rows).`);
    await refreshAll();
  });

  const deleteVersion = (entry: ImportHistory) => runBusy(async () => {
    await studentAcademicService.deleteImport(entry.id);
    if (detail?.importId === entry.id) setDetail(null);
    if (preview?.importId === entry.id) setPreview(null);
    toast.success(`Deleted import version "${entry.fileName}".`);
    await queryClient.invalidateQueries({ queryKey: ['student', 'imports'] });
  });

  const downloadTemplate = async () => {
    try { download(await studentAcademicService.downloadImportTemplate(), 'faaps-transcript-template.xlsx'); }
    catch (error) { toast.error(apiMessage(error)); }
  };

  const downloadErrors = async (id: string) => {
    try { download(await studentAcademicService.downloadImportErrors(id), 'transcript-import-errors.xlsx'); }
    catch (error) { toast.error(apiMessage(error)); }
  };

  const openDetail = async (id: string) => {
    try { setDetail(await studentAcademicService.importDetail(id)); }
    catch (error) { toast.error(apiMessage(error)); }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 ${compact ? 'px-4 py-3' : 'px-6 py-4'}`}>
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <FileXls className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Import Transcript (.xlsx)</h2>
            <p className="text-xs text-gray-500">Upload your FPTU transcript Excel file or switch between saved versions.</p>
          </div>
        </div>
        <button type="button" onClick={downloadTemplate} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:border-orange-300 hover:text-[#C2410C]">
          <DownloadSimple className="size-3.5" /> Template
        </button>
      </div>

      <div className={compact ? 'space-y-3 p-4' : 'space-y-4 p-6'}>
        {lastSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle className="size-4 shrink-0 text-emerald-600" weight="fill" />
            <span>{lastSuccess}</span>
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            setFile(e.dataTransfer.files?.[0] ?? null);
            setPreview(null);
          }}
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 transition-colors',
            dragOver ? 'border-[#F26F21] bg-orange-50/40' : 'border-gray-200 bg-gray-50/40 hover:border-orange-300',
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <UploadSimple className="size-5 shrink-0 text-[#F26F21]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-800">{file ? file.name : 'Drop your transcript .xlsx file here or browse'}</p>
              <p className="text-[11px] text-gray-400">Supports .xlsx up to 5 MB · Pass/Fail courses without scores are supported</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:border-orange-300 hover:text-[#C2410C]">
              {file ? 'Change' : 'Choose file'}
              <input ref={inputRef} type="file" accept=".xlsx" aria-label="Transcript XLSX" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); }} />
            </label>
            <button type="button" disabled={!file || busy} onClick={runImport} className="inline-flex h-8 items-center rounded-lg bg-[#F26F21] px-4 text-xs font-bold text-white hover:bg-[#e05f14] disabled:opacity-50">
              {busy && !preview ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>

        {preview && (
          <TranscriptImportPreview preview={preview} busy={busy} onConfirm={confirm} onDownloadErrors={downloadErrors} onCancel={() => setPreview(null)} />
        )}
      </div>

      <TranscriptImportHistory
        entries={history.data} isError={history.isError} busy={busy} detail={detail}
        onOpenDetail={openDetail} onActivateVersion={activateVersion} onDeleteVersion={deleteVersion} onCloseDetail={() => setDetail(null)}
      />
    </section>
  );
}
