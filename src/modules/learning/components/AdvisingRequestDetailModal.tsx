// Detail of one advising request: the conversation with the advisor, a reply box and the cancellation.

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Modal } from '@/shared/components/ui/Modal';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { ConfirmDialog } from '../../management/components/ConfirmDialog';
import { RequestStatusBadge } from '../../advising/components/RequestStatusBadge';
import type { AdvisingRequestStatus } from '../../advising/types/advising';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { useAuth } from '../../auth/stores/useAuth';
import { replySchema } from '../validations/advisingRequest.schema';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const isClosed = (status: string) => status === 'RESOLVED' || status === 'CANCELLED';

export function AdvisingRequestDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const user = useAuth((s) => s.user);
  const detail = useQuery({
    queryKey: ['student', 'advising-requests', 'detail', id],
    queryFn: () => studentAcademicService.advisingDetail(id as string),
    enabled: !!id,
  });
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['student', 'advising-requests'] }),
      queryClient.invalidateQueries({ queryKey: ['student', 'assignment'] }),
    ]);

  const close = () => {
    setReply('');
    setReplyError('');
    setConfirmCancel(false);
    onClose();
  };

  const send = async () => {
    const parsed = replySchema.safeParse({ content: reply });
    if (!parsed.success) {
      setReplyError(parsed.error.issues[0]?.message ?? 'Write a message first');
      return;
    }
    setSending(true);
    try {
      await studentAcademicService.reply(id as string, parsed.data.content);
      setReply('');
      setReplyError('');
      await refresh();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSending(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      await studentAcademicService.cancel(id as string);
      toast.success('Request cancelled');
      setConfirmCancel(false);
      await refresh();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  const data = detail.data;
  const messages = (data?.messages ?? []).filter((message) => !message.internal);

  return (
    <>
      <Modal open={!!id} onClose={close} title="Advising request" className="max-w-[640px]">
        <div className="border-b border-[#f1f5f9] p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 break-words text-lg font-semibold text-[#151c27]">{data?.request.title ?? 'Advising request'}</h2>
            {data && <RequestStatusBadge status={data.request.status as AdvisingRequestStatus} cancelledLabel="Cancelled" />}
          </div>
          {data && (
            <p className="mt-1 text-[13px] text-[#555f6f]">
              Advisor: {data.request.advisorName ?? 'Not assigned'} · Sent {formatDateTime(data.request.createdAt)}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {detail.isLoading && <p className="text-sm text-[#555f6f]">Loading request...</p>}
          {detail.isError && <p className="text-sm text-red-600">Unable to load this request.</p>}

          {data && (
            <>
              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">Your question</p>
                <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-[#f7f8fa] p-3 text-sm text-[#151c27]">{data.request.description}</p>
              </section>

              {data.request.resolutionSummary && (
                <section>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">Resolution</p>
                  <p className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    {data.request.resolutionSummary}
                  </p>
                </section>
              )}

              <section>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">Conversation</p>
                {messages.length === 0 ? (
                  <p className="mt-2 text-[13px] text-[#555f6f]">No messages yet. Your advisor will reply here.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {messages.map((message) => {
                      const mine = message.senderId === user?.id;
                      return (
                        <li key={message.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                          <div className={cn('max-w-[85%] rounded-2xl px-3.5 py-2 text-sm', mine ? 'bg-[#F26F21] text-white' : 'bg-[#f1f5f9] text-[#151c27]')}>
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
            </>
          )}
        </div>

        {data && !isClosed(data.request.status) && (
          <div className="space-y-2 border-t border-[#f1f5f9] p-5">
            <label htmlFor="advising-reply" className="text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
              Reply to your advisor
            </label>
            <textarea
              id="advising-reply"
              rows={3}
              maxLength={10000}
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                setReplyError('');
              }}
              aria-invalid={!!replyError}
              placeholder="Write a message..."
              className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#F26F21] aria-[invalid=true]:border-red-400"
            />
            {replyError && <p className="text-[12px] text-red-600">{replyError}</p>}
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setConfirmCancel(true)} className="text-[13px] font-semibold text-red-700 underline">
                Cancel this request
              </button>
              <button
                type="button"
                onClick={send}
                disabled={sending}
                className="rounded-lg bg-[#F26F21] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#e05f14] disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send reply'}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-[#f1f5f9] p-4">
          <button type="button" onClick={close} className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50">
            Close
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this request?"
        message="Your advisor will no longer see it as open. You can send a new request at any time."
        confirmLabel="Cancel request"
        destructive
        isLoading={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}
