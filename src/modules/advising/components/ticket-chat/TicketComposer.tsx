// Reply composer of an in-progress ticket, with Reject (holder only), Resolve and Send.

import { CheckCircle, PaperPlaneTilt, Prohibit } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { MAX_TICKET_MESSAGE, type TicketDecision } from '../../hooks/useAdvisorTicket';
import { TEXTAREA_CLASS } from './TicketDecisionPanel';

const TOGGLE = 'inline-flex h-11 items-center gap-1.5 rounded-xl border px-5 text-sm font-extrabold shadow-sm transition-colors';

interface TicketComposerProps {
  isMine: boolean;
  advisorName: string | null | undefined;
  value: string;
  error: string;
  sending: boolean;
  decision: TicketDecision | null;
  onChange: (value: string) => void;
  onSend: () => void;
  onToggleDecision: (kind: TicketDecision) => void;
}

export function TicketComposer(props: TicketComposerProps) {
  const { isMine, advisorName, value, error, sending, decision, onChange, onSend, onToggleDecision } = props;
  return (
    <>
      {!isMine && (
        <div className="border-t border-slate-200 bg-white px-5 pt-5 sm:px-6">
          <p
            className={cn(
              'flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900',
              'ring-1 ring-inset ring-amber-200',
            )}
          >
            <CheckCircle className="size-4 shrink-0" aria-hidden />
            {advisorName ?? 'Another advisor'} is handling this request — you can reply here too.
          </p>
        </div>
      )}
      <div className="border-t border-slate-200 bg-white p-5 sm:px-6">
        <label htmlFor="advisor-reply" className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
          Reply to student
        </label>
        <textarea
          id="advisor-reply"
          rows={3}
          maxLength={MAX_TICKET_MESSAGE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          placeholder="Write a reply to the student..."
          className={TEXTAREA_CLASS}
        />
        {error && <p className="mt-1 text-[12px] font-semibold text-red-600">{error}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {isMine && (
              <button
                type="button"
                onClick={() => onToggleDecision('reject')}
                aria-expanded={decision === 'reject'}
                aria-controls="advisor-reject-panel"
                className={cn(
                  TOGGLE,
                  decision === 'reject'
                    ? 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                    : 'border-red-300 bg-white text-red-600 hover:border-red-400 hover:bg-red-50',
                )}
              >
                <Prohibit className="size-4" aria-hidden /> Reject Request
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleDecision('resolve')}
              aria-expanded={decision === 'resolve'}
              aria-controls="advisor-resolve-panel"
              className={cn(
                TOGGLE,
                decision === 'resolve'
                  ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                  : 'border-green-300 bg-white text-green-600 hover:border-green-400 hover:bg-green-50',
              )}
            >
              <CheckCircle className="size-4" aria-hidden /> Resolve Request
            </button>
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !value.trim()}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#F26F21] px-6 text-sm font-extrabold text-white shadow-sm',
              'transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <PaperPlaneTilt className="size-4" aria-hidden />
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </>
  );
}
