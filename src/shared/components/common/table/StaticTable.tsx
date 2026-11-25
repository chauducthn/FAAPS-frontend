// Static table for lists that do not need sorting, filtering or paging.
//
// Used by the tables embedded in modals (inline editing, import previews) and
// by the read-only tables (transcript, reset results). It reuses the shared
// table primitives so every table in FAAPS looks the same.

import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
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
  minWidth,
  stickyHeader = false,
  className,
}: StaticTableProps<TData>) {
  const colSpan = columns.length;

  return (
    <TableShell stickyHeader={stickyHeader} minWidth={minWidth} className={className}>
      <thead>
        <tr>
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
            icon={<Inbox className="size-5" aria-hidden />}
          />
        ) : (
          rows.map((row, index) => (
            <TableRow key={rowKey(row, index)}>
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
