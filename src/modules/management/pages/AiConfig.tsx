// src/pages/management/AiConfig.tsx
import { useMemo, useState } from 'react';
import { Check, Plus, Search, Sparkles, Trash2, Zap } from 'lucide-react';
import { AiConfigForm } from '../components/ai-config';
import { Modal } from '../../../shared/components/ui/Modal';

import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAiConfigsQuery, useAiConfig, useAiPresetsQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import { useAiConfigMutations } from '../../ai/hooks/mutations/useAiConfigMutations';
import type { AiConfig, AiPreset } from '../../ai/types/ai-config';
import type { CreateAiConfigFormValues } from '../../ai/validations/ai-config.schema';
import { cn } from '@/shared/lib/utils';

export default function AiConfigPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [deleting, setDeleting] = useState<AiConfig | null>(null);
  const [search, setSearch] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<AiPreset | null>(null);

  const listQuery = useAiConfigsQuery();
  const presetsQuery = useAiPresetsQuery();
  const detailQuery = useAiConfig(editingId);

  const {
    create,
    isCreating,
    update,
    isUpdating,
    setSecret,
    isSettingSecret,
    remove,
    isRemoving,
  } = useAiConfigMutations();

  const items = listQuery.data?.items ?? [];
  const activeItem = detailQuery.data ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.modelName.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q),
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const active = items.filter((c) => c.isActive).length;
    const chat = items.filter((c) => c.purpose === 'CHAT' && c.isActive).length;
    return { total: items.length, active, chat };
  }, [items]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#555f6f]">AI / Configuration</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">AI Configuration</h1>
          <p className="mt-2 text-sm text-[#555f6f]">
            Manage models, prompts, and usage limits for all AI features in the system.
          </p>
        </div>
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => setCreatingOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#f37021] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#d95f15]"
          >
            <Plus className="size-4" />
            New configuration
          </button>
        </div>
      </div>



      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total configurations" value={stats.total} icon={Sparkles} tone="orange" />
        <SummaryCard label="Active" value={stats.active} icon={Check} tone="emerald" />
        <SummaryCard label="Active chat models" value={stats.chat} icon={Zap} tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* Danh sách cấu hình */}
        <aside className="flex max-h-[720px] flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-[#e7eefe] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#151c27]">Configurations</h2>
              <span className="rounded-full bg-[#f7f8fa] px-2 py-0.5 text-[11px] font-bold text-[#555f6f]">
                {filtered.length}
              </span>
            </div>
            <label className="mt-3 flex h-[38px] items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <Search className="size-4 text-[#98a2b3]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or model..."
                aria-label="Search AI configurations"
                className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="flex flex-col gap-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : listQuery.isError && !listQuery.data ? (
              <div className="p-8 text-center text-sm text-[#555f6f]">
                Could not load configurations.{' '}
                <button type="button" onClick={() => listQuery.refetch()} className="font-semibold text-orange-600 hover:underline">
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-8 text-center text-sm text-[#555f6f]">
                {search ? 'No configuration matches your search.' : 'No configurations yet.'}
              </p>
            ) : (
              <ul className="divide-y divide-[#f1f5f9]">
                {filtered.map((cfg) => (
                  <li key={cfg.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cfg.id);
                        setSelectedPreset(null);
                      }}
                      className={cn(
                        'w-full px-4 py-3.5 text-left transition-colors hover:bg-[#f7f8fa]',
                        editingId === cfg.id && 'border-l-[3px] border-[#f37021] bg-[#fff7ed]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#151c27]">{cfg.name}</p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.02em]',
                            cfg.isActive ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-gray-100 text-[#555f6f]',
                          )}
                        >
                          {cfg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[#555f6f]">
                        {cfg.provider} · {cfg.purpose} · {cfg.modelName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Tag>temp {cfg.temperature}</Tag>
                        <Tag>top-K {cfg.retrievalTopK}</Tag>
                        <Tag>{cfg.maxTokens.toLocaleString('en-US')} tokens</Tag>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Form chi tiết */}
        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          {activeItem ? (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[#e7eefe] pb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#151c27]">{activeItem.name}</h2>
                  <p className="mt-0.5 text-xs text-[#555f6f]">
                    Last updated {new Date(activeItem.updatedAt).toLocaleString('en-US')} · {activeItem.provider} ·{' '}
                    {activeItem.modelName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleting(activeItem)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#fecaca] px-3 py-1.5 text-[13px] font-semibold text-[#b91c1c] hover:bg-[#fef2f2]"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>
              <AiConfigForm
                mode="edit"
                initial={activeItem}
                isLoading={isUpdating}
                onSubmit={async (values: CreateAiConfigFormValues) => {
                  await update({ id: activeItem.id, body: values });
                }}
                onSetSecret={async (apiKey) => {
                  await setSecret({ id: activeItem.id, body: { apiKey } });
                }}
                isSettingSecret={isSettingSecret}
              />
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#f7f8fa]">
                <Sparkles className="size-6 text-[#98a2b3]" />
              </span>
              <p className="text-sm font-semibold text-[#151c27]">No configuration selected</p>
              <p className="max-w-sm text-[13px] text-[#555f6f]">
                Select a configuration from the list to edit it, or create a new configuration to begin.
              </p>
              <button
                type="button"
                onClick={() => setCreatingOpen(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#f37021] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#d95f15]"
              >
                <Plus className="size-4" />
                New configuration
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Presets */}
      <PresetsPanel
        presets={presetsQuery.data ?? []}
        selected={selectedPreset}
        onSelect={(preset) => {
          setSelectedPreset(preset);
          setEditingId(null);
          setCreatingOpen(true);
        }}
      />

      {/* Create modal */}
      <Modal open={creatingOpen} onClose={() => setCreatingOpen(false)} title="New AI Configuration" className="max-w-3xl">
        <div className="overflow-y-auto p-6">
          {selectedPreset && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-orange-200 bg-[#fff7ed] px-4 py-3">
              <p className="text-[13px] text-[#9a3412]">
                Applying preset <span className="font-bold">{selectedPreset.label}</span> — review the fields before creating it.
              </p>
              <button
                type="button"
                onClick={() => setSelectedPreset(null)}
                className="text-[13px] font-semibold text-[#9a3412] hover:underline"
              >
                Remove preset
              </button>
            </div>
          )}
          <AiConfigForm
            mode="create"
            preset={selectedPreset}
            isLoading={isCreating}
            onSubmit={async (values) => {
              await create(values);
              setCreatingOpen(false);
              setSelectedPreset(null);
            }}
            onSetSecret={async () => {
              /* API key được đặt sau khi config đã tạo */
            }}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete AI configuration?"
        message="AI features that rely on this configuration will stop working."
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id);
          setDeleting(null);
          setEditingId(null);
        }}
      />
    </div>
  );
}

function PresetsPanel({
  presets,
  selected,
  onSelect,
}: {
  presets: AiPreset[];
  selected: AiPreset | null;
  onSelect: (preset: AiPreset) => void;
}) {
  if (presets.length === 0) return null;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#151c27]">AI presets</h2>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            Ready-made configuration templates — select one to create a new configuration from that preset.
          </p>
        </div>
        <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold uppercase text-[#f37021]">
          {presets.length} presets
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className={cn(
              'flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
              selected?.id === p.id
                ? 'border-[#f37021] bg-[#fff7ed]'
                : 'border-[#e5e7eb] hover:border-[#f37021] hover:bg-[#f7f8fa]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#151c27]">{p.label}</span>
              <span className="rounded bg-[#f7f8fa] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#555f6f]">
                {p.purpose}
              </span>
            </div>
            <p className="text-[12px] leading-5 text-[#555f6f]">{p.description}</p>
            <p className="mt-auto pt-2 text-[11px] font-medium text-[#98a2b3]">{p.modelName}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Sparkles;
  tone: 'orange' | 'emerald' | 'blue';
}) {
  const tones = {
    orange: 'bg-[#fff7ed] text-[#f37021]',
    emerald: 'bg-[#ecfdf5] text-[#047857]',
    blue: 'bg-[#eff6ff] text-[#2563eb]',
  };
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <span className={cn('flex size-10 items-center justify-center rounded-full', tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[13px] text-[#555f6f]">{label}</p>
        <p className="text-2xl font-bold leading-8 text-[#151c27]">{value.toLocaleString('en-US')}</p>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[#f7f8fa] px-1.5 py-0.5 text-[10px] font-semibold text-[#555f6f]">{children}</span>
  );
}
