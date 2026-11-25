// Public props interface for the shared DataTable component.

import type { ReactNode } from 'react';
import type {
  ColumnFiltersState,
  PaginationState,
  RowData,
  SortingState,
} from '@tanstack/react-table';
import type { DataTableColumnDef } from './features';

export interface DataTableProps<TData extends RowData, TValue = unknown> {
  /** Column definitions rendered in the table body. */
  columns: DataTableColumnDef<TData, TValue>[];
  /** Rows to display. */
  data: TData[];
  /**
   * Column used by the search box. Accepts the accessor key ("name", "email")
   * or the column id.
   */
  searchKey: string;
  /**
   * Renders the built-in search box in the toolbar. Turn it off when the
   * page owns the search input in its own toolbar.
   */
  showSearch?: boolean;
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
  /**
   * Shows the "Rows per page" selector next to the pagination controls.
   * Turn it off when the page size is fixed by the server contract.
   */
  showPageSizeSelect?: boolean;
  /**
   * Shows a compact "go to page" field in the pagination bar. The admin types
   * a page number and presses Enter to jump there.
   */
  showPageJump?: boolean;
  /** Stable row id. Defaults to the row index. */
  getRowId?: (row: TData, index: number) => string;
  /**
   * Rows the admin cannot select. A disabled row shows a greyed-out
   * checkbox and a tooltip naming the reason.
   */
  isRowSelectable?: (row: TData) => boolean;
  /** Why a row cannot be selected. Shown as the tooltip of its checkbox. */
  rowSelectDisabledReason?: (row: TData) => string;
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
   * clear the box with a "reset filters" button).
   */
  searchValue?: string;
  /**
   * Receives the debounced search text (300 ms). In server-side mode this is
   * the query term the parent should send to the API.
   */
  onSearchChange?: (value: string) => void;
  /** Total number of rows across every page. Required in server-side mode. */
  totalRowCount?: number;
  /** Total number of pages, when the server knows it. */
  pageCount?: number;
  /** Controlled pagination state. */
  pagination?: PaginationState;
  /** Receives the next pagination state. */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Controlled sorting state. */
  sorting?: SortingState;
  /** Receives the next sorting state. */
  onSortingChange?: (sorting: SortingState) => void;
}
