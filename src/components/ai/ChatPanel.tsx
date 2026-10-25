// src/components/ai/ChatPanel.tsx
// Khung Chat AI: sidebar hội thoại + vùng bong bóng chat + ô nhập tin nhắn.
// Dùng cho trang /student/ai-chat của sinh viên.

import { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, MessageSquareText, SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiConversations, useAiMessages } from '../../hooks/queries/useAiStudentQueries';
import { useCreateAiConversation, useSendAiMessage } from '../../hooks/mutations/useAiStudentMutations';
import { ChatBubble, TypingBubble } from './ChatBubble';

const MAX_MESSAGE = 2000;

const ago = (iso: string | null) => {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1} phút trước`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} giờ trước`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

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

  // Tự chọn hội thoại mới nhất khi vào trang lần đầu.
  useEffect(() => {
    if (!activeId && conversations.length > 0) onSelect(conversations[0].id);
    // Chỉ chạy khi danh sách hội thoại load xong lần đầu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsQuery.data]);

  // Cuộn xuống tin nhắn mới nhất.
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
      {/* Sidebar hội thoại */}
      <aside className="flex flex-col rounded-xl bg-white p-3 shadow-sm">
        <button
          type="button"
          onClick={handleNewChat}
          disabled={createConversation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-60"
        >
          <MessageSquarePlus className="size-4" />
          {createConversation.isPending ? 'Đang tạo...' : 'Hội thoại mới'}
        </button>

        <div className="mt-3 flex min-h-0 flex-col gap-1 overflow-y-auto">
          {conversationsQuery.isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-6 text-center text-[13px] text-[#555f6f]">
              Chưa có hội thoại nào. Bấm “Hội thoại mới” để bắt đầu.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-left transition-colors',
                  c.id === activeId ? 'bg-[#fff7ed] ring-1 ring-inset ring-orange-200' : 'hover:bg-gray-50',
                )}
              >
                <span className="flex items-center gap-2">
                  <MessageSquareText
                    className={cn('size-4 shrink-0', c.id === activeId ? 'text-[#F26F21]' : 'text-[#98a2b3]')}
                  />
                  <span className="truncate text-[13px] font-semibold text-[#151c27]">
                    {c.title || 'Hội thoại mới'}
                  </span>
                </span>
                <span className="mt-0.5 block pl-6 text-[11px] text-[#98a2b3]">
                  {c.messageCount} tin nhắn · {ago(c.lastMessageAt)}
                  {c.status === 'CLOSED' ? ' · Đã đóng' : ''}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Vùng chat */}
      <section className="flex min-h-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-orange-100 text-[#F26F21]">
              <MessageSquareText className="size-6" />
            </span>
            <p className="text-sm font-semibold text-[#151c27]">Chọn một hội thoại để bắt đầu chat</p>
            <p className="max-w-sm text-[13px] text-[#555f6f]">
              Hỏi về chương trình đào tạo, môn tiên quyết, quy chế học tập hoặc nhờ AI sinh lộ trình học.
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
                  <p className="text-sm font-semibold text-[#151c27]">Không tải được tin nhắn</p>
                  <button
                    type="button"
                    onClick={() => messagesQuery.refetch()}
                    className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
                  >
                    Thử lại
                  </button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="text-sm font-semibold text-[#151c27]">Bắt đầu hội thoại mới</p>
                  <p className="max-w-sm text-[13px] text-[#555f6f]">
                    Ví dụ: “Gợi ý lộ trình 2 kỳ tới để ra trường đúng hạn” hoặc “PRJ301 có môn tiên quyết là gì?”.
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
                  placeholder="Hỏi AI về môn học, quy chế, lộ trình..."
                  aria-label="Nhập tin nhắn cho AI"
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#151c27] outline-none placeholder:text-[#98a2b3] focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]"
                />
                <button
                  type="submit"
                  disabled={draft.trim().length === 0 || sendMessage.isPending}
                  aria-label="Gửi tin nhắn"
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#F26F21] text-white transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
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
