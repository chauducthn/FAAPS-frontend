// Pagination footer for DataTable: row summary, page size, numbered pages and an optional page jump.

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { PageJumpInput } from './DataTableControls';

interface DataTablePaginationProps {
  totalRows: number;
  firstRow: number;
  lastRow: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  pageSizes: number[];
  showPageSizeSelect: boolean;
  showPageJump: boolean;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageSizeChange: (size: number) => void;
  onPageIndexChange: (index: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

type PageSlot = number | 'gap-start' | 'gap-end';

/** First, last and the pages around the current one; a gap of a single page shows that page instead of "…". */
export function pageWindow(pageIndex: number, totalPages: number): PageSlot[] {
  const wanted = new Set([0, totalPages - 1, pageIndex - 1, pageIndex, pageIndex + 1]);
  if (pageIndex <= 2) [1, 2, 3].forEach((p) => wanted.add(p));
  if (pageIndex >= totalPages - 3) [totalPages - 2, totalPages - 3, totalPages - 4].forEach((p) => wanted.add(p));
  const pages = [...wanted].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b);

  const slots: PageSlot[] = [];
  pages.forEach((page, i) => {
    const prev = pages[i - 1];
    if (prev !== undefined && page - prev === 2) slots.push(prev + 1);
    if (prev !== undefined && page - prev > 2) slots.push(page < pageIndex ? 'gap-start' : 'gap-end');
    slots.push(page);
  });
  return slots;
}

const SQUARE_BUTTON =
  'inline-flex size-8 items-center justify-center rounded-md text-[13px] tabular-nums transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none';

export function DataTablePagination({
  totalRows,
  firstRow,
  lastRow,
  pageIndex,
  pageSize,
  totalPages,
  pageSizes,
  showPageSizeSelect,
  showPageJump,
  canPreviousPage,
  canNextPage,
  onPageSizeChange,
  onPageIndexChange,
  onPreviousPage,
  onNextPage,
}: DataTablePaginationProps) {
  const summary =
    totalRows === 0 ? 'No rows' : `${firstRow}–${lastRow} of ${totalRows.toLocaleString('en-US')} rows`;

  return (
    <div className="flex shrink-0 flex-col gap-2.5 border-t border-line bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[13px] text-ink-muted">
        <span className="tabular-nums">{summary}</span>
        {showPageSizeSelect && (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Rows per page"
            className={cn(
              'h-8 rounded-md border border-line bg-white px-2 text-[13px] text-ink-secondary',
              'outline-none focus:border-brand focus:ring-2 focus:ring-brand/15',
            )}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <span className="mr-2 text-xs text-ink-subtle tabular-nums">
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
          aria-label="Previous page"
          className={cn(SQUARE_BUTTON, 'text-ink-muted hover:bg-line-soft hover:text-ink-primary disabled:opacity-35')}
        >
          <CaretLeft className="size-4" aria-hidden />
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageWindow(pageIndex, totalPages).map((slot) =>
            typeof slot === 'number' ? (
              <button
                key={slot}
                type="button"
                onClick={() => onPageIndexChange(slot)}
                aria-label={`Page ${slot + 1}`}
                aria-current={slot === pageIndex ? 'page' : undefined}
                className={cn(
                  SQUARE_BUTTON,
                  'min-w-8 px-1.5',
                  slot === pageIndex
                    ? 'bg-brand-soft font-semibold text-brand-ink ring-1 ring-inset ring-brand/25'
                    : 'text-ink-muted hover:bg-line-soft hover:text-ink-primary',
                )}
              >
                {slot + 1}
              </button>
            ) : (
              <span key={slot} className="inline-flex size-8 items-center justify-center text-ink-subtle" aria-hidden>
                …
              </span>
            ),
          )}
        </div>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!canNextPage}
          aria-label="Next page"
          className={cn(SQUARE_BUTTON, 'text-ink-muted hover:bg-line-soft hover:text-ink-primary disabled:opacity-35')}
        >
          <CaretRight className="size-4" aria-hidden />
        </button>
        {showPageJump ? (
          <div className="ml-2 border-l border-line pl-3">
            <PageJumpInput pageIndex={pageIndex} totalPages={totalPages} onJump={onPageIndexChange} />
          </div>
        ) : null}
      </nav>
    </div>
  );
}
