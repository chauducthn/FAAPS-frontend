// Rules table — Operate-mode, synced with the Courses/Curriculum ecosystem:
// shared DataTable (skeleton, empty state, selection, server pagination),
// FPT-orange focus, status badges for DRAFT / ACTIVE / INACTIVE.
//
// Columns: Rule Name | Policy Type | Condition/Grade | Status | Actions
import { useMemo, type ReactNode } from 'react';
import { ShieldCheck } from '@phosphor-icons/react';
import { DataTable, type DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import { RowActionMenu } from '../RowActionMenu';
import { StatusBadge } from '../StatusBadge';
import type { PaginationState } from '@tanstack/react-table';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import { formatRuleCondition } from './formatRuleCondition';

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
  onFetchAllRows?: () => Promise<AcademicRule[]>;
  bulkActions?: (selectedRows: AcademicRule[]) => ReactNode;
}

export function RuleStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
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
  onFetchAllRows,
  bulkActions,
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
            className="block max-w-[280px] truncate text-left text-[13px] font-semibold text-ink-primary transition-colors hover:text-brand"
          >
            {row.original.ruleName}
          </button>
        ),
      },
      {
        accessorKey: 'policyType',
        header: 'Policy type',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-secondary">
            <ShieldCheck className="size-3.5 text-brand" aria-hidden />
            {row.original.policyType}
          </span>
        ),
      },
      {
        id: 'condition',
        accessorFn: (row) => (row.grade !== null ? String(row.grade).padStart(8, '0') : summarizeCondition(row.condition)),
        header: 'Trigger / Threshold',
        cell: ({ row }) => {
          const { primary, secondary, tooltip } = formatRuleCondition(row.original);
          return (
            <div title={tooltip} className="flex min-w-0 max-w-[260px] flex-col gap-0.5">
              <span className="truncate text-[13px] font-semibold tabular-nums text-brand-ink">
                {primary}
              </span>
              {secondary && (
                <span className="truncate text-xs text-ink-muted">
                  {secondary}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
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
    <div className="relative h-full">
      {isFetching && !isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-full bg-brand-soft-strong">
          <div className="h-full w-1/3 rounded-full bg-brand motion-safe:animate-[slide_1s_ease-in-out_infinite]" />
        </div>
      )}
      <DataTable
        className="h-full"
        manual
        columns={columns}
        data={data}
        searchKey="ruleName"
        showSearch={false}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        totalRowCount={totalRowCount}
        onFetchAllRows={onFetchAllRows}
        bulkActions={bulkActions}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        emptyText="No academic rules match your filters."
      />
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
