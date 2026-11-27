import type { RefObject } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { InlineAlert } from '../../../../shared/components/ui/InlineAlert';
import { formatDateTime } from '../../components/AiReportBits';
import type { AiReportDetail } from '../../types/admin';

const MAX_NOTE = 2000;
const isStudentSender = (sender: string) => /student|user/i.test(sender);

export function AiReportConversationPanel({
  report,
  messages,
  flagged,
  selected,
  listRef,
  onPrev,
  onNext,
}: {
  report: AiReportDetail['report'];
  messages: AiReportDetail['messages'];
  flagged: AiReportDetail['messages'];
  selected: number;
  listRef: RefObject<HTMLDivElement | null>;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <section className="flex min-h-[420px] flex-col rounded-lg border border-line bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          Related AI Conversation
        </h2>
        <p className="truncate font-mono text-xs text-ink-muted" title={report.conversationId}>
          Session: {report.conversationId.slice(0, 8)}
        </p>
      </div>
      <div ref={listRef} className="relative mt-3 flex max-h-[560px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="py-8 text-center text-xs text-ink-muted">No messages in this conversation.</p>}
        {messages.map((m) => {
          const mine = isStudentSender(m.sender);
          const index = flagged.findIndex((f) => f.id === m.id);
          const isSelected = index === selected && m.reported;
          return (
            <div key={m.id} data-message-id={m.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-primary">{mine ? report.studentName : 'FAAPS Academic Bot'}</span>
                <span className="tabular-nums text-ink-muted">{formatDateTime(m.createdAt)}</span>
              </div>
              <div
                className={cn(
                  'rounded-md px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap',
                  mine ? 'bg-surface-page text-ink-primary' : 'border border-line text-ink-primary',
                  m.reported && 'border-brand/30 bg-brand-soft',
                  isSelected && 'border-brand ring-1 ring-brand',
                )}
              >
                {m.reported && (
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-ink">
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
      <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] tabular-nums text-ink-subtle">
          Reported response {flagged.length === 0 ? 0 : selected + 1} of {flagged.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={selected === 0}
            onClick={onPrev}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-hover disabled:opacity-40"
          >
            <ArrowLeft className="size-3.5" /> Previous
          </button>
          <button
            type="button"
            disabled={selected + 1 >= flagged.length}
            onClick={onNext}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-brand px-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
          >
            Next <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function ResolutionSection({
  report,
  pending,
  note,
  error,
  onNoteChange,
}: {
  report: AiReportDetail['report'];
  pending: boolean;
  note: string;
  error: string | null;
  onNoteChange: (value: string) => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-2xs sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Resolution note</h2>
        {pending && <span className="text-xs font-medium text-red-600">* Required</span>}
      </div>
      {pending ? (
        <>
          <label className="mt-2.5 block text-[13px] font-medium text-ink-secondary" htmlFor="resolution-note">
            Root cause &amp; corrective action log
          </label>
          <textarea
            id="resolution-note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            maxLength={MAX_NOTE}
            rows={4}
            placeholder="Describe what was wrong and what you changed..."
            className="mt-1.5 w-full rounded-md border border-line bg-white p-3 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
          />
          <p className="mt-1 text-right text-[11px] tabular-nums text-ink-subtle">
            {note.length}/{MAX_NOTE}
          </p>
        </>
      ) : (
        <div className="mt-2.5 flex flex-col gap-2.5">
          <p className="text-xs text-ink-muted">
            This report was {report.status === 'RESOLVED' ? 'resolved' : 'dismissed'}
            {report.resolvedAt ? ` on ${formatDateTime(report.resolvedAt)}` : ''}.
          </p>
          <p className="whitespace-pre-wrap rounded-md border border-line-soft bg-surface-page p-3 text-[13px] text-ink-primary">
            {report.resolutionNote || 'No resolution note.'}
          </p>
        </div>
      )}
      {error && (
        <div className="mt-3">
          <InlineAlert tone="error" role="alert">
            <span className="text-xs">{error}</span>
          </InlineAlert>
        </div>
      )}
    </section>
  );
}
