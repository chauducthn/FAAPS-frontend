/**
 * DataTable — shared, reusable data table for the management pages
 * (Courses, UserAccounts, Appointments, ...).
 *
 * Built on TanStack Table v9 (`@tanstack/react-table`). The table owns its
 * markup, styling and interactions; the consumer owns the columns and data.
 *
 * Features: debounced search on a single column, click-to-sort headers,
 * client-side pagination, row selection and a floating bulk-action bar.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Inbox,
  Search,
  SearchX,
  X,
} from 'lucide-react';
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
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowData,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { useDebounce } from '@/shared/hooks/useDebounce';

/* -------------------------------------------------------------------------- */
/*                                   Features                                  */
/* -------------------------------------------------------------------------- */

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
  // Registered explicitly so `filterFn: 'auto'` can resolve a function for
  // every value shape a searchable column may hold.
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
export type DataTableColumnDef<TData extends RowData, TValue = any> = ColumnDef<
  typeof dataTableFeatures,
  TData,
  TValue
>;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const SELECT_COLUMN_ID = '__select';

/** Selection column injected as the first column of every table. */
const selectionColumn = {
  id: SELECT_COLUMN_ID,
  enableSorting: false,
} satisfies DataTableColumnDef<any>;

type Alignment = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<Alignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Mirrors TanStack's column id resolution so a `searchKey` can be written as
 * the accessor key ("name") even when the column carries an explicit id.
 */
function resolveColumnId(columns: readonly ColumnDef<any, any, any>[], key: string): string {
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
function useShallowStable<T>(value: readonly T[]): readonly T[] {
  const ref = useRef(value);

  if (ref.current !== value) {
    const previous = ref.current;
    const sameLength = previous.length === value.length;
    const sameItems = sameLength && previous.every((item, index) => item === value[index]);
    if (!sameItems) ref.current = value;
  }

  return ref.current;
}

/* -------------------------------------------------------------------------- */
/*                                 Sub-components                              */
/* -------------------------------------------------------------------------- */

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: never) => void;
  label: string;
  className?: string;
}

function Checkbox({ checked, indeterminate = false, onChange, label, className }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className={cn(
        'size-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#F26F21]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
        className,
      )}
    />
  );
}

interface SortIconProps {
  sorted: false | 'asc' | 'desc';
}

function SortIcon({ sorted }: SortIconProps) {
  if (sorted === 'asc') return <ArrowUp className="size-3.5 text-[#F26F21]" aria-hidden />;
  if (sorted === 'desc') return <ArrowDown className="size-3.5 text-[#F26F21]" aria-hidden />;
  return <ChevronsUpDown className="size-3.5 text-slate-400" aria-hidden />;
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export interface DataTableProps<TData extends RowData, TValue = any> {
  /** Column definitions rendered in the table body. */
  columns: DataTableColumnDef<TData, TValue>[];
  /** Rows to display. */
  data: TData[];
  /**
   * Column used by the search box. Accepts the accessor key ("name", "email")
   * or the column id.
   */
  searchKey: string;
  /** Slot for filter controls rendered by the parent component. */
  filters?: ReactNode;
  /** Buttons rendered inside the floating bulk-action bar. */
  bulkActions?: (selectedRows: TData[]) => ReactNode;
  /**
   * Column filters owned by the parent (e.g. the dropdowns rendered in
   * `filters`). Merged with the internal search filter.
   */
  columnFilters?: ColumnFiltersState;
  /** Called whenever the parent-owned column filters change. */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  /** Replaces the table body with skeleton rows. */
  isLoading?: boolean;
  /** Available page sizes. */
  pageSizes?: number[];
  /** Stable row id. Defaults to the row index. */
  getRowId?: (row: TData, index: number) => string;
  /** Placeholder of the search input. */
  searchPlaceholder?: string;
  /** Empty-state headline. */
  emptyText?: string;
  /** Extra classes for the wrapper. */
  className?: string;

  /**
   * Server-side mode. The table stops filtering, sorting and paginating the
   * rows it receives; the parent owns the query and feeds back the current
   * page. Use it when the rows come from a paged API.
   */
  manual?: boolean;
  /**
   * The current search text, when the parent wants to own it (for example to
   * clear the box with a "reset filters" button). The table still keeps the
   * text it is typing, so a controlled value only has to be updated when the
   * parent changes it.
   */
  searchValue?: string;
  /**
   * Receives the debounced search text (300 ms). In server-side mode this is
   * the query term the parent should send to the API.
   */
  onSearchChange?: (value: string) => void;
  /** Total number of rows across every page. Required in server-side mode. */
  totalRowCount?: number;
  /** Controlled pagination state. */
  pagination?: PaginationState;
  /** Receives the next pagination state. */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Controlled sorting state. */
  sorting?: SortingState;
  /** Receives the next sorting state. */
  onSortingChange?: (sorting: SortingState) => void;
}

export function DataTable<TData extends RowData, TValue = any>({
  columns,
  data,
  searchKey,
  filters,
  bulkActions,
  columnFilters,
  onColumnFiltersChange,
  isLoading = false,
  pageSizes = [10, 25, 50, 100],
  getRowId,
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không tìm thấy dữ liệu',
  className,
  manual = false,
  searchValue,
  onSearchChange,
  totalRowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');
  // The table keeps the text the user is typing. A controlled `searchValue`
  // is the source of truth whenever the parent changes it (for example a
  // "reset filters" button clearing the box).
  useEffect(() => {
    if (searchValue === undefined) return;
    setInternalSearch((current) => (current === searchValue ? current : searchValue));
  }, [searchValue]);
  const debouncedSearch = useDebounce(internalSearch, 300);

  // Keep the model inputs referentially stable so row models are not rebuilt
  // on every render of the parent component.
  const stableData = useShallowStable(data);
  const stableColumns = useShallowStable(columns);

  const searchColumnId = useMemo(
    () => resolveColumnId(stableColumns as ColumnDef<any, any, any>[], searchKey),
    [stableColumns, searchKey],
  );

  const tableColumns = useMemo(() => {
    const result = [selectionColumn, ...stableColumns] as DataTableColumnDef<TData, any>[];
    // The search box always performs a substring match, even when the searched
    // column holds numbers or booleans.
    return result.map((column) =>
      'id' in column && column.id === searchColumnId
        ? { ...column, filterFn: 'includesString' as const }
        : column,
    );
  }, [stableColumns, searchColumnId]);

  // The table instance is not available while its options are being built, so
  // the latest state is mirrored here for the controlled updaters below.
  const stateRef = useRef({
    pagination: pagination ?? { pageIndex: 0, pageSize: pageSizes[0] },
    sorting: sorting ?? [],
  });

  const table = useTable({
    features: dataTableFeatures,
    columns: tableColumns,
    data: stableData as TData[],
    // Sorting cycle: asc -> desc -> none, one column at a time.
    sortDescFirst: false,
    enableMultiSort: false,
    enableSortingRemoval: true,
    enableRowSelection: true,
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    // In server-side mode the parent owns filtering, sorting and pagination.
    manualFiltering: manual,
    manualSorting: manual,
    manualPagination: manual,
    ...(manual && totalRowCount !== undefined ? { rowCount: totalRowCount } : {}),
    // The parent must receive the next state; the default updater only writes
    // to the table's internal atom, which a controlled slice ignores.
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

  stateRef.current = {
    pagination: table.state.pagination,
    sorting: table.state.sorting,
  };

  // In server-side mode the rows change with every query; a row that is no
  // longer loaded must not stay selected.
  const previousDataRef = useRef(stableData);
  useEffect(() => {
    if (!manual) return;
    if (previousDataRef.current === stableData) return;
    previousDataRef.current = stableData;
    tableRef.current.resetRowSelection();
  }, [manual, stableData]);

  // Filters are owned by the table itself: the parent-provided dropdowns and
  // the debounced search are merged into a single filter list.
  const externalFilters = columnFilters ?? [];
  const externalSignature = externalFilters
    .map((filter) => `${filter.id}:${String(filter.value)}`)
    .join('|');
  const searchSignature = `${searchColumnId}:${debouncedSearch.trim()}`;
  const previousSignature = useRef(`${externalSignature}||${searchSignature}`);

  useEffect(() => {
    const signature = `${externalSignature}||${searchSignature}`;
    if (previousSignature.current === signature) return;
    previousSignature.current = signature;

    const value = debouncedSearch.trim();

    // The parent always learns the current search term, in both modes.
    onSearchChange?.(value);

    // Server-side mode: the parent owns the query, so the table never filters
    // the rows it was given.
    if (manual) return;

    const next: ColumnFiltersState = value
      ? [
          ...externalFilters.filter((filter) => filter.id !== searchColumnId),
          { id: searchColumnId, value },
        ]
      : [...externalFilters];

    tableRef.current.setColumnFilters(next);
    // A filtered-out row can no longer be acted on, so the selection is dropped.
    tableRef.current.resetRowSelection();
    onColumnFiltersChange?.(next);
    // `externalFilters` is derived from `externalSignature`; the callback
    // identity changes on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSignature, searchSignature, manual]);

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const selectedCount = selectedRows.length;
  const isSearching = debouncedSearch.trim().length > 0;

  const { pageIndex, pageSize } = table.state.pagination;
  const totalRows = manual ? (totalRowCount ?? rows.length) : table.getRowCount();
  const totalPages = Math.max(
    manual
      ? Math.ceil(totalRows / Math.max(pageSize, 1))
      : table.getPageCount(),
    1,
  );
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  // Column alignment: explicit meta wins, numeric columns are right-aligned.
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

  const allSelected = table.getIsAllRowsSelected();
  const someSelected = table.getIsSomeRowsSelected();

  return (
    <div className={cn('w-full', className)}>
      {/* Toolbar: search + parent-provided filters */}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={internalSearch}
            onChange={(event) => setInternalSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={cn(
              'h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-[#151c27]',
              'outline-none transition-colors placeholder:text-slate-400',
              'focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40',
            )}
          />
        </div>
        {filters ? <div className="flex flex-wrap items-center gap-3">{filters}</div> : null}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50">
                {headerGroup.headers.map((header) => {
                  if (header.column.id === SELECT_COLUMN_ID) {
                    return (
                      <th key={header.id} scope="col" className="w-12 px-4 py-3">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={table.getToggleAllRowsSelectedHandler()}
                          label="Chọn tất cả"
                        />
                      </th>
                    );
                  }

                  const align = alignments[header.column.id] ?? 'left';
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const ariaSort =
                    sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';
                  const label = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={canSort ? ariaSort : undefined}
                      className={cn(
                        'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600',
                        ALIGN_CLASS[align],
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded transition-colors hover:text-slate-900',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
                            align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          <span>{label}</span>
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="h-12 border-b border-slate-100">
                  {Array.from({ length: columnCount }).map((__, cellIndex) => (
                    <td key={`skeleton-${rowIndex}-${cellIndex}`} className="px-4 py-3">
                      <div
                        className="h-3.5 animate-pulse rounded bg-slate-100"
                        style={{ width: `${45 + ((rowIndex + cellIndex) % 3) * 18}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      {isSearching ? (
                        <SearchX className="size-5" aria-hidden />
                      ) : (
                        <Inbox className="size-5" aria-hidden />
                      )}
                    </span>
                    <p className="text-sm font-semibold text-[#151c27]">{emptyText}</p>
                    <p className="text-[13px] text-slate-500">
                      {isSearching
                        ? 'Thử từ khoá khác hoặc bỏ bộ lọc đang áp dụng.'
                        : 'Chưa có dữ liệu nào để hiển thị.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'h-12 border-b border-slate-100 transition-colors hover:bg-slate-50/70',
                      isSelected && 'bg-orange-50/40 hover:bg-orange-50/60',
                    )}
                  >
                    {row.getAllCells().map((cell) => {
                      if (cell.column.id === SELECT_COLUMN_ID) {
                        return (
                          <td key={cell.id} className="w-12 px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onChange={row.getToggleSelectedHandler()}
                              label={`Chọn dòng ${row.index + 1}`}
                            />
                          </td>
                        );
                      }

                      const align = alignments[cell.column.id] ?? 'left';
                      return (
                        <td
                          key={cell.id}
                          className={cn('px-4 py-3 text-[13px] text-slate-700', ALIGN_CLASS[align])}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-slate-200 px-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-slate-500">
          {totalRows === 0
            ? 'Không có dòng dữ liệu'
            : `Hiển thị ${firstRow}–${lastRow} / ${totalRows} dòng`}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-500">
            Số dòng
            <select
              value={pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              aria-label="Số dòng mỗi trang"
              className={cn(
                'h-8 rounded-md border border-slate-200 bg-white px-2 text-[13px] font-medium text-[#151c27]',
                'outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]/40',
              )}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <span className="text-[13px] font-semibold text-slate-700">
            Trang {pageIndex + 1} / {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-slate-600',
                'transition-colors hover:bg-slate-100 hover:text-slate-900',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
                'disabled:pointer-events-none disabled:opacity-40',
              )}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-slate-600',
                'transition-colors hover:bg-slate-100 hover:text-slate-900',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
                'disabled:pointer-events-none disabled:opacity-40',
              )}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Floating bulk-action bar — only mounted while rows are selected. */}
      {selectedCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-5">
          <div
            role="region"
            aria-label="Thao tác hàng loạt"
            className={cn(
              'pointer-events-auto flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-3',
              'shadow-[0_12px_32px_rgba(20,32,51,0.14)]',
              'animate-in slide-in-from-bottom-4 fade-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            )}
          >
            <span className="rounded-full bg-[#F26F21] px-2.5 py-1 text-xs font-bold text-white">
              {selectedCount} dòng đã chọn
            </span>
            {bulkActions ? (
              <div className="flex flex-wrap items-center gap-2">{bulkActions(selectedRows)}</div>
            ) : null}
            <button
              type="button"
              onClick={() => table.resetRowSelection()}
              aria-label="Bỏ chọn tất cả"
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md text-slate-400',
                'transition-colors hover:bg-slate-100 hover:text-slate-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
              )}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DataTable;
