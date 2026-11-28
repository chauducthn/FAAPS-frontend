// Footer of a ticket that cannot be replied to: claim a pending ticket, or the closed notice.

import { CheckCircle, Hand, Prohibit } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisingRequestStatus } from '../../types/advising';

export function TicketClaimBar({ claiming, onClaim }: { claiming: boolean; onClaim: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white p-5 sm:px-6">
      <p className="text-sm font-medium text-slate-600">This request is waiting in the queue — any advisor can pick it up.</p>
      <button
        type="button"
        onClick={onClaim}
        disabled={claiming}
        className={cn(
          'inline-flex h-11 items-center gap-2 rounded-xl bg-[#F26F21] px-5 text-sm font-extrabold text-white shadow-sm',
          'transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <Hand className="size-4" aria-hidden />
        {claiming ? 'Claiming…' : 'Claim Request'}
      </button>
    </div>
  );
}

export function TicketClosedBar({ status }: { status: AdvisingRequestStatus }) {
  const rejected = status === 'REJECTED';
  return (
    <div className="border-t border-slate-200 bg-white p-5 sm:px-6">
      <p
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-inset',
          rejected ? 'bg-red-50 text-red-900 ring-red-200' : 'bg-slate-50 text-slate-600 ring-slate-200',
        )}
      >
        {rejected ? <Prohibit className="size-4 shrink-0" aria-hidden /> : <CheckCircle className="size-4 shrink-0" aria-hidden />}
        {rejected ? 'This request was rejected — no further replies.' : 'This request is closed — no further replies.'}
      </p>
    </div>
  );
}
