import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/admin/AiReportBits';

import { useAiReport, useResolveAiReport } from '../../hooks/queries/useAdminAiReports';
import { apiErrorMessage } from '../../lib/apiError';
import { cn } from '@/lib/utils';

const MAX_NOTE = 2000;

/** Nhãn tiếng Việt cho lý do report (backend trả mã enum). */
const REASON_LABEL: Record<string, string> = {
  HALLUCINATION: 'Hallucination',
  OUTDATED_CURRICULUM: 'Outdated curriculum',
  IRRELEVANT_ANSWER: 'Irrelevant answer',
  INCOMPLETE_INFORMATION: 'Incomplete information',
  WRONG_COURSE_CODE: 'Wrong course code',
  MISSING_SOURCE: 'Missing source',
  POLICY_MISREAD: 'Policy misread',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#151c27]">{children}</div>
    </div>
  );
}

const isStudentSender = (sender: string) => /student|user/i.test(sender);

export default function AiReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAiReport(id);
  const resolve = useResolveAiReport();

  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const flagged = useMemo(() => (data?.messages ?? []).filter((m) => m.reported), [data]);
  const current = flagged[selected];
  const sources = useMemo(
    () => (data?.sources ?? []).filter((s) => s.messageId === current?.id),
    [data, current]
  );

  // Keep the selected reported response in view inside the conversation panel.
  useEffect(() => {
    if (!current || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-message-id="${current.id}"]`);
    if (el) listRef.current.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
  }, [current]);

  const back = (
    <Link to="/admin/ai-reports" className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
      <ChevronLeft className="size-4" />
      Back to Reported AI Responses
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#555f6f]">
          Could not load this report.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { report, messages } = data;
  const pending = report.status === 'PENDING';

  const submit = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!note.trim()) {
      setConfirmDismiss(false);
      return setError('A resolution note is required.');
    }
    setError(null);
    try {
      await resolve.mutateAsync({ id: report.id, status, resolutionNote: note.trim() });
      toast.success(status === 'RESOLVED' ? 'Report marked as resolved.' : 'Report dismissed.');
      setNote('');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setConfirmDismiss(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        {back}
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Report Details</h1>
      </div>



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
          <Field label="Reported responses">{flagged.length}</Field>
          <Field label="Reason">{REASON_LABEL[report.reason] ?? report.reason}</Field>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-6">
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
            {current?.studentNote && (
              <div className="mt-3 rounded-lg bg-[#fff7ed] p-3 text-[13px] text-[#151c27]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#f37021]">
                  Note on reported response {selected + 1}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{current.studentNote}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              3. Sources cited by retrieval
              {flagged.length > 1 ? ` · response ${selected + 1} of ${flagged.length}` : ''}
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
        </div>

        <section className="flex min-h-[420px] flex-col rounded-xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#151c27]">Related AI Conversation</h2>
            <p className="truncate pl-3 text-xs text-[#555f6f]" title={report.conversationId}>
              Session: {report.conversationId.slice(0, 8)}
            </p>
          </div>
          <div ref={listRef} className="relative mt-3 flex max-h-[560px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {messages.length === 0 && <p className="py-8 text-center text-sm text-[#555f6f]">No messages in this conversation.</p>}
            {messages.map((m) => {
              const mine = isStudentSender(m.sender);
              const index = flagged.findIndex((f) => f.id === m.id);
              const isSelected = index === selected && m.reported;
              return (
                <div key={m.id} data-message-id={m.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#151c27]">{mine ? report.studentName : 'FAAPS Academic Bot'}</span>
                    <span className="text-[#555f6f]">{formatDateTime(m.createdAt)}</span>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
                      mine ? 'bg-[#f7f8fa] text-[#151c27]' : 'border border-[#e7eefe] text-[#151c27]',
                      m.reported && 'border-[#fed7aa] bg-[#fff7ed]',
                      isSelected && 'border-2 border-[#f37021]'
                    )}
                  >
                    {m.reported && (
                      <span className="mb-1 block text-[11px] font-bold uppercase text-[#b45309]">
                        Reported {index + 1}
                        {isSelected ? ' · selected' : ''}
                      </span>
                    )}
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#e7eefe] pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              Reported response {flagged.length === 0 ? 0 : selected + 1} of {flagged.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={selected === 0}
                onClick={() => setSelected((s) => s - 1)}
                className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-semibold text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
              >
                <ArrowLeft className="size-3.5" /> Previous
              </button>
              <button
                type="button"
                disabled={selected + 1 >= flagged.length}
                onClick={() => setSelected((s) => s + 1)}
                className="flex items-center gap-1 rounded-lg bg-[#f37021] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-40"
              >
                Next <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#151c27]">4. Resolution note</h2>
          {pending && <span className="text-xs font-semibold text-[#b91c1c]">* Required</span>}
        </div>
        {pending ? (
          <>
            <label className="mt-3 block text-[13px] text-[#555f6f]" htmlFor="resolution-note">
              Root cause &amp; corrective action log
            </label>
            <textarea
              id="resolution-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={MAX_NOTE}
              rows={5}
              placeholder="Describe what was wrong and what you changed..."
              className="mt-2 w-full rounded-lg border border-[#e5e7eb] bg-[#eef2ff]/40 p-3 text-sm text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <p className="mt-1 text-right text-xs text-[#98a2b3]">
              {note.length}/{MAX_NOTE}
            </p>
          </>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-[13px] text-[#555f6f]">
              This report was {report.status === 'RESOLVED' ? 'resolved' : 'dismissed'}
              {report.resolvedAt ? ` on ${formatDateTime(report.resolvedAt)}` : ''}.
            </p>
            <p className="whitespace-pre-wrap rounded-lg bg-[#f7f8fa] p-3 text-sm text-[#151c27]">
              {report.resolutionNote || 'No resolution note.'}
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

      {pending && (
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <button
            type="button"
            onClick={() => (note.trim() ? setConfirmDismiss(true) : setError('A resolution note is required.'))}
            className="text-left text-sm font-semibold text-[#555f6f] hover:text-[#b91c1c]"
          >
            Dismiss report
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/ai-reports')}
              className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-[#151c27] hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resolve.isPending}
              onClick={() => submit('RESOLVED')}
              className="rounded-lg bg-[#f37021] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-60"
            >
              {resolve.isPending ? 'Saving...' : 'Save & mark as resolved'}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDismiss}
        title="Dismiss this report?"
        message="The report will be closed without a fix. Your note is saved as the reason it was dismissed."
        confirmLabel="Dismiss report"
        destructive
        isLoading={resolve.isPending}
        onConfirm={() => submit('DISMISSED')}
        onCancel={() => setConfirmDismiss(false)}
      />
    </div>
  );
}
