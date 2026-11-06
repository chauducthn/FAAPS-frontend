// src/components/management/curriculum/CurriculumManager.tsx
// List + create / edit / activate / delete, shared by the Cohorts and Curriculum pages.
// Operate-mode redesign: KPI strip, skeleton loading, teaching empty state, rich error state.
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { BookOpenCheck, ChevronDown, CircleAlert, GraduationCap, Layers, Plus, RotateCcw, Search, SearchX } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';
import { Pagination } from '../Pagination';
import CurriculumFormModal from './CurriculumFormModal';
import CurriculumTable from './CurriculumTable';
import { useCurriculumsQuery, type CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../../academic/hooks/mutations/useCurriculumMutations';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { CurriculumFilterParams, CurriculumItem, CurriculumStatus } from '../../../academic/types/curriculum';

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

  const { data, isLoading, isError, refetch, isFetching } = useCurriculumsQuery(kind, params);
  const majors = useMajorsQuery({ page: 0, size: 100 });
  const { create, update, remove, updateStatus, isCreating, isUpdating, isRemoving } = useCurriculumMutations(kind);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  const hasFilters = search.trim() !== '' || majorId !== '' || status !== '';
  const clearFilters = () => {
    setSearch('');
    setMajorId('');
    setStatus('');
    setPage(0);
  };

  const items = data?.items ?? [];
  const activeOnPage = items.filter((i) => i.status === 'ACTIVE').length;
  const creditsOnPage = items.reduce((sum, i) => sum + i.totalCredits, 0);

  const select =
    'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
            <GraduationCap className="size-5.5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">{copy.title}</h1>
            <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">{copy.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
        >
          <Plus className="size-4" strokeWidth={2.5} /> {copy.create}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi
          icon={<Layers className="size-4" />}
          label={`Total ${copy.plural}`}
          value={String(data?.totalElements ?? '—')}
          hint={isFetching ? 'Refreshing…' : `Page ${page + 1} of ${Math.max(1, data?.totalPages ?? 1)}`}
        />
        <Kpi
          icon={<BookOpenCheck className="size-4" />}
          label="Active on this page"
          value={String(activeOnPage)}
          hint={`${items.length} shown`}
          tone="green"
        />
        <Kpi
          icon={<GraduationCap className="size-4" />}
          label="Credits on this page"
          value={String(creditsOnPage)}
          hint="Sum of totalCredits"
          tone="orange"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => resetPage(setSearch)(e.target.value)}
              placeholder={copy.search}
              aria-label="Search"
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
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <select value={majorId} onChange={(e) => resetPage(setMajorId)(e.target.value)} aria-label="Major filter" className={`${select} w-full sm:w-52`}>
                <option value="">Major: All majors</option>
                {(majors.data?.items ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} aria-label="Status filter" className={`${select} w-full sm:w-44`}>
                <option value="">Status: All</option>
                <option value="ACTIVE">● Active</option>
                <option value="INACTIVE">○ Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
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
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load {copy.plural}</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The list failed to load. Check your connection or mock flag, then try again — your filters are kept.
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
              <SearchX className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {hasFilters ? `No ${copy.plural} match your filters` : `No ${copy.plural} yet`}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
                {hasFilters
                  ? 'Try a different keyword, or clear the major / status filters to see the full list.'
                  : `Create the first ${copy.noun.toLowerCase()} to start building the academic roadmap — it takes less than a minute.`}
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
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e05f14]"
              >
                <Plus className="size-3.5" strokeWidth={2.5} /> {copy.create}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {isFetching && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                  <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
                </div>
              )}
              <CurriculumTable
                kind={kind}
                data={items}
                onOpen={(item) => navigate(`/admin/curriculum/${item.id}`)}
                onEdit={(item) => {
                  setEditing(item);
                  setFormOpen(true);
                }}
                onToggleStatus={(item) =>
                  updateStatus({ id: item.id, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }).catch(() => undefined)
                }
                onDelete={setDeleting}
              />
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data?.totalElements ?? 0} noun={copy.plural} onChange={setPage} />
          </>
        )}
      </div>

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
            ? `Delete ${deleting.majorCode} ${deleting.version} — ${deleting.name}? It cannot be deleted while students, courses or advisor assignments still use it.`
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

      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}

function Kpi({ icon, label, value, hint, tone = 'gray' }: { icon: ReactNode; label: string; value: string; hint: string; tone?: 'gray' | 'green' | 'orange' }) {
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

function ListSkeleton() {
  return (
    <div className="p-4" aria-label="Loading">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="hidden h-4 w-32 animate-pulse rounded bg-gray-100 sm:block" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-6 w-16 animate-pulse rounded-full bg-orange-100/70" style={{ animationDelay: `${i * 60}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Loading curriculums… (mock delay 500ms)</p>
    </div>
  );
}
