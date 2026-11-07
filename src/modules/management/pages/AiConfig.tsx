// AI Configuration — Operate-mode redesign synced with the Courses/Rules ecosystem:
// gradient Cam header, KPI strip, filters, shared DataTable (skeleton, empty,
// error states, server pagination), Create/Edit/View modal, presets, delete confirm.
import { useMemo, useState } from 'react';
import {
  Check,
  CircleAlert,
  Cpu,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { PaginationState } from '@tanstack/react-table';
import AiConfigForm from '../components/ai-config/AiConfigForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RowActionMenu } from '../components/RowActionMenu';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import { useAiConfigsQuery, useAiPresetsQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import { useAiConfigMutations } from '../../ai/hooks/mutations/useAiConfigMutations';
import type { AiConfig, AiPreset } from '../../ai/types/ai-config';
import type { CreateAiConfigFormValues } from '../../ai/validations/ai-config.schema';
import { cn } from '@/shared/lib/utils';

const PAGE_SIZE = 10;

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

type FormMode = 'create' | 'edit' | 'view';

export default function AiConfigPage() {
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('ALL');
  const [purpose, setPurpose] = useState('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selected, setSelected] = useState<AiConfig | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<AiPreset | null>(null);
  const [deleting, setDeleting] = useState<AiConfig | null>(null);

  const params = useMemo(
    () => ({
      search: search || undefined,
      provider: provider === 'ALL' ? undefined : (provider as 'GEMINI' | 'OTHER'),
      purpose: purpose === 'ALL' ? undefined : (purpose as 'CHAT' | 'EMBEDDING' | 'OCR'),
      isActive: status === 'ALL' ? undefined : status === 'ACTIVE',
      page: pagination.pageIndex,
      size: pagination.pageSize,
    }),
    [search, provider, purpose, status, pagination.pageIndex, pagination.pageSize],
  );

  const listQuery = useAiConfigsQuery(params);
  const presetsQuery = useAiPresetsQuery();
  const { create, isCreating, update, isUpdating, remove, isRemoving } = useAiConfigMutations();

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const totalItems = listQuery.data?.totalItems ?? 0;
  const allItems = items;

  const stats = useMemo(() => {
    const active = allItems.filter((c) => c.isActive).length;
    const chat = allItems.filter((c) => c.purpose === 'CHAT' && c.isActive).length;
    return { total: totalItems, active, chat };
  }, [allItems, totalItems]);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const hasFilters = search !== '' || provider !== 'ALL' || purpose !== 'ALL' || status !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setProvider('ALL');
    setPurpose('ALL');
    setStatus('ALL');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const openCreate = (preset?: AiPreset) => {
    setSelected(null);
    setSelectedPreset(preset ?? null);
    setFormMode('create');
    setFormOpen(true);
  };
  const openView = (cfg: AiConfig) => {
    setSelected(cfg);
    setSelectedPreset(null);
    setFormMode('view');
    setFormOpen(true);
  };
  const openEdit = (cfg: AiConfig) => {
    setSelected(cfg);
    setSelectedPreset(null);
    setFormMode('edit');
    setFormOpen(true);
  };

  const columns = useMemo<DataTableColumnDef<AiConfig>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Configuration',
        cell: ({ row }) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => openView(row.original)}
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
          <code className="inline-block max-w-[180px] truncate rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
            {row.original.modelName}
          </code>
        ),
      },
      {
        accessorKey: 'temperature',
        header: 'Temp',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 font-mono text-[12px] font-bold tabular-nums text-gray-800">
            {row.original.temperature.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'maxTokens',
        header: 'Max tokens',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-[12px] font-bold tabular-nums text-[#9a3412]">
            {row.original.maxTokens.toLocaleString('en-US')}
          </span>
        ),
      },
      {
        accessorKey: 'timeoutSeconds',
        header: 'Timeout',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-[12px] font-semibold tabular-nums text-gray-600">{row.original.timeoutSeconds}s</span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em]',
              row.original.isActive ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-gray-100 text-[#555f6f]',
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
                  { label: 'View detail', onSelect: () => openView(cfg) },
                  { label: 'Edit configuration', onSelect: () => openEdit(cfg) },
                  { label: 'Delete configuration', danger: true, onSelect: () => setDeleting(cfg) },
                ]}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
            <Cpu className="size-5.5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">AI Configuration</h1>
            <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">
              Manage models, prompts and usage limits for every AI feature in the system
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openCreate()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
        >
          <Plus className="size-4" strokeWidth={2.5} /> New configuration
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi icon={<Sparkles className="size-4" />} label="Total configurations" value={String(stats.total || '—')} hint={listQuery.isFetching ? 'Refreshing…' : `${items.length} on this page`} />
        <Kpi icon={<Check className="size-4" />} label="Active" value={String(stats.active)} hint="Serving live traffic" tone="green" />
        <Kpi icon={<Zap className="size-4" />} label="Active chat models" value={String(stats.chat)} hint="CHAT purpose" tone="orange" />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder="Search by name or model..."
              aria-label="Search AI configurations"
              role="searchbox"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => resetPage(setSearch)('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select value={provider} onChange={(e) => resetPage(setProvider)(e.target.value)} aria-label="Filter by provider" className={selectClass}>
              <option value="ALL">Provider: All</option>
              <option value="GEMINI">Gemini</option>
              <option value="OTHER">Other</option>
            </select>
            <select value={purpose} onChange={(e) => resetPage(setPurpose)(e.target.value)} aria-label="Filter by purpose" className={selectClass}>
              <option value="ALL">Purpose: All</option>
              <option value="CHAT">Chat</option>
              <option value="EMBEDDING">Embedding</option>
              <option value="OCR">OCR</option>
            </select>
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')} aria-label="Filter by status" className={selectClass}>
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">● Active</option>
              <option value="INACTIVE">○ Inactive</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                aria-label="Clear filters"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        {listQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load configurations</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The list failed to load. Check your connection or mock flag, then try again — your filters are kept.
              </p>
            </div>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
            >
              <RotateCcw className="size-3.5" /> Retry
            </button>
          </div>
        ) : !listQuery.isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
              <SearchX className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {hasFilters ? 'No configurations match your filters' : 'No configurations yet'}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
                {hasFilters
                  ? 'Try a different keyword, or clear the provider / purpose filters.'
                  : 'Create the first configuration — or start from a preset below.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={() => openCreate()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]"
              >
                <Plus className="size-3.5" strokeWidth={2.5} /> New configuration
              </button>
            </div>
          </div>
        ) : (
          <div className="relative p-4 sm:p-5">
            {listQuery.isFetching && !listQuery.isLoading && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
              </div>
            )}
            <DataTable
              manual
              columns={columns}
              data={items}
              searchKey="name"
              showSearch={false}
              getRowId={(row) => row.id}
              isLoading={listQuery.isLoading}
              totalRowCount={totalItems}
              pagination={pagination}
              onPaginationChange={setPagination}
              emptyText={hasFilters ? 'No configurations match your filters.' : 'No configurations yet.'}
            />
          </div>
        )}
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>

      {/* Presets */}
      <PresetsPanel
        presets={presetsQuery.data ?? []}
        isLoading={presetsQuery.isLoading}
        onSelect={(p) => openCreate(p)}
      />

      {/* Create / Edit / View modal */}
      <AiConfigForm
        open={formOpen}
        mode={formMode}
        initial={selected}
        preset={selectedPreset}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: CreateAiConfigFormValues) => {
          try {
            if (formMode === 'edit' && selected) {
              await update({ id: selected.id, body: values });
            } else {
              await create(values);
            }
            setFormOpen(false);
            setSelectedPreset(null);
          } catch {
            // toast shown by the mutation handler; keep the form open to fix it
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete AI configuration?"
        message={
          deleting
            ? `Delete ${deleting.name}? AI features that rely on it will stop working.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id);
          } catch {
            // toast shown by the error handler
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}

function PresetsPanel({
  presets,
  isLoading,
  onSelect,
}: {
  presets: AiPreset[];
  isLoading: boolean;
  onSelect: (preset: AiPreset) => void;
}) {
  if (!isLoading && presets.length === 0) return null;
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-extrabold tracking-tight text-gray-900">AI presets</h2>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Ready-made templates — pick one to prefill the creation form.
          </p>
        </div>
        <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold uppercase text-[#9a3412] ring-1 ring-orange-200">
          {isLoading ? '…' : `${presets.length} presets`}
        </span>
      </div>
      {isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-px hover:border-orange-300 hover:shadow-[0_4px_14px_rgba(242,111,33,0.15)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-extrabold text-gray-900">{p.label}</span>
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                  {p.purpose}
                </span>
              </div>
              <p className="text-[12px] leading-5 text-gray-500">{p.description}</p>
              <p className="mt-auto truncate pt-1 font-mono text-[11px] font-medium text-gray-400">{p.modelName}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function Kpi({ icon, label, value, hint, tone = 'gray' }: { icon: React.ReactNode; label: string; value: string; hint: string; tone?: 'gray' | 'green' | 'orange' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-[#C2410C]',
  } as const;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-lg font-extrabold tabular-nums leading-tight text-gray-900">
          {value} <span className="text-[11px] font-medium text-gray-400">{hint}</span>
        </p>
      </div>
    </div>
  );
}

// Re-export guard removed: form modal owns its own Modal lifecycle.
