// Reusable table supporting optional checkbox selection and client-side column sorting.

import { useMemo, useState, type ReactNode } from 'react';
import { CaretDown, CaretUp, CaretUpDown, Tray as Inbox } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import {
  TableBody, TableCell, TableEmpty, TableError, TableHead, TableRow, TableShell, TableSkeletonRows,
} from './TablePrimitives';

export type SortableValue = string | number | boolean | null | undefined;

export interface StaticColumn<TData> {
  /** Stable key of the column. */
  key: string;
  /** Header label. */
  header: string;
  align?: 'left' | 'center' | 'right';
  /** Renders the cell content. */
  render: (row: TData, index: number) => ReactNode;
  /** Enables click-to-sort on this column when provided. */
  sortValue?: (row: TData) => SortableValue;
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

function compareValues(a: SortableValue, b: SortableValue): number {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function StaticTable<TData>(props: StaticTableProps<TData>) {
  const { columns, rows, rowKey, loading = false, error, onRetry, emptyTitle = 'No data to display', emptyDescription, emptyIcon, selection, minWidth, stickyHeader = false, className } = props;
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const colSpan = columns.length + (selection ? 1 : 0);

  const toggleSort = (key: string) => {
    setSort((cur) => {
      if (!cur || cur.key !== key) return { key, dir: 'asc' };
      if (cur.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const displayRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => compareValues(col.sortValue!(a), col.sortValue!(b)) * factor);
  }, [rows, columns, sort]);

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
          {columns.map((column) => {
            const activeDir = sort?.key === column.key ? sort.dir : null;
            return (
              <TableHead
                key={column.key}
                align={column.align}
                className={column.headerClassName}
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className={cn(
                      'group inline-flex items-center gap-1 uppercase tracking-inherit transition-colors hover:text-ink-primary',
                      activeDir ? 'text-brand-ink' : 'text-inherit',
                      column.align === 'right' && 'ml-auto flex-row-reverse',
                      column.align === 'center' && 'mx-auto',
                    )}
                  >
                    <span>{column.header}</span>
                    {activeDir === 'asc' ? (
                      <CaretUp weight="fill" className="size-3 shrink-0 text-brand" aria-hidden />
                    ) : activeDir === 'desc' ? (
                      <CaretDown weight="fill" className="size-3 shrink-0 text-brand" aria-hidden />
                    ) : (
                      <CaretUpDown className="size-3 shrink-0 text-ink-subtle opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            );
          })}
        </tr>
      </thead>
      <TableBody>
        {loading ? (
          <TableSkeletonRows colSpan={colSpan} />
        ) : error ? (
          <TableError colSpan={colSpan} message={error} onRetry={onRetry} />
        ) : displayRows.length === 0 ? (
          <TableEmpty
            colSpan={colSpan}
            title={emptyTitle}
            description={emptyDescription}
            icon={emptyIcon ?? <Inbox className="size-5" aria-hidden />}
          />
        ) : (
          displayRows.map((row, index) => (
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
