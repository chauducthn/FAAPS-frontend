// src/modules/advising/components/chat/ChatComposer.tsx
// The reply composer of an advisor conversation: the public/internal toggle, the
// message box and the send button. The resolve panel (resolution summary) lives
// here too — it is the other writing surface of the thread.

import { CircleCheckBig, Lock, Send, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Props {
  /** True when the thread is closed — the composer is replaced by a notice. */
  isClosed: boolean;
  status: string;
  studentName: string;
  reply: string;
  internal: boolean;
  notice: string;
  busy: boolean;
  onReplyChange: (value: string) => void;
  onInternalChange: (value: boolean) => void;
  onSend: () => void;
}

export default function ChatComposer({
  isClosed,
  status,
  studentName,
  reply,
  internal,
  notice,
  busy,
  onReplyChange,
  onInternalChange,
  onSend,
}: Props) {
  return (
    <div className="border-t border-slate-200 bg-white p-5 sm:px-7">
      {isClosed ? (
        <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
          <Lock className="size-4 shrink-0" aria-hidden />
          This conversation is {status.toLowerCase()}. Replies are locked.
        </p>
      ) : (
        <>
          <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Message type">
            {(
              [
                { key: false, label: 'Public reply' },
                { key: true, label: 'Internal note' },
              ] as const
            ).map((t) => {
              const on = internal === t.key;
              return (
                <button
                  key={t.label}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => onInternalChange(t.key)}
                  className={cn(
                    'flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-all',
                    on
                      ? t.key
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white text-[#F26F21] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {t.key && <Lock className="size-3.5" aria-hidden />}
                  {t.label}
                </button>
              );
            })}
          </div>
          {internal && (
            <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              Hidden from the student — only advisors see this note.
            </p>
          )}
          <label className="sr-only" htmlFor="reply-box">
            {internal ? 'Write an internal note' : 'Write a reply to the student'}
          </label>
          <textarea
            id="reply-box"
            rows={3}
            maxLength={10000}
            value={reply}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder={
              internal ? 'Note for advisors, e.g. verified prerequisites against K17 plan...' : `Reply to ${studentName}...`
            }
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
          />
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600" role="status">
              {notice || (internal ? 'Sending as internal note.' : 'Sending as public reply.')}
            </p>
            <button
              type="button"
              onClick={onSend}
              disabled={busy || !reply.trim()}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden />
              {busy ? 'Sending…' : internal ? 'Save note' : 'Send reply'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Resolve panel ---------- */

interface ResolvePanelProps {
  summary: string;
  busy: boolean;
  onSummaryChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ChatResolvePanel({ summary, busy, onSummaryChange, onCancel, onConfirm }: ResolvePanelProps) {
  return (
    <div className="border-t border-emerald-200 bg-emerald-50/60 px-5 py-4 sm:px-7">
      <label className="block text-sm font-bold text-slate-900" htmlFor="resolution-summary">
        Resolution summary <span className="font-medium text-slate-600">(shared with the student)</span>
      </label>
      <textarea
        id="resolution-summary"
        rows={3}
        maxLength={10000}
        value={summary}
        onChange={(e) => onSummaryChange(e.target.value)}
        placeholder="Summarize the advice and next steps, e.g. Approved 18 credits for sem 9, OJT deferred to next term..."
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25"
      />
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || !summary.trim()}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <CircleCheckBig className="size-4" aria-hidden />
          {busy ? 'Resolving…' : 'Confirm resolve'}
        </button>
      </div>
    </div>
  );
}
