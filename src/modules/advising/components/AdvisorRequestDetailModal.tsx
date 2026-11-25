// src/modules/advising/components/AdvisorRequestDetailModal.tsx
// Detail view of one advising TICKET, from the Advisor's side.
//
// The system is a TICKET queue (helpdesk), NOT a 1-1 chat with an assigned advisor:
//   • PENDING     → visible to every advisor; "Claim Request" takes it.
//   • IN_PROGRESS → an advisor owns it. The owner can reply + "Resolve Request".
//                  Other advisors are read-only.
//   • RESOLVED    → closed, read-only.
//
// API used:
//   GET   /api/advisor/advising-requests/{id}
//   POST  /api/advisor/advising-requests/{id}/messages
//   PATCH /api/advisor/advising-requests/{id}/status

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheckBig, Hand, Lock, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/shared/components/ui/Modal';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { cn } from '@/shared/lib/utils';
import { advisorService } from '../services/advisorService';
import { RequestStatusBadge } from './RequestStatusBadge';
import { formatStamp, initialsOf, typeLabelOf } from './chat/format';
import { useAuth } from '../../auth/stores/useAuth';
import type { AdvisingRequest } from '../types/advising';

interface Props {
  /** The ticket being viewed — null ⇒ the modal is closed. */
  request: AdvisingRequest | null;
  onClose: () => void;
}

const MAX_MESSAGE = 10000;

export function AdvisorRequestDetailModal({ request, onClose }: Props) {
  const queryClient = useQueryClient();
  const currentUserId = useAuth((state) => state.user?.id);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const resolveInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [showResolve, setShowResolve] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const requestId = request?.id ?? null;

  const detail = useQuery({
    queryKey: ['advisor', 'advising-requests', 'detail', requestId],
    queryFn: () => advisorService.getRequestDetail(requestId as string),
    enabled: !!requestId,
  });

  // Reset every input whenever a different ticket is opened.
  useEffect(() => {
    setReply('');
    setReplyError('');
    setSummary('');
    setSummaryError('');
    setShowResolve(false);
  }, [requestId]);

  // Keep the thread pinned to the newest message.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [detail.data?.messages?.length, requestId]);

  // Opening the "Resolve Request" popup ⇒ focus the summary input straight away.
  useEffect(() => {
    if (!showResolve) return;
    const el = resolveInputRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => el.focus());
    return () => cancelAnimationFrame(raf);
  }, [showResolve]);

  // Live data from the API wins over the prop (after a claim / resolve).
  const live = detail.data?.request ?? request;
  const status = live?.status ?? 'PENDING';
  const messages = detail.data?.messages ?? [];

  /** Is this ticket owned by the advisor who is signed in? */
  const isMine = useMemo(() => {
    if (!live) return false;
    if (!live.advisorId || !currentUserId) return false;
    return live.advisorId === currentUserId;
  }, [live, currentUserId]);

  const isPending = status === 'PENDING';
  const isClosed = status === 'RESOLVED' || status === 'CANCELLED';

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['advisor'] });

  const claim = async () => {
    if (!requestId || claiming) return;
    setClaiming(true);
    try {
      await advisorService.claimRequest(requestId);
      toast.success('Request claimed', {
        description: 'You can now reply to the student and close the request when done.',
      });
      await refresh();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setClaiming(false);
    }
  };

  const send = async () => {
    const content = reply.trim();
    if (!requestId) return;
    if (!content) {
      setReplyError('Write a message before sending.');
      return;
    }
    if (content.length > MAX_MESSAGE) {
      setReplyError('The message is too long.');
      return;
    }
    setSending(true);
    try {
      await advisorService.sendRequestMessage(requestId, content);
      setReply('');
      setReplyError('');
      await refresh();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSending(false);
    }
  };

  const resolve = async () => {
    if (!requestId) return;
    const text = summary.trim();
    if (!text) {
      setSummaryError('A resolution summary is required before closing the request.');
      return;
    }
    setResolving(true);
    try {
      await advisorService.updateRequestStatus(requestId, {
        status: 'RESOLVED',
        resolutionSummary: text,
      });
      toast.success('Request closed', { description: 'The student has been notified.' });
      setSummary('');
      setSummaryError('');
      setShowResolve(false);
      await refresh();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setResolving(false);
    }
  };

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title="Advising Request Detail"
      className="max-w-[780px]"
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="border-b border-slate-200 p-5 sm:px-6">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
            >
              {initialsOf(live?.studentName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-[17px] font-extrabold tracking-tight text-slate-900">
                    {live?.title || 'Advising Request'}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-900">{live?.studentName ?? '—'}</span>
                    {live?.studentCode && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="tabular-nums">{live.studentCode}</span>
                      </>
                    )}
                    <span aria-hidden>·</span>
                    <span>{typeLabelOf(live?.requestType ?? '')}</span>
                    {live?.createdAt && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="tabular-nums">Sent {formatStamp(live.createdAt)}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {live && <RequestStatusBadge status={live.status} className="px-3 py-1 text-xs font-bold" />}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Who owns this ticket right now? */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-800 ring-1 ring-inset ring-orange-200">
                    <Hand className="size-3.5" aria-hidden />
                    Waiting in the queue — no advisor has claimed it yet
                  </span>
                ) : isMine ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 ring-1 ring-inset ring-blue-200">
                    <CircleCheckBig className="size-3.5" aria-hidden />
                    You are handling this request
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
                    <Lock className="size-3.5" aria-hidden />
                    {live?.advisorName
                      ? `Being handled by ${live.advisorName} — read only`
                      : 'Being handled by another advisor — read only'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {live?.description && (
            <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
              {live.description}
            </p>
          )}

          {/*
            `resolutionSummary` is only the outcome of a CLOSED ticket.
            An IN_PROGRESS ticket has no summary ⇒ render nothing (never show a
            placeholder like "Your advisor is now processing this request.").
          */}
          {isClosed && live?.resolutionSummary && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-emerald-950">
              <CircleCheckBig className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <span className="font-extrabold">Resolution: </span>
                {live.resolutionSummary}
              </span>
            </p>
          )}
        </div>

        {/* ── Message thread ── */}
        <div
          ref={threadRef}
          className="max-h-[320px] flex-1 space-y-4 overflow-y-auto bg-[#FAFAFA] p-5 sm:px-6"
          aria-live="polite"
        >
          {detail.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn('flex', i % 2 ? 'justify-end' : 'justify-start')}>
                  <div className="h-14 w-2/3 animate-pulse rounded-2xl bg-slate-200/70" />
                </div>
              ))}
            </div>
          ) : detail.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">
              Could not load this request.{' '}
              <button type="button" onClick={() => void detail.refetch()} className="cursor-pointer font-bold underline">
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
                  <div className={cn('max-w-[82%]', mine ? 'items-end' : 'items-start')}>
                    <p
                      className={cn(
                        'flex items-center gap-2 text-xs font-semibold text-slate-500',
                        mine && 'flex-row-reverse',
                      )}
                    >
                      <span className={mine ? 'text-[#c2410c]' : 'text-slate-700'}>
                        {mine ? 'You' : m.senderName}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">{formatStamp(m.createdAt)}</span>
                    </p>
                    <div
                      className={cn(
                        'mt-1.5 whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm',
                        mine
                          ? 'rounded-br-md bg-gradient-to-br from-[#F26F21] to-[#e05f14] text-white'
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

        {/* ── Action bar ── */}
        {isPending ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white p-5 sm:px-6">
            <p className="text-sm font-medium text-slate-600">
              This request is waiting in the queue — any advisor can pick it up.
            </p>
            <button
              type="button"
              onClick={claim}
              disabled={claiming}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#F26F21] px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Hand className="size-4" aria-hidden />
              {claiming ? 'Claiming…' : 'Claim Request'}
            </button>
          </div>
        ) : isClosed ? (
          <div className="border-t border-slate-200 bg-white p-5 sm:px-6">
            <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
              <Lock className="size-4 shrink-0" aria-hidden />
              This request is closed — no further replies.
            </p>
          </div>
        ) : !isMine ? (
          <div className="border-t border-slate-200 bg-white p-5 sm:px-6">
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-inset ring-amber-200">
              <Lock className="size-4 shrink-0" aria-hidden />
              This request is being handled by {live?.advisorName ?? 'another advisor'} — you can only view it.
            </p>
          </div>
        ) : (
          <>
            {/* Reply composer — action bar pinned at the bottom of the modal */}
            <div className="border-t border-slate-200 bg-white p-5 sm:px-6">
              <label htmlFor="advisor-reply" className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Reply to student
              </label>
              <textarea
                id="advisor-reply"
                rows={3}
                maxLength={MAX_MESSAGE}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  setReplyError('');
                }}
                aria-invalid={!!replyError}
                placeholder="Write a reply to the student..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30 aria-[invalid=true]:border-red-400"
              />
              {replyError && <p className="mt-1 text-[12px] font-semibold text-red-600">{replyError}</p>}

              {/* Action bar: Resolve button (Outline Danger) + Send button (FPT orange) */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowResolve((v) => !v)}
                  aria-expanded={showResolve}
                  aria-controls="advisor-resolve-panel"
                  className={cn(
                    'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border px-5 text-sm font-extrabold shadow-sm transition-colors',
                    showResolve
                      ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                      : 'border-green-300 bg-white text-green-600 hover:border-green-400 hover:bg-green-50',
                  )}
                >
                  <CircleCheckBig className="size-4" aria-hidden />
                  Resolve Request
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !reply.trim()}
                  className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="size-4" aria-hidden />
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>

            {/*
              Popup for the `resolutionSummary`.
              Only shown after clicking "Resolve Request" — the API is called once
              the summary is written and "Confirm" is pressed.
            */}
            {showResolve && (
              <div
                id="advisor-resolve-panel"
                className="border-t border-red-200 bg-red-50/60 p-5 sm:px-6"
              >
                <label htmlFor="advisor-summary" className="block text-sm font-bold text-[#1A1A1A]">
                  Resolution summary{' '}
                  <span className="font-medium text-slate-600">(shared with the student)</span>
                </label>
                <textarea
                  id="advisor-summary"
                  ref={resolveInputRef}
                  rows={3}
                  maxLength={MAX_MESSAGE}
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setSummaryError('');
                  }}
                  aria-invalid={!!summaryError}
                  placeholder="Summarise the advice and the next steps for the student..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:font-normal placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/25 aria-[invalid=true]:border-red-400"
                />
                {summaryError && <p className="mt-1 text-[12px] font-semibold text-red-600">{summaryError}</p>}
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowResolve(false)}
                    disabled={resolving}
                    className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resolve}
                    disabled={resolving || !summary.trim()}
                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-red-600 px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CircleCheckBig className="size-4" aria-hidden />
                    {resolving ? 'Closing…' : 'Confirm Resolution'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
