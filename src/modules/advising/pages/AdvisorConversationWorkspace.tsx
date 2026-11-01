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
  Lock,
  MessagesSquare,
  Search,
  Send,
  TriangleAlert,
  UsersRound,
} from 'lucide-react';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { advisorConversationService } from '../services/advisorConversationService';
import { RequestStatusBadge } from '../components/RequestStatusBadge';
import { cn } from '@/shared/lib/utils';

type FilterKey = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
];

const TYPE_LABELS: Record<string, string> = {
  COURSE_SELECTION: 'Course selection',
  PLAN_REVIEW: 'Plan review',
  GRADUATION_CHECK: 'Graduation check',
  ACADEMIC_GUIDANCE: 'Academic guidance',
  OTHER: 'Other',
};

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatStamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdvisorConversationWorkspace() {
  const queryClient = useQueryClient();
  const requests = useQuery({ queryKey: ['advisor', 'conversations'], queryFn: advisorConversationService.requests });
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');
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
      resolved: all.filter((r) => r.status === 'RESOLVED').length,
    }),
    [all],
  );

  const visible = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    return all
      .filter((r) => (filter === 'ALL' ? true : r.status === filter))
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 pb-4">
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
          {/* Inbox column */}
          <div className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Inbox</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold tabular-nums text-slate-700">
                  {visible.length}
                </span>
              </div>
              <label className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 transition-colors focus-within:border-[#F26F21] focus-within:ring-2 focus-within:ring-[#F26F21]/30">
                <Search className="size-4 shrink-0 text-slate-500" aria-hidden />
                <input
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  placeholder="Search student or topic..."
                  aria-label="Search conversations"
                  className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-500"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filter conversations">
                {FILTERS.map((f) => {
                  const activeTab = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab}
                      onClick={() => setFilter(f.key)}
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
              {requests.isLoading ? (
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
              ) : requests.isError ? (
                <div className="m-1 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
                  Could not load conversations.{' '}
                  <button type="button" onClick={() => requests.refetch()} className="font-bold underline">
                    Retry
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <p className="m-1 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600">
                  No conversations match this filter.
                </p>
              ) : (
                <ul className="space-y-2.5" role="listbox" aria-label="Conversations">
                  {visible.map((r) => {
                    const selected = r.id === selectedId;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => pick(r.id)}
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
                                {TYPE_LABELS[r.requestType] ?? r.requestType}
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
                {/* Thread header */}
                <div className="border-b border-slate-200 p-5 sm:px-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span
                        aria-hidden
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
                      >
                        {initialsOf(active.studentName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[17px] font-extrabold tracking-tight text-slate-900">
                          {active.title}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-600">
                          <span className="font-bold text-slate-900">{active.studentName}</span>
                          <span aria-hidden>·</span>
                          <span>{TYPE_LABELS[active.requestType] ?? active.requestType}</span>
                          <span aria-hidden>·</span>
                          <span>Updated {formatStamp(active.updatedAt)}</span>
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <RequestStatusBadge status={active.status as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'} />
                          {messages.some((m) => m.internal) && (
                            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-300">
                              <Lock className="size-3.5" aria-hidden />
                              Has internal notes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isClosed && (
                      <div className="flex shrink-0 items-center gap-2.5">
                        {active.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={markInProgress}
                            disabled={busy || detail.isLoading}
                            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21] disabled:opacity-50"
                          >
                            Mark in progress
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowResolve((v) => !v)}
                          aria-expanded={showResolve}
                          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700"
                        >
                          <CircleCheckBig className="size-4" aria-hidden />
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
                    {active.description || 'No description provided.'}
                  </p>

                  {active.resolutionSummary && (
                    <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-emerald-950">
                      <CircleCheckBig className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <span>
                        <span className="font-extrabold">Resolution: </span>
                        {active.resolutionSummary}
                      </span>
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div ref={threadRef} className="max-h-[460px] flex-1 space-y-4 overflow-y-auto bg-[#fafbfc] p-5 sm:px-7" aria-live="polite">
                  {detail.isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={cn('flex', i % 2 ? 'justify-end' : 'justify-start')}>
                          <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
                        </div>
                      ))}
                    </div>
                  ) : detail.isError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
                      Could not load this thread.{' '}
                      <button type="button" onClick={() => detail.refetch()} className="font-bold underline">
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
                      const mine = m.senderId === 'adv-001' || m.senderName === active.advisorName;
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

                {/* Resolve panel */}
                {showResolve && !isClosed && (
                  <div className="border-t border-emerald-200 bg-emerald-50/60 px-5 py-4 sm:px-7">
                    <label className="block text-sm font-bold text-slate-900" htmlFor="resolution-summary">
                      Resolution summary <span className="font-medium text-slate-600">(shared with the student)</span>
                    </label>
                    <textarea
                      id="resolution-summary"
                      rows={3}
                      maxLength={10000}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Summarize the advice and next steps, e.g. Approved 18 credits for sem 9, OJT deferred to next term..."
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/25"
                    />
                    <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setShowResolve(false)}
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={resolve}
                        disabled={busy || !summary.trim()}
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CircleCheckBig className="size-4" aria-hidden />
                        {busy ? 'Resolving…' : 'Confirm resolve'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Composer */}
                <div className="border-t border-slate-200 bg-white p-5 sm:px-7">
                  {isClosed ? (
                    <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                      <Lock className="size-4 shrink-0" aria-hidden />
                      This conversation is {active.status.toLowerCase()}. Replies are locked.
                    </p>
                  ) : (
                    <>
                      <div className="inline-flex rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Message type">
                        {(
                          [
                            { key: false, label: 'Public reply' },
                            { key: true, label: 'Internal note' },
                          ] as const
                        ).map((t) => {
                          const on = internal === t.key;
                          return (
                            <button
                              key={t.label}
                              type="button"
                              role="tab"
                              aria-selected={on}
                              onClick={() => setInternal(t.key)}
                              className={cn(
                                'flex h-10 items-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-all',
                                on
                                  ? t.key
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-white text-[#F26F21] shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900',
                              )}
                            >
                              {t.key && <Lock className="size-3.5" aria-hidden />}
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                      {internal && (
                        <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-amber-900">
                          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                          Hidden from the student — only advisors see this note.
                        </p>
                      )}
                      <label className="sr-only" htmlFor="reply-box">
                        {internal ? 'Write an internal note' : 'Write a reply to the student'}
                      </label>
                      <textarea
                        id="reply-box"
                        rows={3}
                        maxLength={10000}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder={
                          internal ? 'Note for advisors, e.g. verified prerequisites against K17 plan...' : `Reply to ${active.studentName}...`
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30"
                      />
                      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-600" role="status">
                          {notice || (internal ? 'Sending as internal note.' : 'Sending as public reply.')}
                        </p>
                        <button
                          type="button"
                          onClick={sendReply}
                          disabled={busy || !reply.trim()}
                          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
                        >
                          <Send className="size-4" aria-hidden />
                          {busy ? 'Sending…' : internal ? 'Save note' : 'Send reply'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
