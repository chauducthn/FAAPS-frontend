// Advisor view of one ticket in the shared queue: claim it, chat with the student, then resolve or reject.
// Claiming does not lock the ticket, so any advisor can reply; only the holder can reject it.

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { AdvisorScheduleModal } from '../../appointment/components/AdvisorScheduleModal';
import { useAdvisorTicket } from '../hooks/useAdvisorTicket';
import type { AdvisingRequest } from '../types/advising';
import { TicketComposer } from './ticket-chat/TicketComposer';
import { TicketDecisionPanel } from './ticket-chat/TicketDecisionPanel';
import { TicketHeader } from './ticket-chat/TicketHeader';
import { TicketClaimBar, TicketClosedBar } from './ticket-chat/TicketStateBar';
import { TicketThread } from './ticket-chat/TicketThread';

interface Props {
  request: AdvisingRequest | null;
  onClose: () => void;
}

export function AdvisorRequestDetailModal({ request, onClose }: Props) {
  const ticket = useAdvisorTicket(request);
  const [showSchedule, setShowSchedule] = useState(false);
  const { live, decision } = ticket;
  const status = live?.status ?? 'PENDING';
  const isClosed = status === 'RESOLVED' || status === 'REJECTED' || status === 'CANCELLED';

  return (
    <Modal open={!!request} onClose={onClose} title="Advising Request Detail" className="max-w-[780px]">
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        <TicketHeader live={live} isMine={ticket.isMine} onClose={onClose} onSchedule={() => setShowSchedule(true)} />
        <TicketThread
          ticketId={request?.id ?? null}
          messages={ticket.messages}
          currentUserId={ticket.currentUserId}
          isLoading={ticket.detail.isLoading}
          isError={ticket.detail.isError}
          onRetry={() => void ticket.detail.refetch()}
        />
        {status === 'PENDING' ? (
          <TicketClaimBar claiming={ticket.busy === 'claim'} onClaim={() => void ticket.claim()} />
        ) : isClosed ? (
          <TicketClosedBar status={status} />
        ) : (
          <>
            <TicketComposer
              isMine={ticket.isMine}
              advisorName={live?.advisorName}
              value={ticket.reply.value}
              error={ticket.reply.error}
              sending={ticket.busy === 'send'}
              decision={decision}
              onChange={ticket.reply.set}
              onSend={() => void ticket.send()}
              onToggleDecision={ticket.toggleDecision}
            />
            {decision && (
              <TicketDecisionPanel
                kind={decision}
                value={ticket.summary.value}
                error={ticket.summary.error}
                pending={ticket.busy === decision}
                onChange={ticket.summary.set}
                onCancel={() => ticket.toggleDecision(decision)}
                onConfirm={() => void ticket.decide(decision)}
              />
            )}
          </>
        )}
      </div>

      <AdvisorScheduleModal
        open={showSchedule}
        studentId={live?.studentId ?? null}
        studentName={live?.studentName ?? null}
        advisingRequestId={live?.id ?? null}
        onClose={() => setShowSchedule(false)}
        onScheduled={() => void ticket.refresh()}
      />
    </Modal>
  );
}
