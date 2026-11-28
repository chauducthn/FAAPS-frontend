// Three-column board (pending, in progress, resolved) of the student's advising tickets.

import { WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdvisingRequest } from '../../../advising/types/advising';
import { COLUMNS, type BoardColumn } from './requestBoardModel';
import { TicketCard } from './TicketCard';

const COLUMN_CLASS =
  'flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]';

function Column({ column, items, onOpen }: { column: BoardColumn; items: AdvisingRequest[]; onOpen: (id: string) => void }) {
  const EmptyIcon = column.emptyIcon;
  return (
    <section aria-label={column.title} className={COLUMN_CLASS}>
      <header className={cn('flex items-center justify-between gap-3 border-b px-4 py-3.5', column.headerClass)}>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', column.iconClass)}>
            <column.icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold tracking-tight text-[#151c27]">{column.title}</h2>
            <p className="truncate text-[11px] font-medium text-[#555f6f]">{column.hint}</p>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-md bg-white px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-[#151c27]',
            'ring-1 ring-slate-200',
          )}
        >
          {items.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 bg-[#FAFAFA] p-3.5">
        {items.length === 0 ? (
          <div
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-slate-200',
              'bg-white/60 px-4 py-12 text-center',
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <EmptyIcon className="size-5" aria-hidden />
            </span>
            <p className="text-[13px] font-bold text-[#555f6f]">No requests yet</p>
            <p className="max-w-[220px] text-[12px] leading-relaxed text-slate-400">{column.empty}</p>
          </div>
        ) : (
          items.map((request) => <TicketCard key={request.id} request={request} onOpen={() => onOpen(request.id)} />)
        )}
      </div>
    </section>
  );
}

export function RequestBoard({
  grouped,
  onOpen,
}: {
  grouped: Record<BoardColumn['key'], AdvisingRequest[]>;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((column) => (
        <Column key={column.key} column={column} items={grouped[column.key]} onOpen={onOpen} />
      ))}
    </div>
  );
}

export function RequestBoardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-6 py-16 text-center shadow-sm">
      <span className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <WarningCircle className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-bold text-[#151c27]">Could not load your requests</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#555f6f]">
          The advising requests failed to load. Check your connection, then try again — the requests you
          sent are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#151c27] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
      >
        Retry
      </button>
    </div>
  );
}

export function RequestBoardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" aria-label="Loading advising requests">
      {[0, 1, 2].map((column) => (
        <div key={column} className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3.5">
            <div className="h-8 w-32 animate-pulse rounded-md bg-slate-200/70" />
            <div className="h-6 w-8 animate-pulse rounded-md bg-slate-200/70" />
          </div>
          <div className="flex flex-1 flex-col gap-3 bg-[#FAFAFA] p-3.5">
            {[0, 1].map((card) => (
              <div key={card} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="mt-2.5 h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
