// Conversation list sidebar for the student AI chat panel.

import { ChatCircleDots as MessageSquarePlus, ChatCircleText as MessageSquareText } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export interface ChatSidebarConversation {
  id: string;
  title?: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  status?: string | null;
}

interface ChatSidebarProps {
  conversations: ChatSidebarConversation[];
  activeId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

const formatRelativeTime = (iso: string | null) => {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1} minute(s) ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} hour(s) ago`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export function ChatSidebar({
  conversations,
  activeId,
  isLoading,
  isCreating,
  onSelect,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <aside className="flex flex-col rounded-xl bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onNewChat}
        disabled={isCreating}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg bg-[#F26F21] px-3 py-2 text-sm',
          'font-bold text-white transition-colors hover:bg-[#e05f14] disabled:opacity-60',
        )}
      >
        <MessageSquarePlus className="size-4" />
        {isCreating ? 'Creating...' : 'New Conversation'}
      </button>

      <div className="mt-3 flex min-h-0 flex-col gap-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-[13px] text-[#555f6f]">
            No conversations yet. Select “New Conversation” to begin.
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                'rounded-lg px-3 py-2.5 text-left transition-colors',
                c.id === activeId
                  ? 'bg-[#fff7ed] ring-1 ring-inset ring-orange-200'
                  : 'hover:bg-gray-50',
              )}
            >
              <span className="flex items-center gap-2">
                <MessageSquareText
                  className={cn(
                    'size-4 shrink-0',
                    c.id === activeId ? 'text-[#F26F21]' : 'text-[#98a2b3]',
                  )}
                />
                <span className="truncate text-[13px] font-semibold text-[#151c27]">
                  {c.title || 'New Conversation'}
                </span>
              </span>
              <span className="mt-0.5 block pl-6 text-[11px] text-[#98a2b3]">
                {c.messageCount} message(s) · {formatRelativeTime(c.lastMessageAt)}
                {c.status === 'CLOSED' ? ' · Closed' : ''}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
