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
    <div className="flex flex-col gap-3 border-t border-slate-200 px-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-5">
      <div
        role="region"
        aria-label="Bulk actions"
        className={cn(
          'pointer-events-auto flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-3',
          'shadow-[0_12px_32px_rgba(20,32,51,0.14)]',
          'animate-in slide-in-from-bottom-4 fade-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        )}
      >
        <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-xs font-bold text-white">
          {selectedCount} row{selectedCount === 1 ? '' : 's'} selected
        </span>
        {bulkActions ? (
          <div className="flex flex-wrap items-center gap-2">{bulkActions(selectedRows)}</div>
        ) : null}
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Clear selection"
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-md text-slate-400',
            'transition-colors hover:bg-slate-100 hover:text-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
          )}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
