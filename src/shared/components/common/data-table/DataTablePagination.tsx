// Pagination footer and floating bulk-action bar for DataTable.

import type { ReactNode } from 'react';
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, X } from '@phosphor-icons/react';
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
    <div className="flex shrink-0 flex-col gap-2.5 border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-gray-500">
        {totalRows === 0 ? 'No rows' : `Showing ${firstRow}–${lastRow} of ${totalRows} rows`}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {showPageSizeSelect && (
          <label className="flex items-center gap-2 text-[13px] text-gray-500">
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Rows per page"
              className={cn(
                'h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-800',
                'outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/30',
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

        <span className="text-xs font-semibold text-gray-600 tabular-nums">
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
              'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-gray-600',
              'transition-colors hover:bg-gray-100 hover:text-gray-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/30',
              'disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!canNextPage}
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-gray-600',
              'transition-colors hover:bg-gray-100 hover:text-gray-900',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/30',
              'disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

interface DataTableBulkBarProps<TData> {
  selectedRows: TData[];
  totalRows?: number;
  loadingAll?: boolean;
  allRowsSelected?: boolean;
  onSelectAll?: () => void;
  bulkActions?: (selectedRows: TData[]) => ReactNode;
  onClearSelection: () => void;
}

export function DataTableBulkBar<TData>({
  selectedRows,
  totalRows,
  loadingAll = false,
  allRowsSelected = false,
  onSelectAll,
  bulkActions,
  onClearSelection,
}: DataTableBulkBarProps<TData>) {
  const selectedCount = selectedRows.length;
  if (selectedCount === 0) return null;
  const canSelectAll = !allRowsSelected && !!onSelectAll && !!totalRows && totalRows > selectedCount;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'flex flex-wrap items-center justify-between gap-2.5 border-b border-orange-200/80 bg-orange-50/70 px-4 py-2.5',
        'animate-in fade-in duration-150',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-[var(--brand)] px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
          {selectedCount} row{selectedCount === 1 ? '' : 's'} selected
        </span>
        {canSelectAll && (
          <button
            type="button"
            disabled={loadingAll}
            onClick={onSelectAll}
            className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-orange-100/70 disabled:opacity-50"
          >
            {loadingAll ? 'Selecting…' : `Select all ${totalRows}`}
          </button>
        )}
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
