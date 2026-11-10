// src/modules/advising/components/chat/ChatMessageList.tsx
// The scrollable message thread of an advisor conversation.
// Public replies render as chat bubbles, internal notes render as dashed amber cards.

import { type RefObject } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { formatStamp } from './format';

/** One message of the thread. */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  internal: boolean;
  createdAt: string;
}

interface Props {
  messages: ChatMessage[];
  /** Name of the advisor who owns the thread — messages from them align right. */
  advisorName: string | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Scroll container ref so the page can keep the thread pinned to the bottom. */
  threadRef: RefObject<HTMLDivElement | null>;
}

export default function ChatMessageList({
  messages,
  advisorName,
  isLoading,
  isError,
  onRetry,
  threadRef,
}: Props) {
  return (
    <div ref={threadRef} className="max-h-[460px] flex-1 space-y-4 overflow-y-auto bg-[#fafbfc] p-5 sm:px-7" aria-live="polite">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn('flex', i % 2 ? 'justify-end' : 'justify-start')}>
              <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
          Could not load this thread.{' '}
          <button type="button" onClick={onRetry} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : messages.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-10 text-center text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
          No messages yet — start the conversation below.
        </p>
      ) : (
        messages.map((m) => {
          if (m.internal) {
            return (
              <div
                key={m.id}
                className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
              >
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold uppercase tracking-[0.06em] text-amber-800">
                  <Lock className="size-3.5" aria-hidden />
                  Internal note · only advisors see this
                  <span className="ml-auto font-semibold normal-case tracking-normal text-amber-700">
                    {m.senderName} · {formatStamp(m.createdAt)}
                  </span>
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-amber-950">
                  {m.content}
                </p>
              </div>
            );
          }
          const mine = m.senderId === 'adv-001' || m.senderName === advisorName;
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[82%] sm:max-w-[75%]', mine ? 'items-end' : 'items-start')}>
                <p className={cn('flex items-center gap-2 text-xs font-semibold text-slate-500', mine && 'flex-row-reverse')}>
                  <span className={mine ? 'text-[#c2410c]' : 'text-slate-700'}>{m.senderName}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">{formatStamp(m.createdAt)}</span>
                </p>
                <div
                  className={cn(
                    'mt-1.5 whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm',
                    mine
                      ? 'rounded-br-md bg-gradient-to-br from-[#F26F21] to-[#e05f14] text-white shadow-[0_6px_16px_-8px_rgba(242,111,33,0.7)]'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-900',
                  )}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
