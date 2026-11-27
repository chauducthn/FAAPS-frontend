// Floating bulk-action bar shown above a DataTable while rows are selected.

import type { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

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
        'flex flex-wrap items-center justify-between gap-2.5 border-b border-brand/25 bg-brand-soft/70 px-4 py-2.5',
        'animate-in fade-in duration-150',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-sm bg-brand px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
          {selectedCount} row{selectedCount === 1 ? '' : 's'} selected
        </span>
        {canSelectAll && (
          <button
            type="button"
            disabled={loadingAll}
            onClick={onSelectAll}
            className="rounded-md border border-brand/30 bg-white px-2 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft-strong/70 disabled:opacity-50"
          >
            {loadingAll ? 'Selecting…' : `Select all ${totalRows}`}
          </button>
        )}
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Clear selection"
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-muted',
            'transition-colors hover:bg-brand-soft-strong/80 hover:text-ink-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
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
