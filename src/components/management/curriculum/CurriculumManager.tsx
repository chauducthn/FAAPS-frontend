// src/components/management/curriculum/CurriculumManager.tsx
// List + create / edit / activate / delete, shared by the Cohorts and Curriculum pages.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';
import { Pagination } from '../Pagination';
import CurriculumFormModal from './CurriculumFormModal';
import CurriculumTable from './CurriculumTable';
import { useCurriculumsQuery, type CurriculumKind } from '../../../hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../../hooks/mutations/useCurriculumMutations';
import { useMajorsQuery } from '../../../hooks/queries/useMajorsQuery';
import { useDebounce } from '../../../hooks/useDebounce';
import type { CurriculumFilterParams, CurriculumItem, CurriculumStatus } from '../../../types/curriculum';

const PAGE_SIZE = 10;

const COPY = {
  cohort: {
    title: 'Cohorts',
    subtitle: 'Each cohort is one version of a major (for example SE K19) with its starting semester',
    noun: 'Cohort' as const,
    create: 'Create cohort',
    search: 'Search by cohort, name, or major...',
    plural: 'cohorts',
  },
  curriculum: {
    title: 'Curriculum List',
    subtitle: 'Curriculums define which courses a cohort studies in each semester',
    noun: 'Curriculum' as const,
    create: 'Create curriculum',
    search: 'Search by curriculum code, name, or major...',
    plural: 'curriculums',
  },
};

export default function CurriculumManager({ kind }: { kind: CurriculumKind }) {
  const copy = COPY[kind];
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [majorId, setMajorId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const debounced = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CurriculumItem | null>(null);
  const [deleting, setDeleting] = useState<CurriculumItem | null>(null);

  const params: CurriculumFilterParams = useMemo(
    () => ({
      search: debounced || undefined,
      majorId: majorId || undefined,
      status: (status || undefined) as CurriculumStatus | undefined,
      page,
      size: PAGE_SIZE,
    }),
    [debounced, majorId, status, page],
  );

  const { data, isLoading, isError, refetch } = useCurriculumsQuery(kind, params);
  const majors = useMajorsQuery({ page: 0, size: 100 });
  const { create, update, remove, updateStatus, isCreating, isUpdating, isRemoving } = useCurriculumMutations(kind);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  const select = 'appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-gray-700 focus:border-[#F26F21] focus:outline-none';

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{copy.title}</h1>
          <p className="mt-0.5 text-xs text-gray-500">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e05f14]"
        >
          <Plus className="size-4" /> {copy.create}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder={copy.search}
              aria-label="Search"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-xs focus:border-[#F26F21] focus:outline-none"
            />
          </div>
          <div className="relative">
            <select value={majorId} onChange={(e) => resetPage(setMajorId)(e.target.value)} aria-label="Major filter" className={`${select} w-full md:w-auto`}>
              <option value="">Major: All majors</option>
              {(majors.data?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} aria-label="Status filter" className={`${select} w-full md:w-auto`}>
              <option value="">Status: All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {isLoading && <p className="text-xs text-gray-500">Loading {copy.plural}...</p>}
      {isError && (
        <p className="text-xs text-red-600">
          Could not load {copy.plural}.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </p>
      )}
      {!isLoading && !isError && (
        <div className="space-y-0 overflow-hidden rounded-xl border border-gray-200/80 bg-white">
          <CurriculumTable
            kind={kind}
            data={data?.items ?? []}
            onOpen={(item) => navigate(`/admin/curriculum/${item.id}`)}
            onEdit={(item) => {
              setEditing(item);
              setFormOpen(true);
            }}
            onToggleStatus={(item) => updateStatus({ id: item.id, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }).catch(() => undefined)}
            onDelete={setDeleting}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={data?.totalElements ?? 0} noun={copy.plural} onChange={setPage} />
        </div>
      )}

      <CurriculumFormModal
        open={formOpen}
        noun={copy.noun}
        initial={editing}
        isSubmitting={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (body) => {
          if (editing) await update({ id: editing.id, body });
          else await create(body);
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${copy.noun.toLowerCase()}?`}
        message={
          deleting
            ? `Delete ${deleting.majorCode} ${deleting.version} - ${deleting.name}? It cannot be deleted while students, courses or advisor assignments still use it.`
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
            // The reason (409) is shown by the global handler.
          }
          setDeleting(null);
        }}
      />
    </div>
  );
}
