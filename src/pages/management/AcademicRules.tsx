// src/pages/management/AcademicRules.tsx
import { useMemo, useState } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { RuleTable, RuleFormModal } from '../../components/management/academic-rules';
import { ConfirmDialog } from '../../components/management/ConfirmDialog';
import { useAcademicRulesQuery } from '../../hooks/queries/useAcademicRulesQuery';
import { useCurriculumsQuery } from '../../hooks/queries/useCurriculumsQuery';
import { useAcademicRuleMutations } from '../../hooks/mutations/useAcademicRuleMutations';
import { useDebounce } from '../../hooks/useDebounce';
import type {
  AcademicRule,
  AcademicRuleFilterParams,
} from '../../types/academic-rule';
import { POLICY_TYPES } from '../../validations/academic-rule.schema';
import type { CreateAcademicRuleFormValues } from '../../validations/academic-rule.schema';

export default function AcademicRulesPage() {
  const [search, setSearch] = useState('');
  const [policyType, setPolicyType] = useState('ALL');
  const [isActive, setIsActive] = useState('ALL');
  const debouncedSearch = useDebounce(search, 300);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicRule | null>(null);
  const [deleting, setDeleting] = useState<AcademicRule | null>(null);

  const params: AcademicRuleFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      policyType: policyType === 'ALL' ? undefined : (policyType as 'GPA_WARNING'),
      isActive: isActive === 'ALL' ? undefined : isActive === 'true',
      page: 0,
      size: 20,
    }),
    [debouncedSearch, policyType, isActive],
  );

  const { data, isLoading } = useAcademicRulesQuery(params);
  const curriculums = useCurriculumsQuery('curriculum', { page: 0, size: 100 });
  const {
    create,
    isCreating,
    update,
    isUpdating,
    toggle,
    isToggling,
    remove,
    isRemoving,
  } = useAcademicRuleMutations();

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Academic Rules</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Policies attached to curricula that the system enforces for students
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs"
        >
          <Plus className="size-4" /> Create Rule
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#F26F21]"
            />
          </div>
          <div className="relative">
            <select
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs"
            >
              <option value="ALL">Type: All</option>
              {POLICY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs"
            >
              <option value="ALL">Status: All</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading && <p className="text-xs text-gray-500">Loading rules...</p>}
      {data && (
        <RuleTable
          data={data.items}
          selectedIds={selectedIds}
          onSelectAll={(c) => setSelectedIds(c ? data.items.map((i) => i.id) : [])}
          onSelectRow={(id) =>
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onView={(r) => {
            setEditing(r);
            setFormOpen(true);
          }}
          onEdit={(r) => {
            setEditing(r);
            setFormOpen(true);
          }}
          onDelete={(r) => setDeleting(r)}
          onToggle={async (r, next) => {
            await toggle({ id: r.id, body: { isActive: next } });
          }}
        />
      )}

      <RuleFormModal
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        curriculums={(curriculums.data?.items ?? []).map((item) => ({
          id: item.id,
          name: `${item.majorCode}_${item.version} - ${item.name}`,
        }))}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: CreateAcademicRuleFormValues) => {
          if (editing) {
            await update({ id: editing.id, body: values });
          } else {
            await create(values);
          }
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete rule?"
        message={
          deleting ? `Delete rule ${deleting.policyType} on ${deleting.curriculumName}?` : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving || isToggling}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
