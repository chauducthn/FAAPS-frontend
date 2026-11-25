// Row markup for the advising request list.

import type { RefObject } from 'react';
import { CheckCircle2, Hourglass, Loader2, MoreHorizontal, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { TableCell, TableRow } from '../../../shared/components/common/table/TablePrimitives';
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
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={cn(
              'flex size-11 shrink-0 items-center justify-center',
              'rounded-xl bg-[var(--brand)] text-sm font-extrabold',
              'text-white shadow-sm',
            )}
          >
            {initialsOf(r.studentName)}
          </span>
          <div className="min-w-0">
            <p className="block max-w-full truncate text-sm font-bold text-[var(--ink-primary)]">
              {r.studentName ?? '—'}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--ink-muted)]">
              {r.studentCode ?? '—'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-40">
        <span className="block truncate" title={r.description ?? undefined}>
          <RequestTypeLabel requestType={r.requestType} />
        </span>
        {r.description && (
          <span
            className="mt-1 block max-w-40 truncate text-sm font-normal text-[var(--ink-muted)]"
            title={r.description}
          >
            {r.description}
          </span>
        )}
      </TableCell>
      <TableCell className="max-w-[220px]">
        <span className="line-clamp-2 font-bold leading-snug text-[var(--ink-primary)]" title={r.title}>
          {r.title}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap font-medium tabular-nums">{formatDate(r.createdAt)}</TableCell>
      <TableCell className="whitespace-nowrap">
        <RequestStatusBadge status={r.status} className="px-3 py-1 text-xs font-bold" />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          {r.status === 'PENDING' || r.status === 'IN_PROGRESS' ? (
            <>
              <button
                type="button"
                onClick={onAccept}
                className={cn(
                  'inline-flex h-11 items-center gap-1.5',
                  'whitespace-nowrap rounded-xl bg-[var(--brand)] px-5',
                  'text-sm font-bold text-white shadow-sm',
                  'transition-colors hover:bg-[var(--brand-hover)]',
                )}
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
                    'inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-white shadow-sm transition-colors',
                    menuOpen
                      ? 'border-[var(--brand)]/50 bg-[var(--brand-soft)] text-[var(--brand)]'
                      : cn(
                          'border-[var(--line)] text-[var(--ink-secondary)]',
                          'hover:border-[var(--brand)]/40 hover:bg-[var(--brand-soft)]',
                          'hover:text-[var(--ink-primary)]',
                        ),
                  )}
                >
                  <MoreHorizontal className="size-5" aria-hidden />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    aria-label="More actions"
                    className={cn(
                      'absolute right-0 top-full z-20 mt-2 w-56',
                      'overflow-hidden rounded-xl border',
                      'border-[var(--line)] bg-white py-1.5 shadow-xl',
                    )}
                  >
                    {r.status === 'PENDING' && (
                      <button
                        type="button"
                        role="menuitem"
                        disabled={busy}
                        onClick={onInProgress}
                        className={cn(
                          'flex h-11 w-full items-center gap-2.5 px-4 text-left',
                          'text-sm font-semibold text-[var(--ink-secondary)]',
                          'transition-colors hover:bg-[var(--surface-hover)]',
                          'disabled:opacity-50',
                        )}
                      >
                        {busy ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Hourglass className="size-4 text-[var(--ink-subtle)]" aria-hidden />
                        )}
                        {busy ? 'Saving…' : 'Mark in progress'}
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={onReject}
                      className={cn(
                        'flex h-11 w-full items-center gap-2.5 px-4 text-left',
                        'text-sm font-semibold text-red-700 transition-colors',
                        'hover:bg-red-50',
                      )}
                    >
                      <XCircle className="size-4" aria-hidden />
                      Reject request
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="inline-flex h-11 items-center text-sm font-medium text-[var(--ink-muted)]">—</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
