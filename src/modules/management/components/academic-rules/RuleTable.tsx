// Rules table — Operate-mode, synced with the Courses/Curriculum ecosystem:
// shared DataTable (skeleton, empty state, selection, server pagination),
// FPT-orange focus, status badges for DRAFT / ACTIVE / INACTIVE.
import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { DataTable, type DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import { RowActionMenu } from '../RowActionMenu';
import type { PaginationState } from '@tanstack/react-table';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import { cn } from '@/shared/lib/utils';

interface Props {
  data: AcademicRule[];
  isLoading?: boolean;
  isFetching?: boolean;
  totalRowCount: number;
  pagination: PaginationState;
  onPaginationChange: (p: PaginationState) => void;
  onView: (r: AcademicRule) => void;
  onEdit: (r: AcademicRule) => void;
  onPublish: (r: AcademicRule) => void;
  onArchive: (r: AcademicRule) => void;
  onReopen: (r: AcademicRule) => void;
  onDelete: (r: AcademicRule) => void;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-[#ecfdf5] text-[#047857] ring-1 ring-emerald-200',
  INACTIVE: 'bg-gray-100 text-[#555f6f] ring-1 ring-gray-200',
  DRAFT: 'bg-[#fff7ed] text-[#9a3412] ring-1 ring-orange-200',
};

export function RuleStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]',
        STATUS_STYLE[status] ?? STATUS_STYLE.INACTIVE,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

/** One-line human summary of a condition JSON, e.g. `min_gpa < 5.0 · scope: semester_gpa`. */
export function summarizeCondition(condition: Record<string, unknown>): string {
  const entries = Object.entries(condition);
  if (entries.length === 0) return '—';
  const [firstKey, firstValue] = entries[0];
  const rest = entries.length > 1 ? ` +${entries.length - 1}` : '';
  const value = typeof firstValue === 'object' ? JSON.stringify(firstValue) : String(firstValue);
  return `${firstKey} = ${value}${rest}`;
}

export default function RuleTable({
  data,
  isLoading,
  isFetching,
  totalRowCount,
  pagination,
  onPaginationChange,
  onView,
  onEdit,
  onPublish,
  onArchive,
  onReopen,
  onDelete,
}: Props) {
  const columns = useMemo<DataTableColumnDef<AcademicRule>[]>(
    () => [
      {
        accessorKey: 'policyType',
        header: 'Policy type',
        cell: ({ row }) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onView(row.original)}
              title={`View ${row.original.policyType}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[11px] font-bold text-white transition-colors hover:bg-[#C2410C]"
            >
              <ShieldCheck className="size-3.5 text-orange-300" aria-hidden />
              {row.original.policyType}
            </button>
            <p className="mt-1 max-w-[260px] truncate text-[11px] font-medium text-gray-400">
              {row.original.description ?? 'No description'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'curriculumName',
        header: 'Curriculum',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block max-w-[200px] truncate text-[13px] font-semibold text-gray-700">
            {row.original.curriculumName}
          </span>
        ),
      },
      {
        accessorKey: 'condition',
        header: 'Condition',
        enableSorting: false,
        cell: ({ row }) => (
          <code
            title={JSON.stringify(row.original.condition, null, 2)}
            className="block max-w-[220px] truncate rounded-md bg-orange-50/70 px-2 py-1 font-mono text-[11px] font-medium text-[#9a3412] ring-1 ring-orange-100"
          >
            {summarizeCondition(row.original.condition)}
          </code>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-bold tabular-nums text-gray-800">
            {row.original.priority}
          </span>
        ),
      },
      {
        accessorKey: 'approvalRequired',
        header: 'Approval',
        enableSorting: false,
        meta: { align: 'center' },
        cell: ({ row }) =>
          row.original.approvalRequired ? (
            <span className="inline-flex rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
              Required
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <RuleStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const rule = row.original;
          const isActive = rule.status === 'ACTIVE';
          return (
            <div className="flex justify-end">
              <RowActionMenu
                label={`Actions for ${rule.policyType}`}
                actions={[
                  { label: 'View detail', onSelect: () => onView(rule) },
                  { label: 'Edit rule', onSelect: () => onEdit(rule), disabled: isActive },
                  ...(rule.status !== 'ACTIVE'
                    ? [{ label: 'Publish → ACTIVE', onSelect: () => onPublish(rule) }]
                    : []),
                  ...(rule.status === 'ACTIVE'
                    ? [{ label: 'Archive → INACTIVE', onSelect: () => onArchive(rule) }]
                    : []),
                  ...(rule.status === 'INACTIVE'
                    ? [{ label: 'Reopen as DRAFT', onSelect: () => onReopen(rule) }]
                    : []),
                  { label: 'Delete rule', danger: true, disabled: isActive, onSelect: () => onDelete(rule) },
                ]}
              />
            </div>
          );
        },
      },
    ],
    [onView, onEdit, onPublish, onArchive, onReopen, onDelete],
  );

  return (
    <div className="relative">
      {isFetching && !isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-full bg-orange-100">
          <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
        </div>
      )}
      <DataTable
        manual
        columns={columns}
        data={data}
        searchKey="policyType"
        showSearch={false}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        totalRowCount={totalRowCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        emptyText="No academic rules match your filters."
      />
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
