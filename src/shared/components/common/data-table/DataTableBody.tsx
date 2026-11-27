// Table body rendering: loading skeletons, empty state, and selectable data rows.

import { flexRender, type Row, type RowData } from '@tanstack/react-table';
import { Tray as Inbox, MagnifyingGlassMinus as SearchX } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { TableBody, TableCell, TableEmpty, TableRow } from '../table/TablePrimitives';
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
      <TableBody>
        {Array.from({ length: Math.min(pageSize, 6) }).map((_, rowIndex) => (
          <TableRow key={`skeleton-${rowIndex}`}>
            {Array.from({ length: columnCount }).map((__, cellIndex) => (
              <TableCell key={`skeleton-${rowIndex}-${cellIndex}`}>
                <div
                  className="h-3.5 animate-pulse rounded-sm bg-line-soft"
                  style={{ width: `${45 + ((rowIndex + cellIndex) % 3) * 18}%` }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  if (rows.length === 0) {
    return (
      <TableBody>
        <TableEmpty
          colSpan={columnCount}
          title={emptyText}
          description={
            isSearching
              ? 'Try a different keyword or clear the active filters.'
              : 'There is no data to display yet.'
          }
          icon={
            isSearching ? (
              <SearchX className="size-5" aria-hidden />
            ) : (
              <Inbox className="size-5" aria-hidden />
            )
          }
        />
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => {
       const isSelected = row.getIsSelected();
        const selectable = isRowSelectable ? isRowSelectable(row.original) : true;
        return (
          <TableRow
            key={row.id}
            selected={isSelected}
            className={cn(isSelected && 'hover:!bg-brand-soft')}
          >
            {row.getAllCells().map((cell) => {
              if (cell.column.id === SELECT_COLUMN_ID) {
                return (
                  <TableCell key={cell.id} className="w-12">
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
                  </TableCell>
                );
              }

              const align = alignments[cell.column.id] ?? 'left';
              return (
                <TableCell key={cell.id} align={align}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
