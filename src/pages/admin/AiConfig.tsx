// src/pages/admin/AiConfig.tsx
import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { AiConfigForm } from '../../components/admin/ai-config';
import { Modal } from '../../components/ui/Modal';
import { useAiConfigsQuery, useAiConfig, useAiPresetsQuery } from '../../hooks/queries/useAiConfigQuery';
import { useAiConfigMutations } from '../../hooks/mutations/useAiConfigMutations';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import type { AiConfig } from '../../types/ai-config';
import type {
  CreateAiConfigFormValues,
} from '../../validations/ai-config.schema';

export default function AiConfigPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [deleting, setDeleting] = useState<AiConfig | null>(null);

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

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Configuration</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage AI models, prompts and usage limits used across the platform
          </p>
        </div>
        <button
          onClick={() => setCreatingOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs"
        >
          <Plus className="size-4" /> New Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
          {listQuery.isLoading && <p className="p-4 text-xs text-gray-500">Loading...</p>}
          <ul className="divide-y divide-gray-100">
            {items.map((cfg) => (
              <li key={cfg.id}>
                <button
                  onClick={() => setEditingId(cfg.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50/60 ${
                    editingId === cfg.id ? 'bg-orange-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{cfg.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {cfg.provider} · {cfg.purpose} · {cfg.modelName}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        cfg.isActive
                          ? 'bg-emerald-100/70 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cfg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5">
          {activeItem ? (
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
          ) : (
            <p className="text-xs text-gray-500">
              Select a configuration on the left to edit it, or create a new one.
            </p>
          )}
        </section>
      </div>

      {/* Preset hint */}
      {presetsQuery.data && presetsQuery.data.length > 0 && (
        <div className="bg-orange-50/40 border border-orange-200/60 rounded-xl p-4 text-xs text-gray-700">
          <p className="font-bold uppercase text-[10px] mb-2 text-[#F26F21]">
            Available Presets
          </p>
          <p className="mb-2 text-gray-600">
            Use one of these presets to populate a new configuration quickly.
          </p>
          <div className="flex flex-wrap gap-2">
            {presetsQuery.data.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md font-semibold"
              >
                {p.label}
                <ChevronDown className="size-3 text-gray-400" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Create modal */}
      <Modal open={creatingOpen} onClose={() => setCreatingOpen(false)} title="New AI Configuration">
        <div className="p-6">
          <AiConfigForm
            mode="create"
            isLoading={isCreating}
            onSubmit={async (values) => {
              await create(values);
              setCreatingOpen(false);
            }}
            onSetSecret={async () => {
              /* no-op in create; secret set after creation */
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
        }}
      />

      {activeItem && (
        <button
          onClick={() => setDeleting(activeItem)}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Delete this configuration
        </button>
      )}
    </div>
  );
}