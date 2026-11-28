// One advising ticket from the student's side. A pending ticket waits in the queue with the chat hidden,
// an in-progress one (claimed by an advisor) can be replied to, and a closed one shows its resolution.

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '@/shared/components/ui/Modal';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { ConfirmDialog } from '../../management/components/ConfirmDialog';
import { RequestStatusBadge } from '../../advising/components/RequestStatusBadge';
import { ticketStatusLine } from '../../advising/utils/ticketStatus';
import { studentBookingLink } from '../../advising/utils/appointmentLink';
import type { AdvisingRequestStatus } from '../../advising/types/advising';
import { studentService } from '../services/studentService';
import { useAuth } from '../../auth/stores/useAuth';
import { replySchema } from '../validations/advisingRequest.schema';
import { TicketAppointmentLinks } from './ticket-detail/TicketAppointmentLinks';
import { TicketConversation } from './ticket-detail/TicketConversation';
import { TicketReplyBox } from './ticket-detail/TicketReplyBox';
import { formatDateTime, isClosedStatus } from './ticket-detail/ticketFormat';

const SECTION_LABEL = 'text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]';
const RESOLUTION_CLASS =
  'mt-1 whitespace-pre-wrap break-words rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900';

export function AdvisingRequestDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const user = useAuth((s) => s.user);
  const detail = useQuery({
    queryKey: ['student', 'advising-requests', 'detail', id],
    queryFn: () => studentService.getAdvisingRequestDetail(id as string),
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
      await studentService.sendAdvisingReply(id as string, parsed.data.content);
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
      await studentService.cancelAdvisingRequest(id as string);
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
  const status = (data?.request.status ?? 'PENDING') as AdvisingRequestStatus;
  const closed = isClosedStatus(status);
  const hasLinkedAppointment = Boolean(data?.request.linkedAppointmentId);
  const bookingLink = hasLinkedAppointment || closed ? null : studentBookingLink(data?.request.id ?? null);

  return (
    <>
      <Modal open={!!id} onClose={close} title="Advising Request Detail" className="max-w-[640px]">
        <div className="border-b border-[#f1f5f9] p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 break-words text-lg font-semibold text-[#151c27]">
              {data?.request.title ?? 'Advising Request'}
            </h2>
            {data && <RequestStatusBadge status={status} />}
          </div>
          {data && (
            <p className="mt-1 text-[13px] text-[#555f6f]">
              {ticketStatusLine(status, data.request.advisorName)} · Sent {formatDateTime(data.request.createdAt)}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {detail.isLoading && <p className="text-sm text-[#555f6f]">Loading request...</p>}
          {detail.isError && <p className="text-sm text-red-600">Unable to load this request.</p>}
          {data && (
            <>
              <section>
                <p className={SECTION_LABEL}>Your question</p>
                <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-[#f7f8fa] p-3 text-sm text-[#151c27]">
                  {data.request.description}
                </p>
              </section>
              {data.request.resolutionSummary && (
                <section>
                  <p className={SECTION_LABEL}>Resolution</p>
                  <p className={RESOLUTION_CLASS}>
                    {data.request.resolutionSummary}
                  </p>
                </section>
              )}
              <TicketAppointmentLinks hasLinkedAppointment={hasLinkedAppointment} bookingLink={bookingLink} />
              <TicketConversation
                pending={status === 'PENDING'}
                messages={data.messages.filter((message) => !message.internal)}
                currentUserId={user?.id}
              />
            </>
          )}
        </div>

        {data && status === 'IN_PROGRESS' && (
          <TicketReplyBox
            value={reply}
            error={replyError}
            sending={sending}
            onChange={(next) => {
              setReply(next);
              setReplyError('');
            }}
            onSend={() => void send()}
            onCancelRequest={() => setConfirmCancel(true)}
          />
        )}

        {data && closed && (
          <div className="border-t border-[#f1f5f9] px-5 py-3">
            <p className="text-[13px] text-[#555f6f]">This request is closed and no longer accepts messages.</p>
          </div>
        )}

        <div className="flex justify-end border-t border-[#f1f5f9] p-4">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this request?"
        message="The request will be closed and the advisor can no longer work on it. You can send a new request at any time."
        confirmLabel="Cancel request"
        destructive
        isLoading={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}
