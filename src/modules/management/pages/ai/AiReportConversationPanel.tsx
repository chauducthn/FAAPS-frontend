import type { RefObject } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { formatDateTime } from '../../components/AiReportBits';
import type { AiReportDetail } from '../../types/admin';
import { cn } from '@/shared/lib/utils';

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
                  isSelected && 'border-2 border-[#f37021]',
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
            onClick={onPrev}
            className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm font-semibold text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
          >
            <ArrowLeft className="size-3.5" /> Previous
          </button>
          <button
            type="button"
            disabled={selected + 1 >= flagged.length}
            onClick={onNext}
            className="flex items-center gap-1 rounded-lg bg-[#f37021] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d95f15] disabled:opacity-40"
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
            onChange={(e) => onNoteChange(e.target.value)}
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
  );
}
