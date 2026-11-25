// Table header rendering with select-all checkbox and sortable column headers.

import { flexRender, type HeaderGroup, type RowData } from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { TableHead } from '../table/TablePrimitives';
import { Checkbox, SortIcon } from './DataTableControls';
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
            const canSort = header.column.getCanSort();
            const sorted = header.column.getIsSorted();
            const ariaSort =
              sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';
            const label = header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext());

           return (
              <TableHead
                key={header.id}
                align={align}
                aria-sort={canSort ? ariaSort : undefined}
              >
                {canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded uppercase tracking-wider transition-colors hover:text-[var(--ink-primary)]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]',
                      align === 'right' && 'flex-row-reverse',
                    )}
                  >
                    <span>{label}</span>
                    <SortIcon sorted={sorted} />
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
