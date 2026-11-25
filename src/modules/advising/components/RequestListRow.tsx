// Row and empty/loading/error state components for RequestListTable.

import type { RefObject } from 'react';
import { CheckCircle2, Hourglass, Inbox, Loader2, MoreHorizontal, SearchX, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestTypeLabel } from './RequestTypeLabel';
import type { AdvisingRequest } from '../types/advising';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function RequestTableState({
  cols,
  loading,
  error,
  empty,
  searching,
  onRetry,
}: {
  cols: number;
  loading: boolean;
  error: boolean;
  empty: string | null;
  searching: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-b-0">
            <td colSpan={cols} className="px-6 py-6">
              <div className="h-4 animate-pulse rounded-lg bg-slate-100" style={{ width: `${55 + (i % 3) * 15}%` }} />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            {error || !searching ? <Inbox className="size-5" aria-hidden /> : <SearchX className="size-5" aria-hidden />}
          </span>
          {error ? (
            <>
              <p className="text-base font-bold text-slate-900">Unable to load requests.</p>
              <button type="button" onClick={onRetry} className="inline-flex h-11 items-center px-4 text-sm font-bold text-orange-700 hover:underline">
                Try again
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-slate-900">{empty ?? 'No requests found.'}</p>
              <p className="text-sm font-medium text-slate-600">
                {searching ? 'Try a different keyword or switch tabs.' : 'There is no data to display yet.'}
              </p>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

interface RequestTableRowProps {
  request: AdvisingRequest;
  busy: boolean;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: () => void;
  onAccept: () => void;
  onInProgress: () => void;
  onReject: () => void;
}

export function RequestTableRow({
  request: r,
  busy,
  menuOpen,
  menuRef,
  onToggleMenu,
  onAccept,
  onInProgress,
  onReject,
}: RequestTableRowProps) {
  return (
    <tr className="bg-white transition-colors hover:bg-slate-50/70">
      <td className="px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
          >
            {initialsOf(r.studentName)}
          </span>
          <div className="min-w-0">
            <p className="block max-w-full truncate text-sm font-bold text-slate-900">{r.studentName ?? '—'}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-600">{r.studentCode ?? '—'}</p>
          </div>
        </div>
      </td>
      <td className="max-w-40 px-6 py-5 text-sm font-medium text-slate-700">
        <span className="block truncate" title={r.description ?? undefined}>
          <RequestTypeLabel requestType={r.requestType} />
        </span>
        {r.description && (
          <span className="mt-1 block max-w-40 truncate text-sm font-normal text-slate-600" title={r.description}>
            {r.description}
          </span>
        )}
      </td>
      <td className="max-w-[220px] px-6 py-5 text-sm font-bold text-slate-900">
        <span className="line-clamp-2 leading-snug" title={r.title}>{r.title}</span>
      </td>
      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium tabular-nums text-slate-700">
        {formatDate(r.createdAt)}
      </td>
      <td className="whitespace-nowrap px-6 py-5">
        <RequestStatusBadge status={r.status} className="px-3 py-1 text-xs font-bold" />
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-2">
          {r.status === 'PENDING' || r.status === 'IN_PROGRESS' ? (
            <>
              <button
                type="button"
                onClick={onAccept}
                className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#F26F21] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
              >
                <CheckCircle2 className="size-4" aria-hidden />
                {r.status === 'PENDING' ? 'Accept' : 'Resolve'}
              </button>
              <div className="relative" ref={menuOpen ? menuRef : undefined}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={`More actions for ${r.studentName ?? '—'}`}
                  onClick={onToggleMenu}
                  className={cn(
                    'inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-white text-slate-700 shadow-sm transition-colors',
                    menuOpen
                      ? 'border-[#F26F21]/50 bg-[#fff7f0] text-[#F26F21]'
                      : 'border-slate-200 hover:border-[#F26F21]/40 hover:bg-[#fff7f0] hover:text-slate-900',
                  )}
                >
                  <MoreHorizontal className="size-5" aria-hidden />
                </button>
                {menuOpen && (
                  <div role="menu" aria-label="More actions" className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                    {r.status === 'PENDING' && (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={onInProgress}
                        className="flex h-11 w-full items-center gap-2.5 px-4 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Hourglass className="size-4 text-slate-500" aria-hidden />}
                        {busy ? 'Saving…' : 'Mark in progress'}
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={onReject}
                      className="flex h-11 w-full items-center gap-2.5 px-4 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      <XCircle className="size-4" aria-hidden />
                      Reject request
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="inline-flex h-11 items-center text-sm font-medium text-slate-600">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
