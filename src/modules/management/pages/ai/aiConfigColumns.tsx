import { Key as KeyRound } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { RowActionMenu } from '../../components/RowActionMenu';
import { StatusBadge } from '../../components/StatusBadge';
import type { DataTableColumnDef } from '../../../../shared/components/common/DataTable';
import type { AiConfig } from '../../../ai/types/ai-config';

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
      cell: ({ row }) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => handlers.onView(row.original)}
            title={`View ${row.original.name}`}
            className="block max-w-[260px] truncate text-left font-semibold text-ink-primary transition-colors hover:text-brand-ink hover:underline"
          >
            {row.original.name}
          </button>
          <p className="mt-0.5 truncate text-[11px] font-medium text-ink-subtle">
            {providerLabel(row.original.provider)} · {row.original.purpose}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'modelName',
      header: 'Model',
      cell: ({ row }) => (
        <code className="inline-block max-w-[210px] truncate font-mono text-[13px] font-semibold text-ink-secondary">
          {row.original.modelName}
        </code>
      ),
    },
    {
      id: 'apiKey',
      accessorFn: (cfg) => (cfg.hasApiKey ? 1 : 0),
      header: 'API Key',
      cell: ({ row }) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-medium leading-4',
            row.original.hasApiKey ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          )}
        >
          <KeyRound className="size-3 shrink-0" aria-hidden />
          <span className="font-mono">{row.original.hasApiKey ? (row.original.apiKeyMasked ?? 'Configured') : 'Missing'}</span>
        </span>
      ),
    },
    {
      accessorKey: 'temperature',
      header: 'Temp',
      meta: { align: 'center' },
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-ink-secondary">
          {row.original.temperature.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'maxTokens',
      header: 'Max tokens',
      meta: { align: 'right' },
      cell: ({ row }) => (
        <span className="font-mono text-[13px] font-semibold tabular-nums text-brand-ink">
          {row.original.maxTokens.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />,
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
