// State and actions of the advisor ticket chat: load the thread, claim, reply, resolve or reject.

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { useAuth } from '../../auth/stores/useAuth';
import { advisorService } from '../services/advisorService';
import type { AdvisingRequest } from '../types/advising';

export const MAX_TICKET_MESSAGE = 10000;
export type TicketDecision = 'resolve' | 'reject';

const DECISIONS = {
  resolve: { status: 'RESOLVED', missing: 'A resolution summary is required before closing the request.', done: 'Request closed' },
  reject: { status: 'REJECTED', missing: 'A reason is required before rejecting the request.', done: 'Request rejected' },
} as const;

export function useAdvisorTicket(request: AdvisingRequest | null) {
  const queryClient = useQueryClient();
  const currentUserId = useAuth((state) => state.user?.id);
  const requestId = request?.id ?? null;
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [decision, setDecision] = useState<TicketDecision | null>(null);
  const [busy, setBusy] = useState<'claim' | 'send' | TicketDecision | null>(null);

  const detail = useQuery({
    queryKey: ['advisor', 'advising-requests', 'detail', requestId],
    queryFn: () => advisorService.getRequestDetail(requestId as string),
    enabled: !!requestId,
  });

  useEffect(() => {
    setReply('');
    setReplyError('');
    setSummary('');
    setSummaryError('');
    setDecision(null);
  }, [requestId]);

  const live = detail.data?.request ?? request;
  // Shared queue: any advisor may reply, but only the one holding the ticket closes it.
  const isMine = useMemo(() => {
    if (!live) return false;
    if (live.participatedByMe === true) return true;
    return !!live.advisorId && !!currentUserId && live.advisorId === currentUserId;
  }, [live, currentUserId]);

  const run = async (kind: NonNullable<typeof busy>, action: () => Promise<unknown>, after?: () => void) => {
    if (!requestId || busy) return;
    setBusy(kind);
    try {
      await action();
      after?.();
      await queryClient.invalidateQueries({ queryKey: ['advisor'] });
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const claim = () =>
    run('claim', () => advisorService.claimRequest(requestId as string), () =>
      toast.success('Request claimed', { description: 'You can now reply to the student and close the request when done.' }),
    );

  const send = () => {
    const content = reply.trim();
    if (!content) return setReplyError('Write a message before sending.');
    if (content.length > MAX_TICKET_MESSAGE) return setReplyError('The message is too long.');
    return run('send', () => advisorService.sendRequestMessage(requestId as string, content), () => {
      setReply('');
      setReplyError('');
    });
  };

  const decide = (kind: TicketDecision) => {
    const text = summary.trim();
    const config = DECISIONS[kind];
    if (!text) return setSummaryError(config.missing);
    const body = { status: config.status, resolutionSummary: text };
    return run(kind, () => advisorService.updateRequestStatus(requestId as string, body), () => {
      toast.success(config.done, { description: 'The student has been notified.' });
      setSummary('');
      setSummaryError('');
      setDecision(null);
    });
  };

  return {
    detail,
    live,
    messages: detail.data?.messages ?? [],
    currentUserId,
    isMine,
    reply: { value: reply, error: replyError, set: (v: string) => { setReply(v); setReplyError(''); } },
    summary: { value: summary, error: summaryError, set: (v: string) => { setSummary(v); setSummaryError(''); } },
    decision,
    toggleDecision: (kind: TicketDecision) => {
      setDecision((current) => (current === kind ? null : kind));
      setSummaryError('');
    },
    busy,
    claim,
    send,
    decide,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['advisor'] }),
  };
}
