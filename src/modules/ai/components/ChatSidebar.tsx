// Sub-sidebar for past AI Advisor Chat conversations + student academic data status.
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle, MagnifyingGlass as Search, ChatCircleText as MessageSquareText, Plus, UploadSimple, WarningCircle, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export interface ChatSidebarConversation {
  id: string; title?: string | null; messageCount: number; lastMessageAt: string | null; status?: string | null;
}

export interface StudentContextSummary {
  majorCode?: string | null; cohort?: string | null; gpa?: number | null; creditsEarned?: number | null;
  hasCurriculum: boolean; hasTranscript: boolean; isLoading: boolean;
}

interface ChatSidebarProps {
  conversations: ChatSidebarConversation[]; activeId: string | null; isLoading: boolean; isCreating: boolean;
  studentContext: StudentContextSummary; onSelect: (id: string) => void; onNewChat: () => void;
}

const formatRelativeTime = (iso: string | null) => {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes || 1}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export function ChatSidebar({
  conversations,
  activeId,
  isLoading,
  isCreating,
  studentContext,
  onSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) => (c.title || 'New Advising Chat').toLowerCase().includes(term));
  }, [conversations, query]);

  const missingData = !studentContext.isLoading && (!studentContext.hasCurriculum || !studentContext.hasTranscript);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="space-y-2.5 border-b border-gray-200/70 p-3">
        <button
          type="button"
          onClick={onNewChat}
          disabled={isCreating}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#F26F21] px-3 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:opacity-60"
        >
          <Plus className="size-4" weight="bold" />
          {isCreating ? 'Creating…' : 'New chat'}
        </button>

        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search past chats…"
            aria-label="Search past conversations"
            className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2.5">
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Recent chats {conversations.length > 0 ? `(${conversations.length})` : ''}
        </p>

        {isLoading ? (
          <div className="space-y-2 px-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-gray-200/70" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs text-gray-500">
            {query ? 'No matching conversations.' : 'No chats yet. Start a conversation to get personalized advising.'}
          </p>
        ) : (
          filtered.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'w-full rounded-lg px-2.5 py-2 text-left transition-colors',
                  active
                    ? 'bg-white text-gray-900 shadow-2xs ring-1 ring-orange-200'
                    : 'text-gray-700 hover:bg-white/70',
                )}
              >
                <span className="flex items-center gap-2">
                  <MessageSquareText
                    className={cn('size-3.5 shrink-0', active ? 'text-[#F26F21]' : 'text-gray-400')}
                  />
                  <span className="truncate text-[13px] font-medium">
                    {c.title || 'New Advising Chat'}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center justify-between pl-5.5 text-[11px] text-gray-400">
                  <span>{c.messageCount} msg{c.messageCount === 1 ? '' : 's'}</span>
                  <span>{formatRelativeTime(c.lastMessageAt)}</span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-200/70 p-3">
        {studentContext.isLoading ? (
          <div className="h-14 animate-pulse rounded-lg bg-gray-200/60" />
        ) : missingData ? (
          <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 p-2.5 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <WarningCircle className="mt-0.5 size-4 shrink-0 text-amber-600" weight="fill" />
              <div className="min-w-0">
                <p className="font-semibold">Academic data incomplete</p>
                <p className="mt-0.5 text-[11px] text-amber-800/90">
                  {!studentContext.hasTranscript
                    ? 'Upload your transcript so AI can analyze strengths & weaknesses.'
                    : 'Set your major & curriculum for tailored course advice.'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {!studentContext.hasTranscript && (
                    <Link
                      to="/student/transcript"
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-[#C2410C] ring-1 ring-amber-200 hover:bg-orange-50"
                    >
                      <UploadSimple className="size-3" /> Upload transcript
                    </Link>
                  )}
                  {!studentContext.hasCurriculum && (
                    <Link
                      to="/student/curriculum-goals"
                      className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100/60"
                    >
                      Set curriculum
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <CheckCircle className="size-3.5 text-emerald-600" weight="fill" />
              Academic data synced
            </div>
            <p className="mt-1 truncate text-[11px] text-emerald-700">
              {[
                studentContext.majorCode,
                studentContext.cohort,
                studentContext.gpa != null ? `GPA ${studentContext.gpa.toFixed(2)}` : null,
                studentContext.creditsEarned != null ? `${studentContext.creditsEarned} cr` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
