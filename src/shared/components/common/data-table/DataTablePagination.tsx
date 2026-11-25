// Pagination footer and floating bulk-action bar for DataTable.

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[13px] text-slate-500">
        {totalRows === 0 ? 'No rows' : `Showing ${firstRow}–${lastRow} of ${totalRows} rows`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {showPageSizeSelect && (
          <label className="flex items-center gap-2 text-[13px] text-slate-500">
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Rows per page"
              className={cn(
                'h-8 rounded-md border border-slate-200 bg-white px-2 text-[13px] font-medium text-[var(--ink-primary)]',
                'outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand-ring)]',
              )}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <span className="text-[13px] font-semibold text-slate-700">
          Page {pageIndex + 1} of {totalPages}
        </span>

        {showPageJump ? (
          <PageJumpInput pageIndex={pageIndex} totalPages={totalPages} onJump={onPageIndexChange} />
        ) : null}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-slate-600',
              'transition-colors hover:bg-slate-100 hover:text-slate-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
              'disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canNextPage}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-slate-600',
              'transition-colors hover:bg-slate-100 hover:text-slate-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
              'disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            Next
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

interface DataTableBulkBarProps<TData> {
  selectedRows: TData[];
  bulkActions?: (selectedRows: TData[]) => ReactNode;
  onClearSelection: () => void;
}

export function DataTableBulkBar<TData>({
  selectedRows,
  bulkActions,
  onClearSelection,
}: DataTableBulkBarProps<TData>) {
  const selectedCount = selectedRows.length;
  if (selectedCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'flex flex-wrap items-center justify-between gap-2.5 border-b border-orange-200/80 bg-orange-50/70 px-4 py-2.5',
        'animate-in fade-in duration-150',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-[var(--brand)] px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
          {selectedCount} row{selectedCount === 1 ? '' : 's'} selected
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Clear selection"
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600',
            'transition-colors hover:bg-orange-100/80 hover:text-slate-900',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
          )}
        >
          <X className="size-3.5" aria-hidden />
          Clear
        </button>
      </div>
      {bulkActions ? (
        <div className="flex flex-wrap items-center gap-2">{bulkActions(selectedRows)}</div>
      ) : null}
    </div>
  );
}
