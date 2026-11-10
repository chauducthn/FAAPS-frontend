// src/modules/advising/components/chat/ChatSidebar.tsx
// The inbox column of the advisor conversation workspace: the conversation list
// with its search box and the status filter tabs.

import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RequestStatusBadge } from '../RequestStatusBadge';
import { formatDay, initialsOf, typeLabelOf } from './format';

export type ChatFilterKey = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export const CHAT_FILTERS: { key: ChatFilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
];

/** The conversation rows the sidebar renders. */
export interface ChatConversation {
  id: string;
  studentName: string;
  title: string;
  requestType: string;
  status: string;
  updatedAt: string;
}

interface Props {
  conversations: ChatConversation[];
  selectedId: string;
  filter: ChatFilterKey;
  search: string;
  isLoading: boolean;
  isError: boolean;
  onFilterChange: (filter: ChatFilterKey) => void;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

export default function ChatSidebar({
  conversations,
  selectedId,
  filter,
  search,
  isLoading,
  isError,
  onFilterChange,
  onSearchChange,
  onSelect,
  onRetry,
}: Props) {
  return (
    <div className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Inbox</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold tabular-nums text-slate-700">
            {conversations.length}
          </span>
        </div>
        <label className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30">
          <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student or topic..."
            aria-label="Search conversations"
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filter conversations">
          {CHAT_FILTERS.map((f) => {
            const activeTab = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={activeTab}
                onClick={() => onFilterChange(f.key)}
                className={cn(
                  'inline-flex h-9 items-center rounded-full px-3.5 text-sm font-bold ring-1 ring-inset transition-colors',
                  activeTab
                    ? 'bg-[#F26F21] text-white ring-[#F26F21] shadow-sm'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-[#fff7f0] hover:text-slate-900',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-h-[520px] flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
        {isLoading ? (
          <ul className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                <span className="size-11 shrink-0 animate-pulse rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="m-1 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
            Could not load conversations.{' '}
            <button type="button" onClick={onRetry} className="font-bold underline">
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <p className="m-1 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
            No conversations match this filter.
          </p>
        ) : (
          <ul className="space-y-2.5" role="listbox" aria-label="Conversations">
            {conversations.map((r) => {
              const selected = r.id === selectedId;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onSelect(r.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                      selected
                        ? 'border-[#F26F21]/50 bg-[#fff7f0] shadow-[0_2px_4px_rgba(15,23,42,0.06),0_12px_28px_-14px_rgba(242,111,33,0.45)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <span
                      aria-hidden
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-[13px] font-extrabold text-white shadow-sm"
                    >
                      {initialsOf(r.studentName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[15px] font-bold text-slate-900">{r.studentName}</span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                          {formatDay(r.updatedAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-medium text-slate-600">{r.title}</span>
                      <span className="mt-2 flex items-center gap-2">
                        <RequestStatusBadge status={r.status as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'} />
                        <span className="truncate text-xs font-semibold text-slate-500">
                          {typeLabelOf(r.requestType)}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
