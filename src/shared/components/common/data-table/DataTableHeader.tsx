// Table header rendering with select-all checkbox and clickable sort headers.

import { CaretDown, CaretUp, CaretUpDown } from '@phosphor-icons/react';
import { flexRender, type HeaderGroup, type RowData } from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { TableHead } from '../table/TablePrimitives';
import { Checkbox } from './DataTableControls';
import { SELECT_COLUMN_ID, type Alignment, type dataTableFeatures } from './features';

interface DataTableHeaderProps<TData extends RowData> {
  headerGroups: HeaderGroup<typeof dataTableFeatures, TData>[];
  alignments: Record<string, Alignment>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAllRows: (event: never) => void;
}

export function DataTableHeader<TData extends RowData>({
  headerGroups,
  alignments,
  allSelected,
  someSelected,
  onToggleAllRows,
}: DataTableHeaderProps<TData>) {
  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            if (header.column.id === SELECT_COLUMN_ID) {
              return (
                <TableHead key={header.id} className="w-12">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={onToggleAllRows}
                    label="Select all"
                  />
                </TableHead>
              );
            }

            const align = alignments[header.column.id] ?? 'left';
            const label = header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext());
            const canSort = !header.isPlaceholder && header.column.getCanSort();
            const sorted = header.column.getIsSorted();

            return (
              <TableHead key={header.id} align={align}>
                {canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      'group inline-flex items-center gap-1 font-inherit uppercase tracking-inherit transition-colors hover:text-gray-900',
                      sorted ? 'text-[#C2410C]' : 'text-inherit',
                      align === 'right' && 'ml-auto flex-row-reverse',
                      align === 'center' && 'mx-auto',
                    )}
                  >
                    <span>{label}</span>
                    {sorted === 'asc' ? (
                      <CaretUp weight="fill" className="size-3 shrink-0 text-[#F26F21]" aria-hidden />
                    ) : sorted === 'desc' ? (
                      <CaretDown weight="fill" className="size-3 shrink-0 text-[#F26F21]" aria-hidden />
                    ) : (
                      <CaretUpDown className="size-3 shrink-0 text-gray-400 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden />
                    )}
                  </button>
                ) : (
                  label
                )}
              </TableHead>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
