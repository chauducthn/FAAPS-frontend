/**
 * DataTable — shared, reusable data table for the management pages
 * (Courses, UserAccounts, Appointments, ...).
 *
 * Built on TanStack Table v9 (`@tanstack/react-table`). The table owns its
 * markup, styling and interactions; the consumer owns the columns and data.
 */

import { useEffect, useState } from 'react';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import type { RowData } from '@tanstack/react-table';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/shared/lib/apiError';
import { cn } from '@/shared/lib/utils';
import { TableShell } from './table/TablePrimitives';
import { DataTableBody } from './data-table/DataTableBody';
import { DataTableHeader } from './data-table/DataTableHeader';
import { DataTableBulkBar } from './data-table/DataTableBulkBar';
import { DataTablePagination } from './data-table/DataTablePagination';
import type { DataTableProps } from './data-table/DataTableTypes';
import { useDataTable } from './data-table/useDataTable';

export {
  dataTableFeatures,
  type DataTableColumnDef,
  type DataTableColumnMeta,
} from './data-table/features';
export type { DataTableProps } from './data-table/DataTableTypes';

export function DataTable<TData extends RowData, TValue = unknown>(
  props: DataTableProps<TData, TValue>,
) {
  const {
    showSearch = true,
    filters,
    bulkActions,
    hideBulkBar = false,
    isLoading = false,
    pageSizes = [10, 25, 50, 100],
    showPageSizeSelect = true,
    showPageJump = false,
    isRowSelectable,
    rowSelectDisabledReason,
    searchPlaceholder = 'Search...',
    emptyText = 'No data found.',
    className,
    manual = false,
    totalRowCount,
    pageCount,
    onFetchAllRows,
  } = props;

  const { table, internalSearch, setInternalSearch, isSearching, alignments } = useDataTable(props);
  const [allRowsOverride, setAllRowsOverride] = useState<TData[] | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const { pageIndex, pageSize } = table.state.pagination;
  const totalRows = manual ? (totalRowCount ?? rows.length) : table.getRowCount();
  const totalPages = Math.max(
    manual ? (pageCount ?? Math.ceil(totalRows / Math.max(pageSize, 1))) : table.getPageCount(),
    1,
  );
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  useEffect(() => {
    if (selectedRows.length === 0) setAllRowsOverride(null);
  }, [selectedRows.length]);

  useEffect(() => {
    setAllRowsOverride(null);
  }, [totalRowCount]);

  const effectiveSelected = allRowsOverride ?? selectedRows;
  const handleSelectAll = !manual
    ? () => table.toggleAllRowsSelected(true)
    : onFetchAllRows
      ? async () => {
          setLoadingAll(true);
          try {
            const all = await onFetchAllRows();
            if (all.length > 0) setAllRowsOverride(all);
          } catch (err) {
            toast.error(apiErrorMessage(err));
          } finally {
            setLoadingAll(false);
          }
        }
      : undefined;

  return (
    <div className={cn('flex w-full flex-col', className)}>
      <div className={cn('flex flex-wrap items-center gap-3', showSearch ? 'pb-4' : 'hidden')}>
        {showSearch ? (
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden
            />
            <input
              type="search"
              value={internalSearch}
              onChange={(event) => setInternalSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className={cn(
                'h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink-primary',
                'outline-none transition-colors placeholder:text-ink-subtle',
                'focus:border-brand focus:ring-1 focus:ring-brand/40',
              )}
            />
          </div>
        ) : null}
        {filters ? <div className="flex flex-wrap items-center gap-3">{filters}</div> : null}
      </div>

      {!hideBulkBar ? (
        <DataTableBulkBar
          selectedRows={effectiveSelected}
          totalRows={totalRows}
          loadingAll={loadingAll}
          allRowsSelected={allRowsOverride !== null}
          onSelectAll={handleSelectAll}
          bulkActions={bulkActions}
          onClearSelection={() => {
            setAllRowsOverride(null);
            table.resetRowSelection();
          }}
        />
      ) : null}

      <TableShell stickyHeader className="min-h-0 flex-1 overflow-auto">
        <DataTableHeader
          headerGroups={table.getHeaderGroups()}
          alignments={alignments}
          allSelected={table.getIsAllRowsSelected()}
          someSelected={table.getIsSomeRowsSelected()}
          onToggleAllRows={table.getToggleAllRowsSelectedHandler()}
        />
        <DataTableBody
          rows={rows}
          columnCount={columnCount}
          pageSize={pageSize}
          isLoading={isLoading}
          isSearching={isSearching}
          emptyText={emptyText}
          alignments={alignments}
          isRowSelectable={isRowSelectable}
          rowSelectDisabledReason={rowSelectDisabledReason}
        />
      </TableShell>

      <DataTablePagination
        totalRows={totalRows}
        firstRow={firstRow}
        lastRow={lastRow}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPages={totalPages}
        pageSizes={pageSizes}
        showPageSizeSelect={showPageSizeSelect}
        showPageJump={showPageJump}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPageSizeChange={(size) => table.setPageSize(size)}
        onPageIndexChange={(index) => table.setPageIndex(index)}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
      />
    </div>
  );
}

export default DataTable;
