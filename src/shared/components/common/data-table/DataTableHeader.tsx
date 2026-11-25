// Table header rendering with select-all checkbox and sortable column headers.

import { flexRender, type HeaderGroup, type RowData } from '@tanstack/react-table';
import { cn } from '@/shared/lib/utils';
import { Checkbox, SortIcon } from './DataTableControls';
import { ALIGN_CLASS, SELECT_COLUMN_ID, type Alignment, type dataTableFeatures } from './features';

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
        <tr key={headerGroup.id} className="bg-slate-50">
          {headerGroup.headers.map((header) => {
            if (header.column.id === SELECT_COLUMN_ID) {
              return (
                <th key={header.id} scope="col" className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={onToggleAllRows}
                    label="Select all"
                  />
                </th>
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
              <th
                key={header.id}
                scope="col"
                aria-sort={canSort ? ariaSort : undefined}
                className={cn(
                  'px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600',
                  ALIGN_CLASS[align],
                )}
              >
                {canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded transition-colors hover:text-slate-900',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40',
                      align === 'right' && 'flex-row-reverse',
                    )}
                  >
                    <span>{label}</span>
                    <SortIcon sorted={sorted} />
                  </button>
                ) : (
                  label
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
