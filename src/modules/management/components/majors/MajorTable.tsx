import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type DataTableColumnDef } from '@/shared/components/common/DataTable';

export interface MajorItem {
  id: string;
  code: string;
  name: string;
  cohort: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

interface MajorTableProps {
  data: MajorItem[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
 onSelectRow: (id: string) => void;
  onEditMajor: (item: MajorItem) => void;
  onDeleteMajor: (item: MajorItem) => void;
  page: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
const statusPill = (status: MajorItem['status']) => {
  if (status === 'ACTIVE') return 'bg-emerald-50 text-emerald-700';
  if (status === 'DRAFT') return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-600';
};
function createMajorColumns(
  onEditMajor: (item: MajorItem) => void,
  onDeleteMajor: (item: MajorItem) => void,
): DataTableColumnDef<MajorItem>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-semibold text-[var(--ink-primary)] tabular-nums whitespace-nowrap">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Major name',
      cell: ({ row }) => (
        <span className="font-medium text-[var(--ink-secondary)]">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'cohort',
      header: 'Cohort',
      cell: ({ row }) => (
        <span className="text-[var(--ink-muted)] whitespace-nowrap">{row.original.cohort}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none ${statusPill(row.original.status)}`}
        >
          {row.original.status === 'ACTIVE'
            ? 'Active'
            : row.original.status === 'DRAFT'
              ? 'Draft'
              : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEditMajor(row.original)}
            title={`Edit ${row.original.code}`}
            aria-label={`Edit ${row.original.code}`}
            className="p-1.5 rounded-md text-gray-400 hover:text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]"
          >
            <Pencil className="size-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => onDeleteMajor(row.original)}
            title={`Delete ${row.original.code}`}
            aria-label={`Delete ${row.original.code}`}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
          >
            <Trash2 className="size-4" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];
}
export default function MajorTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEditMajor,
  onDeleteMajor,
  page,
  totalItems,
  totalPages,
  onPageChange,
}: MajorTableProps) {
  if (data.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
          M
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--ink-primary)]">No majors found</p>
        <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
          Try a different search, or create a new major to get started.
        </p>
      </div>
    );
  }

  const handleSelectionChange = (ids: string[]) => {
    // The parent owns the selection: report the whole page as selected or not,
    // and mirror every individual change back to it.
    const allSelected = ids.length === data.length;
    if (allSelected !== (selectedIds.length === data.length)) {
      onSelectAll(allSelected);
      return;
    }
    const added = ids.find((id) => !selectedIds.includes(id));
    const removed = selectedIds.find((id) => !ids.includes(id));
    if (added) onSelectRow(added);
    else if (removed) onSelectRow(removed);
  };

  return (
    <DataTable
      manual
      columns={createMajorColumns(onEditMajor, onDeleteMajor)}
      data={data}
      searchKey="name"
      showSearch={false}
      emptyText="No majors found."
      getRowId={(row) => row.id}
      totalRowCount={totalItems}
      pageCount={totalPages}
      pagination={{ pageIndex: page, pageSize: data.length }}
      onPaginationChange={(next) => {
        if (next.pageIndex !== page) onPageChange(next.pageIndex);
      }}
      showPageSizeSelect={false}
      selectedRowIds={selectedIds}
      onSelectedRowIdsChange={handleSelectionChange}
    />
  );
}
