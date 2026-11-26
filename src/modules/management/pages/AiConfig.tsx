import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import AiConfigForm from '../components/ai-config/AiConfigForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../../../shared/components/common/DataTable';
import { useAiConfigsQuery, useAiPresetsQuery } from '../../ai/hooks/queries/useAiConfigQuery';
import { useAiConfigMutations } from '../../ai/hooks/mutations/useAiConfigMutations';
import type { AiConfig, AiPreset } from '../../ai/types/ai-config';
import type { CreateAiConfigFormValues } from '../../ai/validations/ai-config.schema';
import { createAiConfigColumns } from './ai/aiConfigColumns';
import { AiConfigFilterBar, AiConfigTopBar } from './ai/AiConfigHeader';
import { AiConfigEmptyState, AiConfigErrorState, PresetsPanel } from './ai/AiConfigPanels';

const PAGE_SIZE = 10;
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
      provider: provider === 'ALL' ? undefined : (provider as 'GEMINI' | 'OPENROUTER' | 'OTHER'),
      purpose: purpose === 'ALL' ? undefined : (purpose as 'CHAT' | 'EMBEDDING' | 'OCR'),
      isActive: status === 'ALL' ? undefined : status === 'ACTIVE',
      page: pagination.pageIndex,
      size: pagination.pageSize,
    }),
    [search, provider, purpose, status, pagination.pageIndex, pagination.pageSize],
  );

  const listQuery = useAiConfigsQuery(params);
  const presetsQuery = useAiPresetsQuery();
  const { create, isCreating, update, isUpdating, setSecret, testConnection, remove, isRemoving } = useAiConfigMutations();

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const totalItems = listQuery.data?.totalItems ?? 0;

  const stats = useMemo(
    () => ({
      total: listQuery.data?.totalItems,
      active: items.filter((c) => c.isActive).length,
      chat: items.filter((c) => c.purpose === 'CHAT').length,
    }),
    [items, listQuery.data?.totalItems],
  );

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

  const openForm = (mode: FormMode, cfg: AiConfig | null = null, preset: AiPreset | null = null) => {
    setSelected(cfg);
    setSelectedPreset(preset);
    setFormMode(mode);
    setFormOpen(true);
  };
  const openCreate = (preset?: AiPreset) => openForm('create', null, preset ?? null);

  const columns = useMemo(
    () => createAiConfigColumns({
      onView: (cfg) => openForm('view', cfg),
      onEdit: (cfg) => openForm('edit', cfg),
      onTest: (cfg) => void testConnection(cfg.id).catch(() => undefined),
      onDelete: setDeleting,
    }),
    [testConnection],
  );

  return (
    <div className="w-full space-y-4">
      <AiConfigTopBar
        total={stats.total}
        active={stats.active}
        chat={stats.chat}
        shownCount={items.length}
        isFetching={listQuery.isFetching}
        status={status}
        purpose={purpose}
        onClearAll={() => {
          setStatus('ALL');
          setPurpose('ALL');
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        onToggleActive={() => resetPage(setStatus)(status === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
        onToggleChat={() => resetPage(setPurpose)(purpose === 'CHAT' ? 'ALL' : 'CHAT')}
        onSelectPurpose={resetPage(setPurpose)}
        onCreate={() => openCreate()}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <AiConfigFilterBar
          search={search}
          provider={provider}
          purpose={purpose}
          status={status}
          hasFilters={hasFilters}
          onSearchChange={resetPage(setSearch)}
          onProviderChange={resetPage(setProvider)}
          onPurposeChange={resetPage(setPurpose)}
          onStatusChange={resetPage(setStatus)}
          onClear={clearFilters}
        />

        <div className="h-[calc(100vh-295px)] min-h-[460px]">
          {listQuery.isError ? (
            <AiConfigErrorState onRetry={() => listQuery.refetch()} />
          ) : !listQuery.isLoading && items.length === 0 ? (
            <AiConfigEmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={() => openCreate()} />
          ) : (
            <div className="relative h-full">
              {listQuery.isFetching && !listQuery.isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                  <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
                </div>
              )}
              <DataTable
                className="h-full" manual columns={columns} data={items} searchKey="name" showSearch={false}
                getRowId={(row) => row.id} isLoading={listQuery.isLoading} totalRowCount={totalItems}
                pagination={pagination} onPaginationChange={setPagination}
                emptyText={hasFilters ? 'No configurations match your filters.' : 'No configurations yet.'}
              />
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>

      <PresetsPanel presets={presetsQuery.data ?? []} isLoading={presetsQuery.isLoading} onSelect={openCreate} />

      <AiConfigForm
        open={formOpen}
        mode={formMode}
        initial={selected}
        preset={selectedPreset}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: CreateAiConfigFormValues, apiKey?: string) => {
          try {
            const saved =
              formMode === 'edit' && selected
                ? await update({ id: selected.id, body: values })
                : await create(values);
            if (apiKey) {
              await setSecret({ id: saved.id, body: { apiKey } });
            }
            setFormOpen(false);
            setSelectedPreset(null);
          } catch {
            return;
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete AI configuration?"
        message={deleting ? `Delete ${deleting.name}? AI features that rely on it will stop working.` : ''}
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id);
          } catch {
            setDeleting(null);
            return;
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}
