// Helpers for the optional controlled row selection of DataTable.
//
// A parent can own the selection (a bulk-action banner, a filter reset, ...)
// by passing `selectedRowIds` and `onSelectedRowIdsChange`. These helpers
// translate between the id list and the TanStack row-selection record.

import type { RowSelectionState } from '@tanstack/react-table';

/** Builds the TanStack row-selection record from a list of row ids. */
export function toRowSelectionState(ids: readonly string[]): RowSelectionState {
  return Object.fromEntries(ids.map((id) => [id, true]));
}

/** Extracts the selected row ids from a TanStack row-selection record. */
export function toSelectedRowIds(selection: RowSelectionState): string[] {
  return Object.keys(selection).filter((id) => selection[id]);
}
