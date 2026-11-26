// Static table for lists that do not need sorting, filtering or paging.
//
// Used by the tables embedded in modals (inline editing, import previews) and
// by the read-only tables (transcript, reset results). It reuses the shared
// table primitives so every table in FAAPS looks the same.

import type { ReactNode } from 'react';
import { Tray as Inbox } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import {
  TableBody,
  TableCell,
  TableEmpty,
  TableError,
  TableHead,
  TableRow,
  TableShell,
  TableSkeletonRows,
} from './TablePrimitives';

export interface StaticColumn<TData> {
  /** Stable key of the column. */
  key: string;
  /** Header label. */
  header: string;
  align?: 'left' | 'center' | 'right';
  /** Renders the cell content. */
  render: (row: TData, index: number) => ReactNode;
  /** Extra classes for the header cell. */
  headerClassName?: string;
  /** Extra classes for every cell of the column. */
  cellClassName?: string;
}

export interface StaticTableProps<TData> {
  columns: StaticColumn<TData>[];
  rows: TData[];
  /** Stable key of each row. */
  rowKey: (row: TData, index: number) => string;
  loading?: boolean;
  /** Replaces the body with an error message and a retry action. */
  error?: string;
  /** Called when the user asks to retry after an error. */
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Custom icon for the empty state. Defaults to an inbox glyph. */
  emptyIcon?: ReactNode;
  /** Renders a checkbox column in front of the data. */
  selection?: {
    selectedIds: Set<string>;
    allSelected: boolean;
    someSelected: boolean;
    onToggleAll: (checked: boolean) => void;
    onToggleOne: (id: string, checked: boolean) => void;
    label: (row: TData) => string;
  };
  minWidth?: string;
  stickyHeader?: boolean;
  className?: string;
}

export function StaticTable<TData>({
  columns,
  rows,
  rowKey,
  loading = false,
  error,
  onRetry,
  emptyTitle = 'No data to display',
  emptyDescription,
  emptyIcon,
  selection,
  minWidth,
  stickyHeader = false,
  className,
}: StaticTableProps<TData>) {
  const colSpan = columns.length + (selection ? 1 : 0);

  return (
    <TableShell stickyHeader={stickyHeader} minWidth={minWidth} className={className}>
      <thead>
        <tr>
          {selection ? (
            <TableHead className="w-12">
              <input
                type="checkbox"
                aria-label="Select all rows on this page"
                checked={selection.allSelected}
                ref={(node) => {
                  if (node) node.indeterminate = selection.someSelected && !selection.allSelected;
                }}
                onChange={(event) => selection.onToggleAll(event.target.checked)}
                className="size-4 accent-[var(--brand)]"
              />
            </TableHead>
          ) : null}
          {columns.map((column) => (
            <TableHead
              key={column.key}
              align={column.align}
              className={column.headerClassName}
            >
              {column.header}
            </TableHead>
          ))}
        </tr>
      </thead>
      <TableBody>
        {loading ? (
          <TableSkeletonRows colSpan={colSpan} />
        ) : error ? (
          <TableError colSpan={colSpan} message={error} onRetry={onRetry} />
        ) : rows.length === 0 ? (
          <TableEmpty
            colSpan={colSpan}
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon ?? <Inbox className="size-5" aria-hidden />}
          />
        ) : (
          rows.map((row, index) => (
            <TableRow key={rowKey(row, index)}>
              {selection ? (
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    aria-label={`Select ${selection.label(row)}`}
                    checked={selection.selectedIds.has(rowKey(row, index))}
                    onChange={(event) => selection.onToggleOne(rowKey(row, index), event.target.checked)}
                    className="size-4 accent-[var(--brand)]"
                  />
                </TableCell>
              ) : null}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align}
                  className={cn(column.cellClassName)}
                >
                  {column.render(row, index)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </TableShell>
  );
}
