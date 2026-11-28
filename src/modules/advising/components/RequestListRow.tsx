// Row markup for the advisor ticket table.

import { cn } from '@/shared/lib/utils';
import { TableCell, TableRow } from '../../../shared/components/common/table/TablePrimitives';
import { RequestRowActions } from './RequestRowActions';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestTypeLabel } from './RequestTypeLabel';
import type { AdvisingRequest } from '../types/advising';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

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
  claiming: boolean;
  onClaim: () => void;
  onOpen: () => void;
}

function HandledBy({ request: r }: { request: AdvisingRequest }) {
  if (r.status === 'PENDING') return <span className="text-sm font-medium text-[var(--ink-muted)]">— unclaimed —</span>;
  const mine = r.participatedByMe === true;
  return (
    <div className="flex flex-col gap-1">
      <span className={cn('text-sm font-bold', mine ? 'text-[var(--brand)]' : 'text-[var(--ink-primary)]')}>
        {r.advisorName ?? 'Unknown'}
      </span>
      <span
        className={cn(
          'text-[11px] uppercase tracking-wide',
          mine ? 'font-bold text-[var(--brand)]' : 'font-semibold text-[var(--ink-muted)]',
        )}
      >
        {mine ? 'Yours' : 'Another advisor'}
      </span>
    </div>
  );
}

export function RequestTableRow({ request: r, claiming, onClaim, onOpen }: RequestTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={cn(
              'flex size-11 shrink-0 items-center justify-center',
              'rounded-xl bg-[var(--brand)] text-sm font-extrabold text-white shadow-sm',
            )}
          >
            {initialsOf(r.studentName)}
          </span>
          <div className="min-w-0">
            <p className="block max-w-full truncate text-sm font-bold text-[var(--ink-primary)]">{r.studentName ?? '—'}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[var(--ink-muted)]">{r.studentCode ?? '—'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-40">
        <span className="block truncate" title={r.description ?? undefined}>
          <RequestTypeLabel requestType={r.requestType} />
        </span>
        {r.description && (
          <span className="mt-1 block max-w-40 truncate text-sm font-normal text-[var(--ink-muted)]" title={r.description}>
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
      <TableCell className="whitespace-nowrap">
        <span className="block text-sm font-bold tabular-nums text-[var(--ink-primary)]">{r.studentMajorGroupCode ?? '—'}</span>
        {r.sameMajorGroup && (
          <span
            className={cn(
              'mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase',
              'tracking-wide text-emerald-800 ring-1 ring-inset ring-emerald-200',
            )}
          >
            Same Major Group
          </span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <HandledBy request={r} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <RequestRowActions request={r} claiming={claiming} onClaim={onClaim} onOpen={onOpen} />
        </div>
      </TableCell>
    </TableRow>
  );
}
