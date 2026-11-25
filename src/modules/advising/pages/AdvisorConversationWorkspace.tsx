// Advising conversations workspace combining inbox, thread view, and reply composer.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessagesSquare } from 'lucide-react';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorConversationService } from '../services/advisorConversationService';
import ChatComposer, { ChatResolvePanel } from '../components/chat/ChatComposer';
import ChatHeader from '../components/chat/ChatHeader';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatSidebar, { type ChatFilterKey } from '../components/chat/ChatSidebar';
import { ConversationHeroKpis } from '../components/chat/ConversationHeroKpis';

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

  useEffect(() => {
    if (!selectedId && all.length > 0) setSelectedId(all[0].id);
  }, [all, selectedId]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [detail.data?.messages?.length, selectedId]);

  const stats = useMemo(
    () => ({
      total: all.length,
      pending: all.filter((r) => r.status === 'PENDING').length,
      inProgress: all.filter((r) => r.status === 'IN_PROGRESS').length,
      resolved: all.filter((r) => r.status === 'RESOLVED' || r.status === 'CANCELLED').length,
    }),
    [all],
  );

  const visible = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    return all
      .filter((r) => {
        if (filter === 'ALL') return true;
        if (filter === 'RESOLVED') return r.status === 'RESOLVED' || r.status === 'CANCELLED';
        return r.status === filter;
      })
      .filter((r) => {
        if (!q) return true;
        return r.studentName?.toLowerCase().includes(q) || r.title?.toLowerCase().includes(q);
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

  const markInProgress = () => run(() => advisorConversationService.status(selectedId, 'IN_PROGRESS'));

  const resolve = () =>
    run(async () => {
      await advisorConversationService.status(selectedId, 'RESOLVED', summary.trim());
      setSummary('');
      setShowResolve(false);
    });

  return (
    <div className="w-full space-y-6 pb-4">
      <ConversationHeroKpis stats={stats} />

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

                {showResolve && !isClosed && (
                  <ChatResolvePanel
                    summary={summary}
                    busy={busy}
                    onSummaryChange={setSummary}
                    onCancel={() => setShowResolve(false)}
                    onConfirm={resolve}
                  />
                )}

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
