import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { chunkArray, fetchAllPages } from '@/shared/lib/fetchAllPages';
import { RuleTable } from '../components/academic-rules';
import { ACADEMIC_RULE_QUERY_KEYS, useAcademicRulesQuery } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { useAcademicRuleMutations } from '../../academic/hooks/mutations/useAcademicRuleMutations';
import { academicRuleService } from '../services/academic-rule.service';
import type { AcademicRule, AcademicRuleFilterParams, AcademicRuleStatus } from '../../academic/types/academic-rule';
import type { CreateAcademicRuleFormValues } from '../../academic/validations/academic-rule.schema';
import { AcademicRulesFilterBar, AcademicRulesTopBar } from './academic-rules/AcademicRulesHeader';
import { AcademicRulesEmptyState, AcademicRulesErrorState, AcademicRulesModals } from './academic-rules/AcademicRulesStates';
import { AcademicRulesBulkBar } from './academic-rules/AcademicRulesBulkBar';
import { AcademicBlockLimitsTab } from './academic-rules/AcademicBlockLimitsTab';

const PAGE_SIZE = 10;
type FormMode = 'create' | 'edit' | 'view';
type PageTab = 'rules' | 'blocks';

export default function AcademicRulesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PageTab>('rules');
  const [search, setSearch] = useState('');
  const [policyType, setPolicyType] = useState('ALL');
  const [status, setStatus] = useState<'ALL' | AcademicRuleStatus>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editing, setEditing] = useState<AcademicRule | null>(null);
  const [deleting, setDeleting] = useState<AcademicRule | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<AcademicRule[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  const params: AcademicRuleFilterParams = useMemo(
    () => ({
      search: search || undefined,
      policyType: policyType === 'ALL' ? undefined : (policyType as AcademicRuleFilterParams['policyType']),
      status: status === 'ALL' ? undefined : status,
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: 'priority,asc',
    }),
    [search, policyType, status, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isFetching, isError, refetch } = useAcademicRulesQuery(params);
  const summaryQuery = useQuery({
    queryKey: [...ACADEMIC_RULE_QUERY_KEYS.all, 'summary'],
    queryFn: academicRuleService.summary,
  });
  const {
    create, isCreating, update, isUpdating, publish, archive, reopen,
    isChangingStatus, remove, isRemoving, seedFlm, isSeedingFlm,
  } = useAcademicRuleMutations();

  const items = useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.totalItems ?? 0;

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const hasFilters = search !== '' || policyType !== 'ALL' || status !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setPolicyType('ALL');
    setStatus('ALL');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const openForm = (rule: AcademicRule | null, mode: FormMode) => {
    setEditing(rule);
    setFormMode(mode);
    setFormOpen(true);
  };
  const openCreate = () => openForm(null, 'create');
  const openView = (rule: AcademicRule) => openForm(rule, 'view');
  const openEdit = (rule: AcademicRule) => openForm(rule, rule.status === 'ACTIVE' ? 'view' : 'edit');
  const guard = async (fn: () => Promise<unknown>) => { try { await fn(); } catch { /* handled */ } };

  const runBatch = async (targets: AcademicRule[], action: (r: AcademicRule) => Promise<unknown>, okVerb: string, failVerb: string) => {
    setBulkBusy(true);
    let ok = 0; let failed = 0;
    try {
      for (const batch of chunkArray(targets, 10)) {
        for (const item of await Promise.allSettled(batch.map(action))) {
          if (item.status === 'fulfilled') ok += 1;
          else failed += 1;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ACADEMIC_RULE_QUERY_KEYS.all });
      if (ok > 0) toast.success(`${okVerb} ${ok} rule${ok === 1 ? '' : 's'}.`);
      if (failed > 0) toast.error(`Could not ${failVerb} ${failed} rule${failed === 1 ? '' : 's'}.`);
    } finally { setBulkBusy(false); }
  };

  const handleBulkStatus = async (selectedRows: AcademicRule[], nextStatus: AcademicRuleStatus) => {
    const targets = selectedRows.filter((r) => r.status !== nextStatus);
    if (targets.length === 0) return void toast.info(`All selected rules are already ${nextStatus}.`);
    await runBatch(targets, (r) => academicRuleService.updateStatus(r.id, nextStatus), `Updated to ${nextStatus}:`, 'update');
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteTargets.length === 0) return;
    await runBatch(bulkDeleteTargets, (r) => academicRuleService.remove(r.id), 'Deleted', 'delete');
    setBulkDeleteTargets([]);
  };

  return (
    <div className="w-full space-y-4">
      <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs">
        {([['rules', 'Academic Rules'], ['blocks', 'Block & Study Limits']] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)} className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-colors ${activeTab === key ? 'bg-[#F26F21] text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
            {label}
          </button>
        ))}
      </div>
      {activeTab === 'blocks' ? <AcademicBlockLimitsTab /> : (<>
      <AcademicRulesTopBar
        totalItems={summaryQuery.data?.total ?? data?.totalItems} isFetching={isFetching}
        pageIndex={pagination.pageIndex} totalPages={data?.totalPages ?? 1}
        activeCount={summaryQuery.data?.active ?? items.filter((r) => r.status === 'ACTIVE').length}
        draftCount={summaryQuery.data?.draft ?? items.filter((r) => r.status === 'DRAFT').length}
        inactiveCount={summaryQuery.data?.inactive ?? items.filter((r) => r.status === 'INACTIVE').length}
        selectedStatus={status} onSelectStatus={resetPage(setStatus)} onCreate={openCreate}
        onSeedFlm={() => void guard(() => seedFlm())} isSeedingFlm={isSeedingFlm}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <AcademicRulesFilterBar
          search={search} policyType={policyType} status={status} hasFilters={hasFilters}
          onSearchChange={resetPage(setSearch)} onPolicyTypeChange={resetPage(setPolicyType)}
          onStatusChange={resetPage(setStatus)} onClear={clearFilters}
        />

        <div className="h-[calc(100vh-295px)] min-h-[460px]">
          {isError ? (
            <AcademicRulesErrorState onRetry={() => refetch()} />
          ) : !isLoading && items.length === 0 ? (
            <AcademicRulesEmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} />
          ) : (
            <div className="h-full">
              <RuleTable
                data={items} isLoading={isLoading} isFetching={isFetching} totalRowCount={totalItems}
                pagination={pagination} onPaginationChange={setPagination}
                onFetchAllRows={() =>
                  fetchAllPages((page, size) =>
                    academicRuleService.list({
                      search: search || undefined,
                      policyType: policyType === 'ALL' ? undefined : (policyType as AcademicRuleFilterParams['policyType']),
                      status: status === 'ALL' ? undefined : status,
                      page, size, sort: 'priority,asc',
                    }),
                  )
                }
                bulkActions={(selectedRows) => (
                  <AcademicRulesBulkBar
                    selectedRows={selectedRows} busy={bulkBusy}
                    onBulkStatus={(rows, next) => void handleBulkStatus(rows, next)}
                    onBulkDelete={setBulkDeleteTargets}
                  />
                )}
                onView={openView} onEdit={openEdit}
                onPublish={(r) => guard(() => publish(r.id))}
                onArchive={(r) => guard(() => archive(r.id))}
                onReopen={(r) => guard(() => reopen(r.id))}
                onDelete={(r) => (r.status === 'ACTIVE'
                  ? void toast.error(`${r.ruleName} is ACTIVE — archive it before deleting.`)
                  : setDeleting(r))}
              />
            </div>
          )}
        </div>
      </div>

      <AcademicRulesModals
        formOpen={formOpen} formMode={formMode} editing={editing} isSaving={isCreating || isUpdating}
        onCloseForm={() => setFormOpen(false)}
        onSubmitForm={async (values: CreateAcademicRuleFormValues) => {
          try {
            if (formMode === 'edit' && editing) await update({ id: editing.id, body: values });
            else await create(values);
            setFormOpen(false);
          } catch { return; }
        }}
        deleting={deleting} isDeleting={isRemoving || isChangingStatus} onCancelDelete={() => setDeleting(null)}
        onConfirmDelete={async () => { if (deleting) try { await remove(deleting.id); } finally { setDeleting(null); } }}
        bulkDeleteTargets={bulkDeleteTargets} isBulkDeleting={bulkBusy}
        onCancelBulkDelete={() => setBulkDeleteTargets([])} onConfirmBulkDelete={handleConfirmBulkDelete}
      />
      </>
      )}
    </div>
  );
}
