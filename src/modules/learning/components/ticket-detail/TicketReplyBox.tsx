// Reply box of an in-progress ticket, with the way to cancel the request.

import { cn } from '@/shared/lib/utils';

interface TicketReplyBoxProps {
  value: string;
  error: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onCancelRequest: () => void;
}

export function TicketReplyBox({ value, error, sending, onChange, onSend, onCancelRequest }: TicketReplyBoxProps) {
  return (
    <div className="space-y-2 border-t border-[#f1f5f9] p-5">
      <label htmlFor="advising-reply" className="text-[11px] font-bold uppercase tracking-wide text-[#555f6f]">
        Send a message to the advisor
      </label>
      <textarea
        id="advising-reply"
        rows={3}
        maxLength={10000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        placeholder="Write the details you need help with..."
        className={cn(
          'w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none',
          'focus:border-[#F26F21] aria-[invalid=true]:border-red-400',
        )}
      />
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onCancelRequest} className="text-[13px] font-semibold text-red-700 underline">
          Cancel this request
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          className={cn(
            'inline-flex items-center rounded-lg bg-[#F26F21] px-4 py-2 text-[13px] font-bold text-white',
            'hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {sending ? 'Sending...' : 'Send message'}
        </button>
      </div>
    </div>
  );
}
