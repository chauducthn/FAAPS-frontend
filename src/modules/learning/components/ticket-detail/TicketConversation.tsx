// The ticket thread as the student sees it; a pending ticket shows a waiting notice instead.

import { cn } from '@/shared/lib/utils';
import type { AdvisingMessage } from '../../../advising/types/advising';
import { formatDateTime } from './ticketFormat';

interface TicketConversationProps {
  pending: boolean;
  messages: AdvisingMessage[];
  currentUserId: string | undefined;
}

export function TicketConversation({ pending, messages, currentUserId }: TicketConversationProps) {
  if (pending) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5">
        <p className="text-sm font-semibold text-amber-900">
          Your request has been sent to the queue. An advisor will get back to you as soon as possible.
        </p>
        <p className="mt-1 text-[13px] text-amber-800">You will be notified as soon as an advisor claims this request.</p>
      </section>
    );
  }

  return (
    <section>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">Conversation with the advisor</p>
      {messages.length === 0 ? (
        <p className="mt-2 text-[13px] text-[#555f6f]">No messages yet — you can send your first question to the advisor.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <li key={message.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
                    mine ? 'bg-[#F26F21] text-white' : 'bg-[#f1f5f9] text-[#151c27]',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-[#98a2b3]">
                  {mine ? 'You' : message.senderName} · {formatDateTime(message.createdAt)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
