// Row actions of the advisor ticket table: claim or view a pending ticket, open an active one, view a closed one.

import { CheckCircle, Eye, Hand, SpinnerGap } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisingRequest } from '../types/advising';

const BUTTON = 'inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-bold shadow-sm transition-colors';
const PRIMARY = 'bg-[var(--brand)] px-5 text-white hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-50';
const SECONDARY = 'border border-[var(--line)] bg-white px-4 text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)]';

interface RequestRowActionsProps {
  request: AdvisingRequest;
  claiming: boolean;
  onClaim: () => void;
  onOpen: () => void;
}

export function RequestRowActions({ request, claiming, onClaim, onOpen }: RequestRowActionsProps) {
  if (request.status === 'PENDING') {
    return (
      <>
        <button type="button" onClick={onClaim} disabled={claiming} className={cn(BUTTON, PRIMARY)}>
          {claiming ? <SpinnerGap className="size-4 animate-spin" aria-hidden /> : <Hand className="size-4" aria-hidden />}
          {claiming ? 'Claiming…' : 'Claim request'}
        </button>
        <button type="button" onClick={onOpen} className={cn(BUTTON, SECONDARY)}>
          <Eye className="size-4" aria-hidden />
          View
        </button>
      </>
    );
  }

  if (request.status === 'IN_PROGRESS') {
    // Any advisor can join the thread; the one holding the ticket gets the primary style.
    const mine = request.participatedByMe === true;
    return (
      <button type="button" onClick={onOpen} className={cn(BUTTON, mine ? PRIMARY : SECONDARY)}>
        {mine ? <CheckCircle className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        Open &amp; reply
      </button>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={cn(BUTTON, SECONDARY)}>
      <Eye className="size-4" aria-hidden />
      View
    </button>
  );
}
