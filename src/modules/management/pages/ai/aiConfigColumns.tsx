import { KeyRound } from 'lucide-react';
import { RowActionMenu } from '../../components/RowActionMenu';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { AiConfig } from '../../../ai/types/ai-config';
import { cn } from '@/shared/lib/utils';

const providerLabel = (provider: string) =>
  provider === 'GEMINI' ? 'Google AI Studio' : provider === 'OPENROUTER' ? 'OpenRouter' : provider;

export function createAiConfigColumns(handlers: {
  onView: (cfg: AiConfig) => void;
  onEdit: (cfg: AiConfig) => void;
  onTest: (cfg: AiConfig) => void;
  onDelete: (cfg: AiConfig) => void;
}): DataTableColumnDef<AiConfig>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Configuration',
      enableSorting: false,
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
            {providerLabel(row.original.provider)} · {row.original.purpose}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'modelName',
      header: 'Model',
      enableSorting: false,
      cell: ({ row }) => (
        <code className="inline-block max-w-[210px] truncate font-mono text-[13px] font-semibold text-gray-900">
          {row.original.modelName}
        </code>
      ),
    },
    {
      id: 'apiKey',
      header: 'API Key',
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            row.original.hasApiKey ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          )}
        >
          <KeyRound className="size-3" />
          {row.original.hasApiKey ? (row.original.apiKeyMasked ?? 'Configured') : 'Missing'}
        </span>
      ),
    },
    {
      accessorKey: 'temperature',
      header: 'Temp',
      enableSorting: false,
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
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-[#C2410C]">
          {row.original.maxTokens.toLocaleString('en-US')}
        </span>
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
                { label: 'Test connection', onSelect: () => handlers.onTest(cfg) },
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
