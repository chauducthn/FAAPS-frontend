// src/modules/advising/components/chat/ChatHeader.tsx
// The header of an open advisor conversation: who is chatting, the request
// description, the resolution summary and the status actions.

import { CircleCheckBig, Lock } from 'lucide-react';
import { RequestStatusBadge } from '../RequestStatusBadge';
import { formatStamp, initialsOf, typeLabelOf } from './format';

interface Props {
  title: string;
  studentName: string;
  requestType: string;
  status: string;
  updatedAt: string;
  description: string | null;
  resolutionSummary: string | null;
  /** True when the thread carries at least one internal note. */
  hasInternalNotes: boolean;
  /** A closed conversation (RESOLVED / CANCELLED) hides the action buttons. */
  isClosed: boolean;
  showResolve: boolean;
  busy: boolean;
  onMarkInProgress: () => void;
  onToggleResolve: () => void;
}

export default function ChatHeader({
  title,
  studentName,
  requestType,
  status,
  updatedAt,
  description,
  resolutionSummary,
  hasInternalNotes,
  isClosed,
  showResolve,
  busy,
  onMarkInProgress,
  onToggleResolve,
}: Props) {
  return (
    <div className="border-b border-slate-200 p-5 sm:px-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
          >
            {initialsOf(studentName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold tracking-tight text-slate-900">{title}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-600">
              <span className="font-bold text-slate-900">{studentName}</span>
              <span aria-hidden>·</span>
              <span>{typeLabelOf(requestType)}</span>
              <span aria-hidden>·</span>
              <span>Updated {formatStamp(updatedAt)}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <RequestStatusBadge status={status as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED'} />
              {hasInternalNotes && (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-300">
                  <Lock className="size-3.5" aria-hidden />
                  Has internal notes
                </span>
              )}
            </div>
          </div>
        </div>
        {!isClosed && (
          <div className="flex shrink-0 items-center gap-2.5">
            {status === 'PENDING' && (
              <button
                type="button"
                onClick={onMarkInProgress}
                disabled={busy}
                className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21] disabled:opacity-50"
              >
                Mark in progress
              </button>
            )}
            <button
              type="button"
              onClick={onToggleResolve}
              aria-expanded={showResolve}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <CircleCheckBig className="size-4" aria-hidden />
              Resolve
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
        {description || 'No description provided.'}
      </p>

      {resolutionSummary && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium leading-relaxed text-emerald-950">
          <CircleCheckBig className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-extrabold">Resolution: </span>
            {resolutionSummary}
          </span>
        </p>
      )}
    </div>
  );
}
