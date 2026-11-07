// Academic Rules — Operate-mode redesign synced with the Courses ecosystem:
// gradient header, KPI strip, filters, DataTable (skeleton, empty state),
// Publish / Archive / Reopen lifecycle, read-only ACTIVE rules.
import { useMemo, useState } from 'react';
import {
  Archive,
  CircleAlert,
  FileWarning,
  Plus,
  RotateCcw,
  ScrollText,
  Search,
  SearchX,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { RuleTable, RuleFormModal } from '../components/academic-rules';
import { RuleStatusBadge } from '../components/academic-rules/RuleTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAcademicRulesQuery } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { useCurriculumsQuery } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useAcademicRuleMutations } from '../../academic/hooks/mutations/useAcademicRuleMutations';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
  AcademicRuleStatus,
} from '../../academic/types/academic-rule';
import { POLICY_TYPES } from '../../academic/validations/academic-rule.schema';
import type { CreateAcademicRuleFormValues } from '../../academic/validations/academic-rule.schema';

const PAGE_SIZE = 10;

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

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
  const curriculums = useCurriculumsQuery('curriculum', { page: 0, size: 100 });
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

  const activeCount = items.filter((r) => r.status === 'ACTIVE').length;
  const draftCount = items.filter((r) => r.status === 'DRAFT').length;

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
      // toast shown by the mutation handler; keep the page state untouched
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
            <ScrollText className="size-5.5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Academic Rules</h1>
            <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">
              Policies attached to curricula that the system enforces for students — GPA warnings, credit caps, attendance gates
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Create Rule
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi
          icon={<ShieldCheck className="size-4" />}
          label="Total rules"
          value={String(totalItems || '—')}
          hint={isFetching ? 'Refreshing…' : `Page ${pagination.pageIndex + 1} of ${Math.max(1, data?.totalPages ?? 1)}`}
        />
        <Kpi
          icon={<FileWarning className="size-4" />}
          label="Published (Active)"
          value={String(activeCount)}
          hint={`${items.length} shown`}
          tone="green"
        />
        <Kpi
          icon={<Archive className="size-4" />}
          label="Drafts on this page"
          value={String(draftCount)}
          hint="Ready to publish"
          tone="orange"
        />
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
              placeholder="Search by policy type, description, message…"
              aria-label="Search academic rules"
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
            <select
              value={policyType}
              onChange={(e) => resetPage(setPolicyType)(e.target.value)}
              aria-label="Filter by policy type"
              className={selectClass}
            >
              <option value="ALL">Type: All</option>
              {POLICY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => resetPage(setStatus)(e.target.value as 'ALL' | AcademicRuleStatus)}
              aria-label="Filter by status"
              className={selectClass}
            >
              <option value="ALL">Status: All</option>
              <option value="DRAFT">● Draft</option>
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
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load rules</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The rule list failed to load. Check your connection or mock flag, then try again — your filters are kept.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
            >
              <RotateCcw className="size-3.5" /> Retry
            </button>
          </div>
        ) : !isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
              <SearchX className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {hasFilters ? 'No rules match your filters' : 'No academic rules yet'}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
                {hasFilters
                  ? 'Try a different keyword, or clear the type / status filters to see the full list.'
                  : 'Create the first rule (e.g. GPA Warning < 5.0) to start enforcing academic policies.'}
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
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]"
              >
                <Plus className="size-3.5" strokeWidth={2.5} /> Create rule
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
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
                  toast.error(`${r.policyType} is ACTIVE — archive it before deleting.`);
                  return;
                }
                setDeleting(r);
              }}
            />
          </div>
        )}
      </div>

      <RuleFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        curriculums={(curriculums.data?.items ?? []).map((item) => ({
          id: item.id,
          name: `${item.majorCode}_${item.version} - ${item.name}`,
        }))}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: CreateAcademicRuleFormValues) => {
          try {
            if (formMode === 'edit' && editing) {
              await update({ id: editing.id, body: values });
            } else {
              await create(values);
            }
            setFormOpen(false);
          } catch {
            // toast shown by the mutation handler; keep the form open to fix it
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete rule?"
        message={
          deleting
            ? `Delete ${deleting.policyType} on ${deleting.curriculumName}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving || isChangingStatus}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove(deleting.id);
          } catch {
            // toast shown by the error handler (e.g. ACTIVE rules need archiving first)
          }
          setDeleting(null);
        }}
      />

      {deleting && (
        <div className="sr-only" aria-live="polite">
          Deleting <RuleStatusBadge status={deleting.status} />
        </div>
      )}
    </div>
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
