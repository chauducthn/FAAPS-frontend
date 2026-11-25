// Table body rendering: loading skeletons, empty state, and selectable data rows.

import { flexRender, type Row, type RowData } from '@tanstack/react-table';
import { Inbox, SearchX } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Checkbox } from './DataTableControls';
import { ALIGN_CLASS, SELECT_COLUMN_ID, type Alignment, type dataTableFeatures } from './features';

interface DataTableBodyProps<TData extends RowData> {
  rows: Row<typeof dataTableFeatures, TData>[];
  columnCount: number;
  pageSize: number;
  isLoading: boolean;
  isSearching: boolean;
  emptyText: string;
  alignments: Record<string, Alignment>;
  isRowSelectable?: (row: TData) => boolean;
  rowSelectDisabledReason?: (row: TData) => string;
}

export function DataTableBody<TData extends RowData>({
  rows,
  columnCount,
  pageSize,
  isLoading,
  isSearching,
  emptyText,
  alignments,
  isRowSelectable,
  rowSelectDisabledReason,
}: DataTableBodyProps<TData>) {
  if (isLoading) {
    return (
      <tbody>
        {Array.from({ length: Math.min(pageSize, 6) }).map((_, rowIndex) => (
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
        ))}
      </tbody>
    );
  }

  if (rows.length === 0) {
    return (
      <tbody>
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
                  ? 'Try a different keyword or clear the active filters.'
                  : 'There is no data to display yet.'}
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row) => {
        const isSelected = row.getIsSelected();
        const selectable = isRowSelectable ? isRowSelectable(row.original) : true;
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
                      label={`Select row ${row.index + 1}`}
                      disabled={!selectable}
                      disabledReason={
                        !selectable && rowSelectDisabledReason
                          ? rowSelectDisabledReason(row.original)
                          : undefined
                      }
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
      })}
    </tbody>
  );
}
