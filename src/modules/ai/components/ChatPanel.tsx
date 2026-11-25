// Student AI chat panel: conversation sidebar, message thread, and composer.
// Used on the student /student/ai-chat page.

import { useEffect, useRef, useState } from 'react';
import { MessageSquareText, SendHorizonal } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAiConversations, useAiMessages } from '../hooks/queries/useAiStudentQueries';
import { useCreateAiConversation, useSendAiMessage } from '../hooks/mutations/useAiStudentMutations';
import { ChatBubble, TypingBubble } from './ChatBubble';
import { ChatSidebar } from './ChatSidebar';

const MAX_MESSAGE = 2000;

export function ChatPanel({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const conversationsQuery = useAiConversations();
  const messagesQuery = useAiMessages(activeId);
  const createConversation = useCreateAiConversation();
  const sendMessage = useSendAiMessage(activeId);

  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];

  // Auto-select the latest conversation on initial load.
  useEffect(() => {
    if (!activeId && conversations.length > 0) onSelect(conversations[0].id);
    // Run only when the conversation list finishes loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsQuery.data]);

  // Scroll to the newest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sendMessage.isPending, activeId]);

  const handleNewChat = async () => {
    const created = await createConversation.mutateAsync({});
    setDraft('');
    onSelect(created.id);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!activeId || content.length === 0 || sendMessage.isPending) return;
    setDraft('');
    sendMessage.mutate({ content });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        isLoading={conversationsQuery.isLoading}
        isCreating={createConversation.isPending}
        onSelect={onSelect}
        onNewChat={handleNewChat}
      />

      <section className="flex min-h-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
              <MessageSquareText className="size-6" />
            </span>
            <p className="text-sm font-semibold text-[#151c27]">Select a conversation to start chatting</p>
            <p className="max-w-sm text-[13px] text-[#555f6f]">
              Ask about curricula, prerequisites, academic policies, or request a study roadmap.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f8fa] p-4 sm:p-5">
              {messagesQuery.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-14 animate-pulse rounded-2xl bg-white',
                        i % 2 === 0 ? 'ml-auto w-2/3' : 'w-2/3',
                      )}
                    />
                  ))}
                </div>
              ) : messagesQuery.isError ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="text-sm font-semibold text-[#151c27]">Unable to load messages</p>
                  <button
                    type="button"
                    onClick={() => messagesQuery.refetch()}
                    className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
                  >
                    Try again
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="text-sm font-semibold text-[#151c27]">Start a New Conversation</p>
                  <p className="max-w-sm text-[13px] text-[#555f6f]">
                    Example: “Suggest a two-semester roadmap for graduating on time” or “What are the
                    prerequisites for PRJ301?”.
                  </p>
                </div>
              ) : (
                messages.map((m) => <ChatBubble key={m.id} message={m} />)
              )}
              {sendMessage.isPending && <TypingBubble />}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-[#e5e7eb] p-3 sm:p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  rows={2}
                  maxLength={MAX_MESSAGE}
                  placeholder="Ask AI about courses, policies, or study roadmaps..."
                  aria-label="Enter a message for AI"
                  className={cn(
                    'max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-[#e5e7eb] px-3 py-2',
                    'text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3]',
                    'focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]',
                  )}
                />
                <button
                  type="submit"
                  disabled={draft.trim().length === 0 || sendMessage.isPending}
                  aria-label="Send message"
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#F26F21] text-white',
                    'transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  <SendHorizonal className="size-5" />
                </button>
              </div>
              <p className="mt-1 text-right text-[11px] text-[#98a2b3]">
                {draft.length}/{MAX_MESSAGE}
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
