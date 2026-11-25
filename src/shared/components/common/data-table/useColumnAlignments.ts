// Column alignment rules for DataTable.
//
// A column can declare its alignment through `meta.align`. When it does not,
// the table infers it from the data: numeric columns read better right
// aligned, everything else stays left aligned.

import { useMemo } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { Alignment, DataTableColumnDef } from './features';

export function useColumnAlignments<TData extends RowData, TValue>(
  table: {
    getCoreRowModel: () => { rows: Array<{ getValue: (id: string) => unknown }> };
    getAllLeafColumns: () => Array<{ id: string; columnDef: { meta?: { align?: Alignment } } }>;
  },
  stableData: readonly TData[],
  stableColumns: readonly DataTableColumnDef<TData, TValue>[],
): Record<string, Alignment> {
  return useMemo(() => {
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
}
