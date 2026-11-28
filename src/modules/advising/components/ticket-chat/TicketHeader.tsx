// Header of the advisor ticket chat: student, ticket meta, who handles it, and the related actions.

import { CalendarPlus, CheckCircle, Hand, Prohibit, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { RequestStatusBadge } from '../RequestStatusBadge';
import { Student360Button } from '../Student360Button';
import { formatStamp, initialsOf, typeLabelOf } from '../chat/format';
import type { AdvisingRequest } from '../../types/advising';

const PILL = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset';

function HandlerPill({ live, isMine }: { live: AdvisingRequest; isMine: boolean }) {
  if (live.status === 'PENDING') {
    return (
      <span className={cn(PILL, 'bg-orange-50 text-orange-800 ring-orange-200')}>
        <Hand className="size-3.5" aria-hidden /> Waiting in the queue — no advisor has claimed it yet
      </span>
    );
  }
  if (isMine) {
    return (
      <span className={cn(PILL, 'bg-blue-50 text-blue-800 ring-blue-200')}>
        <CheckCircle className="size-3.5" aria-hidden /> You are handling this request
      </span>
    );
  }
  return (
    <span className={cn(PILL, 'bg-slate-100 text-slate-700 ring-slate-200')}>
      Being handled by {live.advisorName ?? 'another advisor'} — you can join in
    </span>
  );
}

function Outcome({ live }: { live: AdvisingRequest }) {
  const closed = live.status === 'RESOLVED' || live.status === 'REJECTED' || live.status === 'CANCELLED';
  if (!closed || !live.resolutionSummary) return null;
  const rejected = live.status === 'REJECTED';
  return (
    <p
      className={cn(
        'mt-3 flex items-start gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium leading-relaxed',
        rejected ? 'border-red-200 bg-red-50 text-red-950' : 'border-emerald-200 bg-emerald-50 text-emerald-950',
      )}
    >
      {rejected ? (
        <Prohibit className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <CheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <span>
        <span className="font-extrabold">{rejected ? 'Rejected: ' : 'Resolution: '}</span>
        {live.resolutionSummary}
      </span>
    </p>
  );
}

interface TicketHeaderProps {
  live: AdvisingRequest | null;
  isMine: boolean;
  onClose: () => void;
  onSchedule: () => void;
}

export function TicketHeader({ live, isMine, onClose, onSchedule }: TicketHeaderProps) {
  const meta = [live?.studentCode, typeLabelOf(live?.requestType ?? ''), live?.createdAt && `Sent ${formatStamp(live.createdAt)}`];
  return (
    <div className="border-b border-slate-200 p-5 sm:px-6">
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-extrabold text-white"
        >
          {initialsOf(live?.studentName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="break-words text-[17px] font-extrabold tracking-tight text-slate-900">{live?.title || 'Advising Request'}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-600">
                <span className="font-bold text-slate-900">{live?.studentName ?? '—'}</span>
                {meta.filter(Boolean).map((part) => (
                  <span key={String(part)} className="tabular-nums">· {part}</span>
                ))}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {live && <RequestStatusBadge status={live.status} className="px-3 py-1 text-xs font-bold" />}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-md text-slate-500 transition-colors',
                  'hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>
          {live && <div className="mt-3 flex flex-wrap items-center gap-2"><HandlerPill live={live} isMine={isMine} /></div>}
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <Student360Button studentId={live?.studentId} studentName={live?.studentName} className="h-11" />
            <button
              type="button"
              onClick={onSchedule}
              disabled={!live?.studentId}
              className={cn(
                'inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700',
                'shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <CalendarPlus className="size-4" aria-hidden /> Schedule Appointment
            </button>
            {live?.linkedAppointmentId && (
              <span className={cn(PILL, 'bg-emerald-50 text-emerald-800 ring-emerald-200')}>
                <CheckCircle className="size-3.5" aria-hidden /> An appointment is already linked to this request
              </span>
            )}
          </div>
        </div>
      </div>
      {live?.description && (
        <p
          className={cn(
            'mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed',
            'text-slate-700 ring-1 ring-inset ring-slate-200',
          )}
        >
          {live.description}
        </p>
      )}
      {live && <Outcome live={live} />}
    </div>
  );
}
