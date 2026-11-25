/**
 * DataTable — shared, reusable data table for the management pages
 * (Courses, UserAccounts, Appointments, ...).
 *
 * Built on TanStack Table v9 (`@tanstack/react-table`). The table owns its
 * markup, styling and interactions; the consumer owns the columns and data.
 */

import { Search } from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { TableShell } from './table/TablePrimitives';
import { DataTableBody } from './data-table/DataTableBody';
import { DataTableHeader } from './data-table/DataTableHeader';
import { DataTableBulkBar, DataTablePagination } from './data-table/DataTablePagination';
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
  } = props;

  const { table, internalSearch, setInternalSearch, isSearching, alignments } = useDataTable(props);

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

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex flex-wrap items-center gap-3', showSearch ? 'pb-4' : 'hidden')}>
        {showSearch ? (
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
        ) : null}
        {filters ? <div className="flex flex-wrap items-center gap-3">{filters}</div> : null}
      </div>

      <TableShell>
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

      <DataTableBulkBar
        selectedRows={selectedRows}
        bulkActions={bulkActions}
        onClearSelection={() => table.resetRowSelection()}
      />
    </div>
  );
}

export default DataTable;
