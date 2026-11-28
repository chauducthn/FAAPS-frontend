// Message thread of the advisor ticket chat, newest at the bottom.

import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { formatStamp } from '../chat/format';
import type { AdvisingMessage } from '../../types/advising';

interface TicketThreadProps {
  ticketId: string | null;
  messages: AdvisingMessage[];
  currentUserId: string | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TicketThread({ ticketId, messages, currentUserId, isLoading, isError, onRetry }: TicketThreadProps) {
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, ticketId]);

  return (
    <div ref={threadRef} className="max-h-[320px] flex-1 space-y-4 overflow-y-auto bg-[#FAFAFA] p-5 sm:px-6" aria-live="polite">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn('flex', i % 2 ? 'justify-end' : 'justify-start')}>
              <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
          Could not load this request.{' '}
          <button type="button" onClick={onRetry} className="font-bold underline">
            Retry
          </button>
        </div>
      ) : messages.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-10 text-center text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
          No messages yet — the student will see your replies right on this request.
        </p>
      ) : (
        messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className="max-w-[82%]">
                <p className={cn('flex items-center gap-2 text-xs font-semibold text-slate-500', mine && 'flex-row-reverse')}>
                  <span className={mine ? 'text-[#c2410c]' : 'text-slate-700'}>{mine ? 'You' : m.senderName}</span>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">{formatStamp(m.createdAt)}</span>
                </p>
                <div
                  className={cn(
                    'mt-1.5 whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm',
                    mine ? 'rounded-br-md bg-[var(--brand)] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-900',
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
