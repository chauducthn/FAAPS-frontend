import { RowActionMenu } from '../../components/RowActionMenu';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { AiConfig } from '../../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';

export function createAiConfigColumns(handlers: {
  onView: (cfg: AiConfig) => void;
  onEdit: (cfg: AiConfig) => void;
  onDelete: (cfg: AiConfig) => void;
}): DataTableColumnDef<AiConfig>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Configuration',
      cell: ({ row }) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => handlers.onView(row.original)}
            title={`View ${row.original.name}`}
            className="block max-w-[260px] truncate text-left font-semibold text-gray-900 transition-colors hover:text-[#C2410C] hover:underline"
          >
            {row.original.name}
          </button>
          <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">
            {row.original.provider} · {row.original.purpose} · {row.original.modelName}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'modelName',
      header: 'Model',
      enableSorting: false,
      cell: ({ row }) => (
        <code className="inline-block max-w-[180px] truncate font-mono text-[13px] font-semibold text-gray-900">
          {row.original.modelName}
        </code>
      ),
    },
    {
      accessorKey: 'temperature',
      header: 'Temp',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-gray-700">
          {row.original.temperature.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'maxTokens',
      header: 'Max tokens',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-[#C2410C]">
          {row.original.maxTokens.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      accessorKey: 'timeoutSeconds',
      header: 'Timeout',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="text-[13px] font-medium tabular-nums text-gray-600">{row.original.timeoutSeconds}s</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className={cn(
            'inline-flex items-center text-xs font-semibold uppercase tracking-[0.02em]',
            row.original.isActive ? 'text-emerald-700' : 'text-gray-500',
          )}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => {
        const cfg = row.original;
        return (
          <div className="flex justify-end">
            <RowActionMenu
              label={`Actions for ${cfg.name}`}
              actions={[
                { label: 'View detail', onSelect: () => handlers.onView(cfg) },
                { label: 'Edit configuration', onSelect: () => handlers.onEdit(cfg) },
                { label: 'Delete configuration', danger: true, onSelect: () => handlers.onDelete(cfg) },
              ]}
            />
          </div>
        );
      },
    },
  ];
}
