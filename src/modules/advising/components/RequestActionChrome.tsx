// Hero header and action footer for RequestActionModal.

import { CalendarBlank as CalendarDays, CheckCircle as CheckCircle2, User, XCircle } from '@phosphor-icons/react';
import { RequestStatusBadge } from './RequestStatusBadge';
import { REQUEST_TYPE_LABELS } from './RequestTypeLabel';
import type { AdvisingRequest } from '../types/advising';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function RequestActionHero({ request }: { request: AdvisingRequest }) {
  return (
    <div className="relative overflow-hidden bg-[var(--brand)] px-6 pb-5 pt-6 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
      <div className="relative flex flex-wrap items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white/95 text-lg font-bold text-[#F26F21] shadow">
          {initialsOf(request.studentName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            {REQUEST_TYPE_LABELS[request.requestType] ?? request.requestType} · {request.studentCode ?? '—'}
          </p>
          <h2 className="mt-0.5 truncate text-xl font-bold">{request.title}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-white/90">
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" aria-hidden />
              {request.studentName ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatDateTime(request.createdAt)}
            </span>
          </p>
        </div>
        <RequestStatusBadge status={request.status} className="bg-white/95 ring-white/40" />
      </div>
    </div>
  );
}

interface RequestActionFooterProps {
  isReject: boolean;
  isPending: boolean;
  summaryEmpty: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function RequestActionFooter({
  isReject,
  isPending,
  summaryEmpty,
  onClose,
  onSubmit,
}: RequestActionFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-white px-5 py-3.5">
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        Close
      </button>
      {isReject ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || summaryEmpty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          <XCircle className="size-4" aria-hidden />
          {isPending ? 'Rejecting...' : 'Confirm rejection'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || summaryEmpty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" aria-hidden />
          {isPending ? 'Saving...' : 'Confirm acceptance'}
        </button>
      )}
    </div>
  );
}
