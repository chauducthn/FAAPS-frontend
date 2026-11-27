import type { ReactNode } from 'react';
import { Warning } from '@phosphor-icons/react';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/AiReportBits';
import type { AiReportDetail } from '../../types/admin';
import { REASON_LABEL } from './reportConstants';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">{label}</p>
      <div className="mt-1 text-[13px] font-semibold text-ink-primary">{children}</div>
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
    <section className="rounded-lg border border-line bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-primary">Reported Response Details</h2>
          <p className="mt-0.5 break-all text-xs text-ink-muted">
            Report <span className="font-mono font-semibold text-ink-secondary">#{shortReportId(report.id)}</span> · Logged{' '}
            <span className="tabular-nums">{formatDateTime(report.createdAt)}</span>
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>
      {pending && (
        <div className="mt-3.5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
          <Warning className="mt-0.5 size-4 shrink-0" weight="fill" aria-hidden />
          <span>
            Fix the root cause in the AI configuration or the curriculum/course documents, then resolve the report with a note.
          </span>
        </div>
      )}
      <div className="mt-4 grid gap-4 rounded-lg border border-line-soft bg-surface-page p-4 sm:grid-cols-3">
        <Field label="Report ID">
          <span className="break-all font-mono text-xs">{report.id}</span>
        </Field>
        <Field label="Student ID">
          <span className="font-mono">{report.studentCode ?? '—'}</span>
        </Field>
        <Field label="Student name">{report.studentName}</Field>
        <Field label="Reported at">
          <span className="tabular-nums">{formatDateTime(report.createdAt)}</span>
        </Field>
        <Field label="Reported responses">
          <span className="tabular-nums">{flaggedCount}</span>
        </Field>
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
    <section className="rounded-lg border border-line bg-white p-4 shadow-2xs sm:p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Student Report Details</h2>
      <p className="mt-2.5 text-sm font-semibold text-ink-primary">
        {report.studentName}
        {report.studentCode ? <span className="ml-1.5 font-mono text-xs text-ink-secondary">({report.studentCode})</span> : null}
      </p>
      <span className="mt-2 inline-block rounded-sm bg-red-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-red-700">
        {REASON_LABEL[report.reason] ?? report.reason}
      </span>
      <div className="mt-3 rounded-md border border-line-soft bg-surface-page p-3 text-[13px] text-ink-primary">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">Student note</p>
        <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink-secondary">
          {report.studentNote?.trim() ? report.studentNote : 'No note provided.'}
        </p>
      </div>
      {currentNote && (
        <div className="mt-3 rounded-md border border-brand/20 bg-brand-soft p-3 text-[13px] text-ink-primary">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink">
            Note on reported response {selectedIndex + 1}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">{currentNote}</p>
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
    <section className="rounded-lg border border-line bg-white p-4 shadow-2xs sm:p-5">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        Sources cited by retrieval
        {flaggedCount > 1 ? ` · response ${selectedIndex + 1} of ${flaggedCount}` : ''}
      </h2>
      {sources.length === 0 ? (
        <p className="mt-3 text-xs text-ink-muted">No sources were recorded for this response.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3.5">
          {sources.map((s, i) => (
            <li key={`${s.messageId}-${s.rankPosition ?? i}`} className="border-t border-line-soft pt-3.5 first:border-0 first:pt-0">
              {s.relevanceScore !== null && (
                <span className="rounded-sm bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-brand-ink">
                  Relevance {Number(s.relevanceScore).toFixed(2)}
                </span>
              )}
              <p className="mt-1.5 text-[13px] font-semibold text-ink-primary">{s.documentTitle ?? 'Untitled document'}</p>
              <p className="text-xs text-ink-muted">
                {s.sectionTitle ?? 'No section'}
                {s.rankPosition !== null ? ` · Rank #${s.rankPosition}` : ''}
              </p>
              {s.quotedText && (
                <blockquote className="mt-2 rounded-md border border-line-soft bg-surface-page p-3 text-xs leading-relaxed text-ink-secondary">
                  {s.quotedText}
                </blockquote>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
