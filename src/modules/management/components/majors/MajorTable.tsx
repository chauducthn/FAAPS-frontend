import { GraduationCap } from '@phosphor-icons/react';
import { DataTable, type DataTableColumnDef } from '@/shared/components/common/DataTable';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { RowActionMenu, type RowAction } from '../RowActionMenu';
import { StatusBadge } from '../StatusBadge';

export interface MajorItem {
  id: string;
  code: string;
  name: string;
  totalCredits: number;
  durationYears: number;
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

function createMajorColumns(
  onEditMajor: (item: MajorItem) => void,
  onDeleteMajor: (item: MajorItem) => void,
): DataTableColumnDef<MajorItem>[] {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-ink-primary tabular-nums whitespace-nowrap">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Major name',
      cell: ({ row }) => (
        <span className="font-medium text-ink-secondary">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'totalCredits',
      header: 'Credits',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="font-semibold text-ink-primary tabular-nums whitespace-nowrap">
          {row.original.totalCredits}
        </span>
      ),
    },
    {
      accessorKey: 'durationYears',
      header: 'Duration',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const years = Number(row.original.durationYears);
        return (
          <span className="text-ink-secondary tabular-nums whitespace-nowrap">
            {years} {years === 1 ? 'year' : 'years'}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const actions: RowAction[] = [
          { label: 'Edit details', onSelect: () => onEditMajor(row.original) },
          { label: 'Delete', onSelect: () => onDeleteMajor(row.original), danger: true },
        ];
        return <RowActionMenu label={`Actions for ${row.original.code}`} actions={actions} />;
      },
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
      <EmptyState
        className="h-full justify-center"
        icon={<GraduationCap aria-hidden />}
        title="No majors found"
        description="Try a different search, or use Create major above to get started."
      />
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
      className="h-full"
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
      hideBulkBar
      selectedRowIds={selectedIds}
      onSelectedRowIdsChange={handleSelectionChange}
    />
  );
}
