import type { ReactNode } from 'react';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/AiReportBits';
import type { AiReportDetail } from '../../types/admin';
import { REASON_LABEL } from './reportConstants';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#151c27]">{children}</div>
    </div>
  );
}

export function ReportSummaryCard({
  report,
  flaggedCount,
  pending,
}: {
  report: AiReportDetail['report'];
  flaggedCount: number;
  pending: boolean;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#151c27]">1. Reported Response Details</h2>
          <p className="mt-1 break-all text-[13px] text-[#555f6f]">
            Report #{shortReportId(report.id)} · Logged {formatDateTime(report.createdAt)}
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>
      {pending && (
        <p className="mt-4 rounded-lg bg-[#fffbeb] px-4 py-3 text-[13px] text-[#b45309]">
          Fix the root cause in the AI configuration or the curriculum/course documents, then resolve the report with a note.
        </p>
      )}
      <div className="mt-5 grid gap-4 rounded-lg bg-[#f7f8fa] p-4 sm:grid-cols-3">
        <Field label="Report ID">
          <span className="break-all">{report.id}</span>
        </Field>
        <Field label="Student ID">{report.studentCode ?? '—'}</Field>
        <Field label="Student name">{report.studentName}</Field>
        <Field label="Reported at">{formatDateTime(report.createdAt)}</Field>
        <Field label="Reported responses">{flaggedCount}</Field>
        <Field label="Reason">{REASON_LABEL[report.reason] ?? report.reason}</Field>
      </div>
    </section>
  );
}

export function StudentReportCard({
  report,
  currentNote,
  selectedIndex,
}: {
  report: AiReportDetail['report'];
  currentNote?: string | null;
  selectedIndex: number;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-[#151c27]">2. Student Report Details</h2>
      <p className="mt-3 text-base font-semibold text-[#151c27]">
        {report.studentName}
        {report.studentCode ? ` (${report.studentCode})` : ''}
      </p>
      <span className="mt-2 inline-block rounded bg-[#fef2f2] px-2 py-0.5 text-[11px] font-bold uppercase text-[#b91c1c]">
        {REASON_LABEL[report.reason] ?? report.reason}
      </span>
      <div className="mt-3 rounded-lg bg-[#eef2ff]/70 p-3 text-[13px] text-[#151c27]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Student note</p>
        <p className="mt-1 whitespace-pre-wrap">{report.studentNote?.trim() ? report.studentNote : 'No note provided.'}</p>
      </div>
      {currentNote && (
        <div className="mt-3 rounded-lg bg-[#fff7ed] p-3 text-[13px] text-[#151c27]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#f37021]">
            Note on reported response {selectedIndex + 1}
          </p>
          <p className="mt-1 whitespace-pre-wrap">{currentNote}</p>
        </div>
      )}
    </section>
  );
}

export function CitedSourcesCard({
  sources,
  selectedIndex,
  flaggedCount,
}: {
  sources: AiReportDetail['sources'];
  selectedIndex: number;
  flaggedCount: number;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
        3. Sources cited by retrieval
        {flaggedCount > 1 ? ` · response ${selectedIndex + 1} of ${flaggedCount}` : ''}
      </h2>
      {sources.length === 0 ? (
        <p className="mt-3 text-sm text-[#555f6f]">No sources were recorded for this response.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-4">
          {sources.map((s, i) => (
            <li key={`${s.messageId}-${s.rankPosition ?? i}`} className="border-t border-[#e7eefe] pt-4 first:border-0 first:pt-0">
              {s.relevanceScore !== null && (
                <span className="rounded bg-[#e0e7ff] px-2 py-0.5 text-[11px] font-semibold text-[#3730a3]">
                  Relevance: {Number(s.relevanceScore).toFixed(2)}
                </span>
              )}
              <p className="mt-2 text-sm font-semibold text-[#151c27]">{s.documentTitle ?? 'Untitled document'}</p>
              <p className="text-xs text-[#555f6f]">
                {s.sectionTitle ?? 'No section'}
                {s.rankPosition !== null ? ` · Rank #${s.rankPosition}` : ''}
              </p>
              {s.quotedText && (
                <blockquote className="mt-2 rounded-lg bg-[#eef2ff]/70 p-3 text-[13px] text-[#151c27]">{s.quotedText}</blockquote>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
