// Shared TanStack Table feature tree, column metadata, and helper utilities.

import { useRef } from 'react';
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_arrIncludes,
  filterFn_equals,
  filterFn_includesString,
  filterFn_inNumberRange,
  filterFn_weakEquals,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';

/** Per-column metadata understood by the table. */
export interface DataTableColumnMeta {
  /**
   * Horizontal alignment of the column (header + cells).
   * Numeric columns are right-aligned automatically when omitted.
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * Feature tree shared by every instance. It must stay at module scope so the
 * table never rebuilds its row models because of a new options object.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    inNumberRange: filterFn_inNumberRange,
    equals: filterFn_equals,
    weakEquals: filterFn_weakEquals,
    arrIncludes: filterFn_arrIncludes,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
  columnMeta: {} as DataTableColumnMeta,
});

/** A column definition accepted by {@link DataTable}. */
export type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<
  typeof dataTableFeatures,
  TData,
  TValue
>;

export const SELECT_COLUMN_ID = '__select';

export type Alignment = 'left' | 'center' | 'right';

export const ALIGN_CLASS: Record<Alignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** Creates the selection column injected as the first column of every table. */
export function createSelectionColumn<TData extends RowData, TValue>(): DataTableColumnDef<
  TData,
  TValue
> {
  return {
    id: SELECT_COLUMN_ID,
    enableSorting: false,
  };
}

/**
 * Mirrors TanStack's column id resolution so a `searchKey` can be written as
 * the accessor key ("name") even when the column carries an explicit id.
 */
export function resolveColumnId<TData extends RowData, TValue>(
  columns: readonly DataTableColumnDef<TData, TValue>[],
  key: string,
): string {
  const match = columns.find((column) => {
    if ('id' in column && column.id === key) return true;
    if ('accessorKey' in column && column.accessorKey !== undefined) {
      const accessorKey = String(column.accessorKey);
      return accessorKey === key || accessorKey.replaceAll('.', '_') === key;
    }
    return false;
  });

  if (!match) return key;
  if ('id' in match && match.id) return match.id;
  if ('accessorKey' in match && match.accessorKey !== undefined) {
    return String(match.accessorKey).replaceAll('.', '_');
  }
  return key;
}

/** Keeps the previous array reference while its items are shallow-equal. */
export function useShallowStable<T>(value: readonly T[]): readonly T[] {
  const ref = useRef(value);

  if (ref.current !== value) {
    const previous = ref.current;
    const sameLength = previous.length === value.length;
    const sameItems = sameLength && previous.every((item, index) => item === value[index]);
    if (!sameItems) ref.current = value;
  }

  return ref.current;
}
