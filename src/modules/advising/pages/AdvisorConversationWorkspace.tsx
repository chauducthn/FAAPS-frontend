// src/pages/advising/AdvisorConversationWorkspace.tsx
// "Advising Conversations" — redesigned into the Overview design system:
// FPT-orange hero + read-only KPI cards + 2-column inbox/chat workspace.
// Business rules preserved: thread, public vs internal note, reply composer,
// Resolve + Resolution Summary, mock data layer via advisorConversationService.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CircleCheckBig,
  Hourglass,
  Inbox,
  MessagesSquare,
  UsersRound,
} from 'lucide-react';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorConversationService } from '../services/advisorConversationService';
import { cn } from '@/shared/lib/utils';
import ChatComposer, { ChatResolvePanel } from '../components/chat/ChatComposer';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatSidebar, { type ChatFilterKey } from '../components/chat/ChatSidebar';

export default function AdvisorConversationWorkspace() {
  const queryClient = useQueryClient();
  const requests = useQuery({ queryKey: ['advisor', 'conversations'], queryFn: advisorConversationService.requests });
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<ChatFilterKey>('ALL');
  const [inboxSearch, setInboxSearch] = useState('');

  const detail = useQuery({
    queryKey: ['advisor', 'conversation', selectedId],
    queryFn: () => advisorConversationService.detail(selectedId),
    enabled: Boolean(selectedId),
  });

  const [reply, setReply] = useState('');
  const [internal, setInternal] = useState(false);
  const [summary, setSummary] = useState('');
  const [showResolve, setShowResolve] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => requests.data ?? [], [requests.data]);

  // Auto-select the first conversation on load for a full workspace feel.
  useEffect(() => {
    if (!selectedId && all.length > 0) setSelectedId(all[0].id);
  }, [all, selectedId]);

  // Keep the thread pinned to the latest message.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [detail.data?.messages.length, selectedId]);

  const stats = useMemo(
    () => ({
      total: all.length,
      pending: all.filter((r) => r.status === 'PENDING').length,
      inProgress: all.filter((r) => r.status === 'IN_PROGRESS').length,
      // "Resolved" gộp cả request đã chấp nhận (RESOLVED) và đã từ chối
      // (CANCELLED): cả hai đều đã đóng nên không còn việc cho advisor xử lý.
      resolved: all.filter((r) => r.status === 'RESOLVED' || r.status === 'CANCELLED').length,
    }),
    [all],
  );

  const visible = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    return all
      .filter((r) => {
        if (filter === 'ALL') return true;
        // Filter "Resolved" gộp cả RESOLVED và CANCELLED (đã đóng).
        if (filter === 'RESOLVED') return r.status === 'RESOLVED' || r.status === 'CANCELLED';
        return r.status === filter;
      })
      .filter((r) => {
        if (!q) return true;
        return r.studentName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [all, filter, inboxSearch]);

  const active = detail.data?.request ?? null;
  const messages = detail.data?.messages ?? [];
  const isClosed = active ? ['RESOLVED', 'CANCELLED'].includes(active.status) : false;

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setNotice('');
    try {
      await action();
      setNotice('Updated successfully.');
      await queryClient.invalidateQueries({ queryKey: ['advisor'] });
    } catch (error) {
      setNotice(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const pick = (id: string) => {
    setSelectedId(id);
    setReply('');
    setSummary('');
    setShowResolve(false);
    setInternal(false);
    setNotice('');
  };

  const sendReply = () =>
    run(async () => {
      await advisorConversationService.reply(selectedId, reply.trim(), internal);
      setReply('');
    });

  const markInProgress = () =>
    run(() => advisorConversationService.status(selectedId, 'IN_PROGRESS'));

  const resolve = () =>
    run(async () => {
      await advisorConversationService.status(selectedId, 'RESOLVED', summary.trim());
      setSummary('');
      setShowResolve(false);
    });

  const kpis = [
    { label: 'Total', value: String(stats.total), sub: 'conversations', icon: UsersRound, iconBox: 'bg-slate-900 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.5)]', topBar: 'bg-slate-900' },
    { label: 'Pending', value: String(stats.pending), sub: 'needs response', icon: Inbox, iconBox: 'bg-[#F26F21] text-white shadow-[0_6px_16px_-6px_rgba(242,111,33,0.6)]', topBar: 'bg-[#F26F21]' },
    { label: 'In progress', value: String(stats.inProgress), sub: 'being handled', icon: Hourglass, iconBox: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200', topBar: 'bg-slate-300' },
    { label: 'Resolved', value: String(stats.resolved), sub: 'completed', icon: CircleCheckBig, iconBox: 'bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.5)]', topBar: 'bg-emerald-600' },
  ];

  return (
    <div className="w-full space-y-6 pb-4">
      {/* ── Hero — đồng bộ Overview ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#b45309] via-[#F26F21] to-[#fb923c] px-6 py-7 text-white shadow-lg shadow-orange-500/20 sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-white/15 blur-[1px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-48 size-40 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/30" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <MessagesSquare className="size-7" aria-hidden strokeWidth={2.25} />
              Advising Conversations
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/95">
              {stats.pending > 0
                ? `${stats.pending} pending conversation${stats.pending === 1 ? '' : 's'} need${stats.pending === 1 ? 's' : ''} your response.`
                : 'Inbox zero. All conversations are up to date.'}
            </p>
          </div>
          <Link
            to="/advisor/advising-requests"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-sm font-extrabold text-[#c2410c] shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-orange-50 active:scale-[0.98]"
          >
            All requests <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* ── KPI read-only — giống Overview ── */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {kpis.map((s) => (
          <div
            key={s.label}
            aria-readonly="true"
            className="relative cursor-default overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_28px_-14px_rgba(15,23,42,0.25)]"
          >
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', s.topBar)} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{s.label}</p>
                <p className="mt-2.5 text-[30px] font-extrabold leading-none tabular-nums text-slate-900">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">{s.sub}</p>
              </div>
              <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', s.iconBox)}>
                <s.icon className="size-5" aria-hidden strokeWidth={2.25} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Workspace: inbox + thread ── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[340px_minmax(0,1fr)]">
          <ChatSidebar
            conversations={visible}
            selectedId={selectedId}
            filter={filter}
            search={inboxSearch}
            isLoading={requests.isLoading}
            isError={requests.isError}
            onFilterChange={setFilter}
            onSearchChange={setInboxSearch}
            onSelect={pick}
            onRetry={() => void requests.refetch()}
          />

          {/* Thread column */}
          <div className="flex min-h-[560px] min-w-0 flex-col">
            {!selectedId || !active ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#fff3ea] text-[#F26F21]">
                  <MessagesSquare className="size-6" aria-hidden />
                </span>
                <p className="text-lg font-bold text-slate-900">Select a conversation</p>
                <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-600">
                  Pick a request from the inbox to read the thread, reply to the student, or resolve it.
                </p>
              </div>
            ) : (
              <>
                <ChatHeader
                  title={active.title}
                  studentName={active.studentName}
                  requestType={active.requestType}
                  status={active.status}
                  updatedAt={active.updatedAt}
                  description={active.description}
                  resolutionSummary={active.resolutionSummary}
                  hasInternalNotes={messages.some((m) => m.internal)}
                  isClosed={isClosed}
                  showResolve={showResolve}
                  busy={busy || detail.isLoading}
                  onMarkInProgress={markInProgress}
                  onToggleResolve={() => setShowResolve((v) => !v)}
                />

                <ChatMessageList
                  messages={messages}
                  advisorName={active.advisorName}
                  isLoading={detail.isLoading}
                  isError={detail.isError}
                  onRetry={() => void detail.refetch()}
                  threadRef={threadRef}
                />

                {/* Resolve panel */}
                {showResolve && !isClosed && (
                  <ChatResolvePanel
                    summary={summary}
                    busy={busy}
                    onSummaryChange={setSummary}
                    onCancel={() => setShowResolve(false)}
                    onConfirm={resolve}
                  />
                )}

                {/* Composer */}
                <ChatComposer
                  isClosed={isClosed}
                  status={active.status}
                  studentName={active.studentName}
                  reply={reply}
                  internal={internal}
                  notice={notice}
                  busy={busy}
                  onReplyChange={setReply}
                  onInternalChange={setInternal}
                  onSend={sendReply}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
