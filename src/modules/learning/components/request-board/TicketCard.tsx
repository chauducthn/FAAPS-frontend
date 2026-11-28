// One ticket on the student board: title, status, a short description and who is handling it.

import { Clock, User } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisingRequest } from '../../../advising/types/advising';
import { initialsOf, relativeTime, STATUS_LABELS, STATUS_TONES } from './requestBoardModel';

export function TicketCard({ request, onOpen }: { request: AdvisingRequest; onOpen: () => void }) {
  const closed = request.status === 'RESOLVED' || request.status === 'CANCELLED';

  return (
    <article
      className={cn(
        'group rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_10px_24px_rgba(16,24,40,0.12)]',
        'focus-within:border-orange-300',
      )}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between gap-2.5">
          <h3
            className={cn(
              'min-w-0 flex-1 break-words text-[14px] font-extrabold leading-snug tracking-tight text-[#151c27]',
              'transition-colors group-hover:text-[#c2410c]',
            )}
            title={request.title}
          >
            {request.title}
          </h3>
          <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold', STATUS_TONES[request.status])}>
            {STATUS_LABELS[request.status] ?? STATUS_LABELS.PENDING}
          </span>
        </div>

        {request.description && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#555f6f]">{request.description}</p>
        )}

        {closed && request.resolutionSummary && (
          <p
            className={cn(
              'mt-3 line-clamp-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2',
              'text-[12px] leading-relaxed text-emerald-900',
            )}
          >
            {request.resolutionSummary}
          </p>
        )}

        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            <time dateTime={request.createdAt}>{relativeTime(request.createdAt)}</time>
          </span>
          {request.advisorName ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F26F21] text-[10px] font-extrabold text-white"
              >
                {initialsOf(request.advisorName)}
              </span>
              <span className="truncate text-[11px] font-bold text-[#555f6f]" title={request.advisorName}>
                {request.advisorName}
              </span>
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <User className="size-3.5" aria-hidden />
              No advisor yet
            </span>
          )}
        </div>
      </button>
    </article>
  );
}
