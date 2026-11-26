// Table header rendering with select-all checkbox and plain column labels.

import { flexRender, type HeaderGroup, type RowData } from '@tanstack/react-table';
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

            return (
              <TableHead key={header.id} align={align}>
                {label}
              </TableHead>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
