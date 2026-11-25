// Hook encapsulating TanStack Table setup, debounced search, filter sync, and alignments.

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useTable,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
  type RowData,
  type SortingState,
} from '@tanstack/react-table';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { DataTableProps } from './DataTableTypes';
import {
  createSelectionColumn,
  dataTableFeatures,
  resolveColumnId,
  useShallowStable,
  type Alignment,
  type DataTableColumnDef,
} from './features';

export function useDataTable<TData extends RowData, TValue>(
  props: DataTableProps<TData, TValue>,
) {
  const {
    columns,
    data,
    searchKey,
    columnFilters,
    onColumnFiltersChange,
    pageSizes = [10, 25, 50, 100],
    getRowId,
    isRowSelectable,
    manual = false,
    searchValue,
    onSearchChange,
    totalRowCount,
    pageCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
  } = props;

  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');
  useEffect(() => {
    if (searchValue === undefined) return;
    setInternalSearch((current) => (current === searchValue ? current : searchValue));
  }, [searchValue]);
  const debouncedSearch = useDebounce(internalSearch, 300);

  const stableData = useShallowStable(data);
  const stableColumns = useShallowStable(columns);

  const searchColumnId = useMemo(
    () => resolveColumnId(stableColumns, searchKey),
    [stableColumns, searchKey],
  );

  const tableColumns = useMemo(() => {
    const result: DataTableColumnDef<TData, TValue>[] = [
      createSelectionColumn<TData, TValue>(),
      ...stableColumns,
    ];
    return result.map((column) =>
      'id' in column && column.id === searchColumnId
        ? { ...column, filterFn: 'includesString' as const }
        : column,
    );
  }, [stableColumns, searchColumnId]);

  const stateRef = useRef({
    pagination: pagination ?? { pageIndex: 0, pageSize: pageSizes[0] },
    sorting: sorting ?? [],
  });

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns as readonly DataTableColumnDef<TData, unknown>[],
    data: stableData as TData[],
    sortDescFirst: false,
    enableMultiSort: false,
    enableSortingRemoval: true,
    enableRowSelection: true,
    ...(isRowSelectable
      ? { enableRowSelection: (row: Row<typeof dataTableFeatures, TData>) => isRowSelectable(row.original) }
      : {}),
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    manualFiltering: manual,
    manualSorting: manual,
    manualPagination: manual,
    ...(manual && totalRowCount !== undefined ? { rowCount: totalRowCount } : {}),
    ...(manual && pageCount !== undefined ? { pageCount } : {}),
    ...(manual && onPaginationChange
      ? {
          onPaginationChange: (updater: PaginationState | ((old: PaginationState) => PaginationState)) =>
            onPaginationChange(
              typeof updater === 'function' ? updater(stateRef.current.pagination) : updater,
            ),
        }
      : {}),
    ...(manual && onSortingChange
      ? {
          onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) =>
            onSortingChange(
              typeof updater === 'function' ? updater(stateRef.current.sorting) : updater,
            ),
        }
      : {}),
    ...(pagination ? { state: { pagination } } : {}),
    ...(sorting ? { state: { ...(pagination ? { pagination } : {}), sorting } } : {}),
  });

  const tableRef = useRef(table);
  tableRef.current = table;
  stateRef.current = { pagination: table.state.pagination, sorting: table.state.sorting };

  const previousDataRef = useRef(stableData);
  useEffect(() => {
    if (!manual || previousDataRef.current === stableData) return;
    previousDataRef.current = stableData;
    tableRef.current.resetRowSelection();
  }, [manual, stableData]);

  const externalFilters = columnFilters ?? [];
  const externalSignature = externalFilters.map((f) => `${f.id}:${String(f.value)}`).join('|');
  const searchSignature = `${searchColumnId}:${debouncedSearch.trim()}`;
  const previousSignature = useRef(`${externalSignature}||${searchSignature}`);

  useEffect(() => {
    const signature = `${externalSignature}||${searchSignature}`;
    if (previousSignature.current === signature) return;
    previousSignature.current = signature;

    const value = debouncedSearch.trim();
    onSearchChange?.(value);
    if (manual) return;

    const next: ColumnFiltersState = value
      ? [...externalFilters.filter((f) => f.id !== searchColumnId), { id: searchColumnId, value }]
      : [...externalFilters];

    tableRef.current.setColumnFilters(next);
    tableRef.current.resetRowSelection();
    onColumnFiltersChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSignature, searchSignature, manual]);

  const alignments = useMemo(() => {
    const result: Record<string, Alignment> = {};
    const sampleRows = table.getCoreRowModel().rows.slice(0, 20);
    for (const column of table.getAllLeafColumns()) {
      const declared = column.columnDef.meta?.align;
      if (declared) {
        result[column.id] = declared;
        continue;
      }
      let align: Alignment = 'left';
      for (const row of sampleRows) {
        const value = row.getValue(column.id);
        if (value === null || value === undefined) continue;
        align = typeof value === 'number' ? 'right' : 'left';
        break;
      }
      result[column.id] = align;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableData, stableColumns]);

  return {
    table,
    internalSearch,
    setInternalSearch,
    isSearching: debouncedSearch.trim().length > 0,
    alignments,
  };
}
