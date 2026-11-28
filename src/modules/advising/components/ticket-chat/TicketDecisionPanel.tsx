// Required summary before closing a ticket: a resolution summary, or the reason for rejecting it.

import { useEffect, useRef } from 'react';
import { CheckCircle, Prohibit } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { MAX_TICKET_MESSAGE, type TicketDecision } from '../../hooks/useAdvisorTicket';

const COPY = {
  resolve: {
    label: 'Resolution summary',
    hint: '(shared with the student)',
    placeholder: 'Summarise the advice and the next steps for the student...',
    confirm: 'Confirm Resolution',
    pending: 'Closing…',
  },
  reject: {
    label: 'Reason for rejection',
    hint: '(required — shared with the student)',
    placeholder: 'Explain why this request cannot be handled as asked...',
    confirm: 'Confirm Rejection',
    pending: 'Rejecting…',
  },
} as const;

export const TEXTAREA_CLASS = cn(
  'mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-900 outline-none',
  'transition-colors focus:border-[#F26F21] focus:ring-2 focus:ring-[#F26F21]/30 aria-[invalid=true]:border-red-400',
);

interface TicketDecisionPanelProps {
  kind: TicketDecision;
  value: string;
  error: string;
  pending: boolean;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TicketDecisionPanel({ kind, value, error, pending, onChange, onCancel, onConfirm }: TicketDecisionPanelProps) {
  const copy = COPY[kind];
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const Icon = kind === 'resolve' ? CheckCircle : Prohibit;

  useEffect(() => {
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [kind]);

  return (
    <div
      id={`advisor-${kind}-panel`}
      className={cn('border-t p-5 sm:px-6', kind === 'resolve' ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60')}
    >
      <label htmlFor={`advisor-${kind}-summary`} className="block text-sm font-bold text-[#1A1A1A]">
        {copy.label} <span className="font-medium text-slate-600">{copy.hint}</span>
      </label>
      <textarea
        id={`advisor-${kind}-summary`}
        ref={inputRef}
        rows={3}
        maxLength={MAX_TICKET_MESSAGE}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        placeholder={copy.placeholder}
        className={TEXTAREA_CLASS}
      />
      {error && <p className="mt-1 text-[12px] font-semibold text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className={cn(
            'inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700',
            'shadow-sm hover:bg-slate-50',
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending || !value.trim()}
          className={cn(
            'inline-flex h-11 items-center gap-1.5 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm',
            'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            kind === 'resolve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700',
          )}
        >
          <Icon className="size-4" aria-hidden />
          {pending ? copy.pending : copy.confirm}
        </button>
      </div>
    </div>
  );
}
