import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { studentAcademicService, type ImportPreview } from '../../academic/services/studentAcademicService';

export default function StudentTranscript() {
  const qc = useQueryClient();
  const transcript = useQuery({ queryKey: ['student', 'transcript'], queryFn: studentAcademicService.transcript });
  const progress = useQuery({ queryKey: ['student', 'progress'], queryFn: studentAcademicService.progress });
  const history = useQuery({ queryKey: ['student', 'imports'], queryFn: studentAcademicService.importHistory });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [historyDetail, setHistoryDetail] = useState<ImportPreview | null>(null);
  const showPreview = async () => {
    if (!file) return;
    setBusy(true); setError(''); setNotice('');
    try { setPreview(await studentAcademicService.importPreview(file)); await qc.invalidateQueries({ queryKey: ['student', 'imports'] }); }
    catch (cause) { setError(apiMessage(cause)); }
    finally { setBusy(false); }
  };
  const confirm = async () => {
    if (!preview || preview.errorCount) return;
    setBusy(true); setError('');
    try {
      const result = await studentAcademicService.confirmImport(preview.importId);
      setNotice(`${result.importedCount} transcript rows imported.`); setPreview(null); setFile(null);
      await Promise.all(['transcript', 'progress', 'imports'].map((key) => qc.invalidateQueries({ queryKey: ['student', key] })));
    } catch (cause) { setError(apiMessage(cause)); }
    finally { setBusy(false); }
  };
  return <div className="space-y-5">
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Academic progress</h2>
      {progress.isError ? <p role="alert">Could not load progress.</p> : progress.isLoading ? <p>Loading...</p> :
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
          <p>GPA: <strong>{progress.data?.currentGpa ?? 'Not available'}</strong></p>
          <p>Earned credits: <strong>{progress.data?.earnedCredits ?? 0}</strong></p>
          <p>Required credits: <strong>{progress.data?.requiredCredits ?? 0}</strong></p>
          <p>Completed courses: <strong>{progress.data?.completedCourses ?? 0}/{progress.data?.curriculumCourses ?? 0}</strong></p>
        </div>}
      {!!progress.data?.semesters.length && <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Semester</th><th className="p-2">Credits earned</th><th className="p-2">Semester GPA</th><th className="p-2">Cumulative GPA</th><th className="p-2">Standing</th></tr></thead><tbody>{progress.data.semesters.map((semester) => <tr key={semester.code} className="border-t"><td className="p-2">{semester.code} · {semester.name}</td><td className="p-2">{semester.creditsEarned}/{semester.creditsEnrolled}</td><td className="p-2">{semester.semesterGpa}</td><td className="p-2">{semester.cumulativeGpa}</td><td className="p-2">{semester.standing.replaceAll('_', ' ')}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Transcript</h2>
      {transcript.isLoading ? <p>Loading transcript...</p> : transcript.isError ? <p role="alert">Could not load transcript.</p>
        : transcript.data?.length ? <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Course</th><th className="p-2">Semester</th><th className="p-2">Score</th><th className="p-2">Status</th><th className="p-2">Attempt</th></tr></thead><tbody>
          {transcript.data.map((row) => <tr key={row.id} className="border-t"><td className="p-2">{row.courseCode} · {row.courseName}</td><td className="p-2">{row.semesterCode}</td><td className="p-2">{row.finalScore ?? '—'}</td><td className="p-2">{row.status.replaceAll('_', ' ')}</td><td className="p-2">{row.attemptNumber}</td></tr>)}
        </tbody></table></div> : <p className="mt-3 text-sm text-gray-600">No transcript records yet.</p>}
    </section>
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Import transcript</h2>
      <p className="mt-1 text-sm text-gray-600">Excel columns: CourseCode, SemesterCode, FinalScore, Status, AttemptNumber. Preview before confirming.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3"><input type="file" accept=".xlsx" aria-label="Transcript XLSX" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); }} />
        <button type="button" disabled={!file || busy} onClick={showPreview} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Preview</button></div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-2 text-sm text-green-700">{notice}</p>}
      {preview && <div className="mt-4 space-y-2"><p className="text-sm">{preview.rowCount} rows · {preview.errorCount} errors</p>
        <div className="max-h-72 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th>Row</th><th>Course</th><th>Semester</th><th>Score</th><th>Status</th><th>Issue</th></tr></thead><tbody>
          {preview.rows.map((row) => <tr key={row.rowNumber} className="border-t"><td>{row.rowNumber}</td><td>{row.courseCode}</td><td>{row.semesterCode}</td><td>{row.finalScore ?? '—'}</td><td>{row.status}</td><td className="text-red-700">{row.error ?? '—'}</td></tr>)}
        </tbody></table></div>
        <button disabled={busy || preview.errorCount > 0} onClick={confirm} className="rounded bg-orange-600 px-3 py-2 text-sm text-white disabled:opacity-50">Confirm import</button>
        {preview.errorCount > 0 && <button type="button" className="ml-2 text-sm font-semibold text-red-700 underline" onClick={async () => downloadErrors(preview.importId, setError)}>Download error report</button>}
      </div>}
      <h3 className="mt-5 font-semibold">Import history</h3>
      {history.isError ? <p className="text-sm text-red-700">Could not load import history.</p> : history.data?.length ? <ul className="mt-2 space-y-1 text-sm">{history.data.map((entry) => <li key={entry.id}>{entry.fileName} · {entry.status} · {entry.rowCount} rows · {entry.errorCount} errors · {new Date(entry.createdAt).toLocaleString()} <button className="text-orange-700 underline" onClick={async () => setHistoryDetail(await studentAcademicService.importDetail(entry.id))}>View detail</button>{entry.errorCount > 0 && <button className="ml-2 text-red-700 underline" onClick={() => downloadErrors(entry.id, setError)}>Download errors</button>}</li>)}</ul> : <p className="mt-2 text-sm text-gray-600">No imports yet.</p>}
      {historyDetail && <div className="mt-3 rounded border p-3"><button className="float-right text-sm underline" onClick={() => setHistoryDetail(null)}>Close</button><strong>Import detail · {historyDetail.rowCount} rows</strong><p className="text-sm text-gray-600">{historyDetail.errorCount} validation errors</p><div className="mt-3 max-h-72 overflow-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Row</th><th>Course</th><th>Semester</th><th>Score</th><th>Status</th><th>Validation</th></tr></thead><tbody>{historyDetail.rows.map((row) => <tr key={row.rowNumber} className="border-b"><td className="p-2">{row.rowNumber}</td><td>{row.courseCode}</td><td>{row.semesterCode}</td><td>{row.finalScore ?? '—'}</td><td>{row.status}</td><td className={row.error ? 'text-red-600' : 'text-green-700'}>{row.error ?? 'Valid'}</td></tr>)}</tbody></table></div></div>}
    </section>
  </div>;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

async function downloadErrors(id: string, setError: (message: string) => void) {
  try { download(await studentAcademicService.downloadImportErrors(id), 'transcript-import-errors.xlsx'); }
  catch { setError('Unable to download the transcript error report.'); }
}
