import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { RuleTable } from '../components/academic-rules';
import { useAcademicRulesQuery } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { useAcademicRuleMutations } from '../../academic/hooks/mutations/useAcademicRuleMutations';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  AcademicRuleStatus,
} from '../../academic/types/academic-rule';
import type { CreateAcademicRuleFormValues } from '../../academic/validations/academic-rule.schema';
import {
  AcademicRulesFilterBar,
  AcademicRulesTopBar,
} from './academic-rules/AcademicRulesHeader';
import {
  AcademicRulesEmptyState,
  AcademicRulesErrorState,
  AcademicRulesModals,
} from './academic-rules/AcademicRulesStates';

const PAGE_SIZE = 10;
type FormMode = 'create' | 'edit' | 'view';

export default function AcademicRulesPage() {
  const [search, setSearch] = useState('');
  const [policyType, setPolicyType] = useState('ALL');
  const [status, setStatus] = useState<'ALL' | AcademicRuleStatus>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editing, setEditing] = useState<AcademicRule | null>(null);
  const [deleting, setDeleting] = useState<AcademicRule | null>(null);

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
  const {
    create,
    isCreating,
    update,
    isUpdating,
    publish,
    archive,
    reopen,
    isChangingStatus,
    remove,
    isRemoving,
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

  const openCreate = () => {
    setEditing(null);
    setFormMode('create');
    setFormOpen(true);
  };
  const openView = (rule: AcademicRule) => {
    setEditing(rule);
    setFormMode('view');
    setFormOpen(true);
  };
  const openEdit = (rule: AcademicRule) => {
    if (rule.status === 'ACTIVE') {
      openView(rule);
      return;
    }
    setEditing(rule);
    setFormMode('edit');
    setFormOpen(true);
  };

  const guard = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch {
      return;
    }
  };

  return (
    <div className="w-full space-y-4">
      <AcademicRulesTopBar
        totalItems={data?.totalItems}
        isFetching={isFetching}
        pageIndex={pagination.pageIndex}
        totalPages={data?.totalPages ?? 1}
        activeCount={items.filter((r) => r.status === 'ACTIVE').length}
        shownCount={items.length}
        draftCount={items.filter((r) => r.status === 'DRAFT').length}
        selectedStatus={status}
        onSelectStatus={resetPage(setStatus)}
        onCreate={openCreate}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <AcademicRulesFilterBar
          search={search}
          policyType={policyType}
          status={status}
          hasFilters={hasFilters}
          onSearchChange={resetPage(setSearch)}
          onPolicyTypeChange={resetPage(setPolicyType)}
          onStatusChange={resetPage(setStatus)}
          onClear={clearFilters}
        />

        <div className="h-[520px]">
          {isError ? (
            <AcademicRulesErrorState onRetry={() => refetch()} />
          ) : !isLoading && items.length === 0 ? (
            <AcademicRulesEmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreate} />
          ) : (
            <div className="h-full">
              <RuleTable
                data={items}
                isLoading={isLoading}
                isFetching={isFetching}
                totalRowCount={totalItems}
                pagination={pagination}
                onPaginationChange={setPagination}
                onView={openView}
                onEdit={openEdit}
                onPublish={(r) => guard(() => publish(r.id))}
                onArchive={(r) => guard(() => archive(r.id))}
                onReopen={(r) => guard(() => reopen(r.id))}
                onDelete={(r) => {
                  if (r.status === 'ACTIVE') {
                    toast.error(`${r.ruleName} is ACTIVE — archive it before deleting.`);
                    return;
                  }
                  setDeleting(r);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <AcademicRulesModals
        formOpen={formOpen}
        formMode={formMode}
        editing={editing}
        isSaving={isCreating || isUpdating}
        onCloseForm={() => setFormOpen(false)}
        onSubmitForm={async (values: CreateAcademicRuleFormValues) => {
          try {
            if (formMode === 'edit' && editing) await update({ id: editing.id, body: values });
            else await create(values);
            setFormOpen(false);
          } catch {
            return;
          }
        }}
        deleting={deleting}
        isDeleting={isRemoving || isChangingStatus}
        onCancelDelete={() => setDeleting(null)}
        onConfirmDelete={async () => {
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
