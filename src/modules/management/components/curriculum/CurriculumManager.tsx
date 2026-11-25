// src/components/management/curriculum/CurriculumManager.tsx
// List + create / edit / activate / delete, shared by the Cohorts and Curriculum pages.
// Operate-mode redesign: KPI strip, skeleton loading, teaching empty state, rich error state.
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookOpenCheck, CheckCircle2, ChevronDown, CircleAlert, CircleOff, FileSpreadsheet, GraduationCap, Layers, Plus, RotateCcw, Search, SearchX, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';
import { ImportCheckDialog, ExampleSheetButton } from '../ImportCheckDialog';
import { Pagination } from '../Pagination';
import { Modal } from '../../../../shared/components/ui/Modal';
import CurriculumFormModal from './CurriculumFormModal';
import ImportPreviewModal from './ImportPreviewModal';
import CurriculumTable from './CurriculumTable';
import { CURRICULUM_QUERY_KEYS, useCurriculumsQuery, type CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../../academic/hooks/mutations/useCurriculumMutations';
import { useMajorsQuery } from '../../../academic/hooks/queries/useMajorsQuery';
import { curriculumService } from '../../services/curriculum.service';
import { checkCurriculumImport, curriculumExample, type ImportProblem } from '../../utils/importChecks';
import { runCurriculumBulkAction, type CurriculumBulkAction } from '../../utils/curriculumBulk';
import { downloadBlob } from '../../../learning/utils/studyPlanXlsx';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { CurriculumFilterParams, CurriculumImportPreview, CurriculumItem, CurriculumStatus } from '../../../academic/types/curriculum';

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
    title: 'Curriculum',
    subtitle: 'Manage curriculum versions, semester courses, and imports in one place',
    noun: 'Curriculum' as const,
    create: 'Create curriculum',
    search: 'Search by curriculum code, name, or major...',
    plural: 'curriculums',
  },
};

export default function CurriculumManager({ kind }: { kind: CurriculumKind }) {
  const copy = COPY[kind];
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [majorId, setMajorId] = useState('');
  const [status, setStatus] = useState('');
  const [current, setCurrent] = useState('');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkAction, setBulkAction] = useState<CurriculumBulkAction | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [importTargetId, setImportTargetId] = useState('');
  const [importChooserOpen, setImportChooserOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<CurriculumImportPreview | null>(null);
  const [importProblems, setImportProblems] = useState<{ fileName: string; problems: ImportProblem[] } | null>(null);
  const debounced = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CurriculumItem | null>(null);
  const [deleting, setDeleting] = useState<CurriculumItem | null>(null);

  const params: CurriculumFilterParams = useMemo(
    () => ({
      search: debounced || undefined,
      majorId: majorId || undefined,
      status: (status || undefined) as CurriculumStatus | undefined,
      isCurrent: current === '' ? undefined : current === 'true',
      page,
      size: PAGE_SIZE,
    }),
    [debounced, majorId, status, current, page],
  );

  const { data, isLoading, isError, refetch, isFetching } = useCurriculumsQuery(kind, params);
  const majors = useMajorsQuery({ page: 0, size: 100 });
  const { create, update, remove, updateStatus, previewImport, confirmImport, isCreating, isUpdating, isRemoving, isPreviewingImport, isConfirmingImport } = useCurriculumMutations(kind);

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
    setSelectedIds(new Set());
  };

  const hasFilters = search.trim() !== '' || majorId !== '' || status !== '' || current !== '';
  const clearFilters = () => {
    setSearch('');
    setMajorId('');
    setStatus('');
    setCurrent('');
    setPage(0);
    setSelectedIds(new Set());
  };

  const items = data?.items ?? [];
  const selectedItems = items.filter((item) => selectedIds.has(item.id));
  const selectOne = (id: string, selected: boolean) => setSelectedIds((previous) => {
    const next = new Set(previous);
    if (selected) next.add(id); else next.delete(id);
    return next;
  });
  const selectPage = (selected: boolean) => setSelectedIds(selected ? new Set(items.map((item) => item.id)) : new Set());
  const changePage = (next: number) => { setSelectedIds(new Set()); setPage(next); };
  const downloadExample = () => downloadBlob(curriculumExample(), 'curriculum-import-example.xlsx');
  const handleImportFile = async (file: File | undefined) => {
    if (!file || !importTargetId) return;
    const check = await checkCurriculumImport(file);
    if (check.problems.length > 0) {
      setImportProblems({ fileName: file.name, problems: check.problems });
      return;
    }
    setImportFile(file);
    setImportPreview(null);
    setImportChooserOpen(false);
    try {
      setImportPreview(await previewImport({ id: importTargetId, file }));
    } catch {
      setImportFile(null);
    }
  };
  const handleConfirmImport = async () => {
    if (!importPreview || !importTargetId) return;
    try {
      await confirmImport({ id: importTargetId, preview: importPreview });
      setImportPreview(null);
      setImportFile(null);
    } catch {
      // The mutation reports the API error; keep the preview open for correction.
    }
  };
  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;
    setBulkSaving(true);
    const result = await runCurriculumBulkAction(selectedItems, bulkAction, curriculumService);
    await queryClient.invalidateQueries({ queryKey: CURRICULUM_QUERY_KEYS.all });
    setSelectedIds(new Set(result.failed.map((item) => item.id)));
    setBulkSaving(false);
    setBulkAction(null);
    if (result.succeeded.length) toast.success(`${result.succeeded.length} curriculum${result.succeeded.length === 1 ? '' : 's'} updated`);
    if (result.failed.length) toast.error(`${result.failed.length} curriculum${result.failed.length === 1 ? '' : 's'} could not be changed. They remain selected for retry.`);
  };
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
        <div className="flex flex-wrap items-center gap-2">
        {kind === 'curriculum' && (
          <button type="button" disabled={items.length === 0} onClick={() => { setImportTargetId(selectedItems.length === 1 ? selectedItems[0].id : items[0]?.id ?? ''); setImportChooserOpen(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-xs font-bold text-[#a43e08] shadow-sm hover:bg-orange-50 disabled:opacity-50">
            <FileSpreadsheet className="size-4" /> Import Excel
          </button>
        )}
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
            {kind === 'curriculum' && <div className="relative">
              <select value={current} onChange={(e) => resetPage(setCurrent)(e.target.value)} aria-label="Current version filter" className={`${select} w-full sm:w-48`}>
                <option value="">Version: All</option>
                <option value="true">Current only</option>
                <option value="false">Previous only</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>}
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

      {kind === 'curriculum' && selectedItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-[#713f12]" role="toolbar" aria-label="Curriculum bulk actions">
          <span className="mr-auto">{selectedItems.length} selected on this page</span>
          <button type="button" onClick={() => setBulkAction('ACTIVE')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white hover:bg-emerald-700"><CheckCircle2 className="size-3.5" /> Set active</button>
          <button type="button" onClick={() => setBulkAction('INACTIVE')} className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 font-bold text-white hover:bg-gray-800"><CircleOff className="size-3.5" /> Set inactive</button>
          <button type="button" onClick={() => setBulkAction('DELETE')} className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 font-bold text-white hover:bg-red-800"><Trash2 className="size-3.5" /> Delete selected</button>
          <button type="button" onClick={() => setSelectedIds(new Set())} className="rounded-lg px-2 py-2 text-gray-600 hover:bg-white">Clear</button>
        </div>
      )}

      {/* List card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-white to-orange-50/40 px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">{kind === 'curriculum' ? 'Curriculum catalog' : 'Cohort catalog'}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{data?.totalElements ?? 0} records{kind === 'curriculum' ? ' · select rows on this page for bulk actions' : ''}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600">Page {page + 1} / {Math.max(1, data?.totalPages ?? 1)}</span>
        </div>
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
                The list failed to load. Check your connection, then try again — your filters are kept.
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
                selectedIds={kind === 'curriculum' ? selectedIds : undefined}
                onSelect={kind === 'curriculum' ? selectOne : undefined}
                onSelectPage={kind === 'curriculum' ? selectPage : undefined}
              />
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data?.totalElements ?? 0} noun={copy.plural} onChange={changePage} />
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

      <ConfirmDialog
        open={!!bulkAction}
        title={bulkAction === 'DELETE' ? 'Delete selected curriculums?' : `Set selected curriculums ${bulkAction === 'ACTIVE' ? 'active' : 'inactive'}?`}
        message={`${selectedItems.length} selected curriculum${selectedItems.length === 1 ? '' : 's'} will be ${bulkAction === 'DELETE' ? 'deleted if no students or courses use them' : bulkAction === 'ACTIVE' ? 'activated' : 'deactivated'}. Each record is processed separately; failures remain selected.`}
        confirmLabel={bulkAction === 'DELETE' ? 'Delete selected' : 'Apply to selected'}
        destructive={bulkAction === 'DELETE'}
        isLoading={bulkSaving}
        onCancel={() => setBulkAction(null)}
        onConfirm={() => void handleBulkAction()}
      />

      <Modal open={importChooserOpen} onClose={() => setImportChooserOpen(false)} title="Import curriculum from Excel" className="max-w-lg">
        <div className="space-y-4 p-6">
          <div><h2 className="text-lg font-bold text-gray-900">Import courses into a curriculum</h2><p className="mt-1 text-sm text-gray-600">Choose a curriculum on this page. The Excel file maps course codes to semesters; the system checks every row before import.</p></div>
          <label className="block text-sm font-semibold text-gray-800">Target curriculum
            <select value={importTargetId} onChange={(event) => setImportTargetId(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm">
              {items.map((item) => <option key={item.id} value={item.id}>{item.majorCode}_{item.version} · {item.name}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <ExampleSheetButton examples={[{ label: 'Example sheet', download: downloadExample }]} />
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#dc6018]">
              <FileSpreadsheet className="size-4" /> Choose Excel file
              <input type="file" accept=".xlsx,.xls" className="sr-only" disabled={!importTargetId || isPreviewingImport} onChange={(event) => { void handleImportFile(event.target.files?.[0]); event.target.value = ''; }} />
            </label>
            {isPreviewingImport && <span className="text-xs text-gray-500">Checking file…</span>}
          </div>
          <p className="text-xs text-gray-500">For a new curriculum, create it first, then import its course list.</p>
        </div>
      </Modal>
      <ImportPreviewModal open={!!importFile} fileName={importFile?.name ?? ''} preview={importPreview} isConfirming={isConfirmingImport}
        onClose={() => { setImportFile(null); setImportPreview(null); }} onConfirm={() => void handleConfirmImport()} />
      <ImportCheckDialog open={!!importProblems} fileName={importProblems?.fileName ?? ''} problems={importProblems?.problems ?? []}
        examples={[{ label: 'Example sheet', download: downloadExample }]} onClose={() => setImportProblems(null)} />

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
      <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Loading curriculums…</p>
    </div>
  );
}
