// Rules table — Operate-mode, synced with the Courses/Curriculum ecosystem:
// shared DataTable (skeleton, empty state, selection, server pagination),
// FPT-orange focus, status badges for DRAFT / ACTIVE / INACTIVE.
//
// Columns: Rule Name | Policy Type | Condition/Grade | Status | Actions
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
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  INACTIVE: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  DRAFT: 'bg-orange-50 text-[#B45309] ring-1 ring-orange-200',
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

/** One-line human summary of a condition JSON, e.g. `min_gpa = 5 · scope: semester_gpa`. */
export function summarizeCondition(condition: Record<string, unknown>): string {
  const entries = Object.entries(condition).filter(
    ([key]) => key !== 'rule_name' && key !== 'grade',
  );
  if (entries.length === 0) return '—';
  const [firstKey, firstValue] = entries[0];
  const rest = entries.length > 1 ? ` +${entries.length - 1}` : '';
  const value = typeof firstValue === 'object' ? JSON.stringify(firstValue) : String(firstValue);
  return `${firstKey} = ${value}${rest}`;
}

/** Formats the numeric boundary of a rule for the Condition/Grade column. */
function formatGrade(grade: number | null): string | null {
  if (grade === null) return null;
  return Number.isInteger(grade) ? String(grade) : grade.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
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
        accessorKey: 'ruleName',
        header: 'Rule name',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onView(row.original)}
            title={`View ${row.original.ruleName}`}
            className="block max-w-[280px] truncate text-left text-[13px] font-bold text-[#151c27] transition-colors hover:text-[#F37021]"
          >
            {row.original.ruleName}
          </button>
        ),
      },
      {
        accessorKey: 'policyType',
        header: 'Policy type',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-[11px] font-bold text-gray-700">
            <ShieldCheck className="size-3.5 text-[#F37021]" aria-hidden />
            {row.original.policyType}
          </span>
        ),
      },
      {
        id: 'condition',
        accessorKey: 'condition',
        header: 'Condition / Grade',
        enableSorting: false,
        cell: ({ row }) => {
          const grade = formatGrade(row.original.grade);
          return (
            <div className="flex min-w-0 flex-col gap-1">
              <code
                title={JSON.stringify(row.original.condition, null, 2)}
                className="block max-w-[240px] truncate rounded-md bg-orange-50 px-2 py-1 font-mono text-[11px] font-medium text-[#9A3412] ring-1 ring-orange-100"
              >
                {summarizeCondition(row.original.condition)}
              </code>
              {grade && (
                <span className="inline-flex w-fit items-center rounded-md bg-[#F37021] px-2 py-0.5 text-[11px] font-bold tabular-nums text-white">
                  Grade {grade}
                </span>
              )}
            </div>
          );
        },
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
                label={`Actions for ${rule.ruleName}`}
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
          <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F37021]" />
        </div>
      )}
      <DataTable
        manual
        columns={columns}
        data={data}
        searchKey="ruleName"
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
