// src/pages/management/Courses.tsx
// Master catalogue — Operate-mode redesign synced with the Curriculum ecosystem:
// gradient header, KPI strip, skeleton / error / empty states, orange focus.
import { useMemo, useState } from 'react';
import {
  BookOpenCheck,
  CircleAlert,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { courseService } from '../services/course.service';
import {
  CourseFormModal,
  CourseDetailModal,
  CourseImportPreviewModal,
} from '../components/courses';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { RowActionMenu } from '../components/RowActionMenu';
import {
  useCoursesQuery,
  useCourse,
  useCourseCategoriesQuery,
} from '../../academic/hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../academic/hooks/mutations/useCourseMutations';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type {
  CourseDetail,
  CourseSummary,
  CourseFilterParams,
  CourseImportPreview,
} from '../../academic/types/course';
import type { CreateCourseFormValues } from '../../academic/validations/course.schema';

const PAGE_SIZE = 10;

/** Credit values offered by the "Credits" filter (FE-03). */
const CREDIT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

/**
 * The backend sorts courses by a whitelist; the table only offers the ones it
 * can serve (code and credits). Anything else falls back to `code,asc`.
 */
function toCourseSort(sorting: SortingState): NonNullable<CourseFilterParams['sort']> {
  const active = sorting[0];
  if (!active) return 'code,asc';
  const dir = active.desc ? 'desc' : 'asc';
  if (active.id === 'credits') return `credits,${dir}` as NonNullable<CourseFilterParams['sort']>;
  if (active.id === 'code') return `code,${dir}` as NonNullable<CourseFilterParams['sort']>;
  return 'code,asc';
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [credits, setCredits] = useState<number | 'ALL'>('ALL');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourseSummary | null>(null);
  const [deleting, setDeleting] = useState<CourseSummary | null>(null);
  // The rows the bulk-delete confirmation applies to; filled by the DataTable
  // bulk-action bar.
  const [bulkTargets, setBulkTargets] = useState<CourseSummary[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState('spreadsheet.xlsx');
  const [importPreview, setImportPreview] = useState<CourseImportPreview | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const params: CourseFilterParams = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'ALL' ? undefined : status,
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
      credits: credits === 'ALL' ? undefined : credits,
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: toCourseSort(sorting),
    }),
    [search, status, categoryId, credits, pagination.pageIndex, pagination.pageSize, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useCoursesQuery(params);
  const categoriesQuery = useCourseCategoriesQuery();
  const viewingQuery = useCourse(viewingId);
  const editingQuery = useCourse(formOpen && editing ? editing.id : null);

  const {
    create,
    isCreating,
    update,
    isUpdating,
    remove,
    isRemoving,
    bulkRemove,
    isBulkRemoving,
    updateRelation,
    addRelation,
    isAddingRelation,
    isUpdatingRelation,
    removeRelation,
    isRemovingRelation,
  } = useCourseMutations();

  const items = useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.totalItems ?? 0;
  const categories = categoriesQuery.data ?? [];

  /**
   * The mock + backend filter by `credits` server-side, but the unit-test
   * double (and older backends) return unfiltered rows — so keep a
   * client-side pass as a safety net. When the API already filters it is a no-op.
   */
  const visibleItems = useMemo(
    () => (credits === 'ALL' ? items : items.filter((c) => c.credits === credits)),
    [items, credits],
  );
  const totalRowCount = credits === 'ALL' ? totalItems : visibleItems.length;

  /** Any change of the query must start again on the first page. */
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const hasFilters = search !== '' || status !== 'ALL' || categoryId !== 'ALL' || credits !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setCategoryId('ALL');
    setCredits('ALL');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const activeOnPage = visibleItems.filter((c) => c.status === 'ACTIVE').length;
  const creditsOnPage = visibleItems.reduce((sum, c) => sum + c.credits, 0);

  // ---- Import XLSX (preview → confirm) ----
  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    setImportFileName(file.name);
    setImportPreview(null);
    setImportOpen(true);
    setImporting(true);
    try {
      const preview = await courseService.previewImport(file);
      setImportPreview(preview);
      if (preview.errorRows > 0) {
        toast.warning(`${preview.errorRows} invalid row(s) found`, {
          description: 'Review them in the preview — valid rows can still be imported.',
        });
      }
    } catch {
      // Error toast comes from the global handler; keep the modal closed on hard failure.
      setImportOpen(false);
      setImportPreview(null);
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      const count = await courseService.confirmImport(importPreview.items);
      toast.success(`Imported ${count} course(s)`);
      setImportOpen(false);
      setImportPreview(null);
      await refetch();
    } catch {
      // toast shown by the global handler; keep the modal open to retry.
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadErrors = async () => {
    if (!importPreview) return;
    try {
      const blob = await courseService.downloadImportErrors(importPreview.items);
      download(blob, 'course-import-errors.csv');
    } catch {
      toast.error('Unable to download the course error report.');
    }
  };

  const columns = useMemo<DataTableColumnDef<CourseSummary>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Course Name',
        // The backend whitelist has no `name` sort, so the column is not sortable.
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setViewingId(row.original.id)}
              title={`View detail of ${row.original.code}`}
              className="block max-w-[280px] truncate text-left font-semibold text-gray-900 transition-colors hover:text-[#C2410C] hover:underline"
            >
              {row.original.name}
            </button>
            <p className="mt-0.5 truncate text-[11px] font-medium text-gray-400">
              {row.original.categoryCode} | {row.original.categoryName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'credits',
        header: 'Credits',
        cell: ({ row }) => (
          <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-orange-50 px-2 py-0.5 font-mono text-[12px] font-bold tabular-nums text-[#9a3412] ring-1 ring-orange-200">
            {row.original.credits}
          </span>
        ),
      },
      {
        accessorKey: 'prerequisiteCount',
        header: 'Prereq',
        enableSorting: false,
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-[12px] font-bold tabular-nums text-gray-800">
            {row.original.prerequisiteCount}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex justify-end">
              <RowActionMenu
                label={`Actions for ${course.code}`}
                actions={[
                  { label: 'View detail', onSelect: () => setViewingId(course.id) },
                  {
                    label: 'Edit course',
                    onSelect: () => {
                      setEditing(course);
                      setFormOpen(true);
                    },
                  },
                  {
                    label: 'Delete course',
                    danger: true,
                    onSelect: () => {
                      // The backend answers 500 for a course that is still in a
                      // curriculum, so say why before asking for a confirmation.
                      if (course.usedInCurriculumCount > 0) {
                        toast.error(
                          `${course.code} is used in ${course.usedInCurriculumCount} curriculum${
                            course.usedInCurriculumCount === 1 ? '' : 's'
                          }. Remove it from them first.`,
                        );
                        return;
                      }
                      setDeleting(course);
                    },
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
            <GraduationCap className="size-5.5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Courses</h1>
            <p className="mt-0.5 max-w-[560px] text-xs leading-relaxed text-gray-500">
              Master catalogue of all courses the system knows about — click a course to see its syllabus and prerequisites
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs transition-all hover:border-orange-300 hover:bg-orange-50/50 hover:text-[#9a3412]"
          >
            {importing && !importOpen ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {importing && !importOpen ? 'Reading…' : 'Import XLSX'}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              disabled={importing}
              onChange={(event) => {
                void handlePickFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(242,111,33,0.4)] transition-all hover:-translate-y-px hover:bg-[#e05f14] hover:shadow-[0_4px_14px_rgba(242,111,33,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/50 active:translate-y-0"
          >
            <Plus className="size-4" strokeWidth={2.5} /> Create Course
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi
          icon={<Layers className="size-4" />}
          label="Total courses"
          value={String(totalItems || '—')}
          hint={isFetching ? 'Refreshing…' : `Page ${pagination.pageIndex + 1} of ${Math.max(1, data?.totalPages ?? 1)}`}
        />
        <Kpi
          icon={<BookOpenCheck className="size-4" />}
          label="Active on this page"
          value={String(activeOnPage)}
          hint={`${visibleItems.length} shown`}
          tone="green"
        />
        <Kpi
          icon={<GraduationCap className="size-4" />}
          label="Credits on this page"
          value={String(creditsOnPage)}
          hint="Sum of credits"
          tone="orange"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <DataTableSearchMirror value={search} onChange={resetPage(setSearch)} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              value={status}
              onChange={(e) => resetPage(setStatus)(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              aria-label="Filter by status"
              className={selectClass}
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">● Active</option>
              <option value="INACTIVE">○ Inactive</option>
            </select>

            <select
              value={categoryId}
              onChange={(e) => resetPage(setCategoryId)(e.target.value)}
              aria-label="Filter by category"
              className={selectClass}
            >
              <option value="ALL">Category: All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>

            {/* FE-03: filter the catalogue by number of credits. */}
            <select
              value={String(credits)}
              onChange={(e) => resetPage(setCredits)(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              aria-label="Filter by credits"
              className={selectClass}
            >
              <option value="ALL">Credits: All</option>
              {CREDIT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  Credits: {value}
                </option>
              ))}
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
        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <CircleAlert className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">Could not load courses</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                The catalogue failed to load. Check your connection or mock flag, then try again — your filters are kept.
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
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#F26F21]">
              <SearchX className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {hasFilters ? 'No courses match your filters' : 'No courses yet'}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-gray-500">
                {hasFilters
                  ? 'Try a different keyword, or clear the category / status filters to see the full catalogue.'
                  : 'Create the first course to start building the catalogue — it takes less than a minute.'}
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
                <Plus className="size-3.5" strokeWidth={2.5} /> Create course
              </button>
            </div>
          </div>
        ) : (
          <div className="relative p-4 sm:p-5">
            {isFetching && (
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-orange-100">
                <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-[#F26F21]" />
              </div>
            )}
            <DataTable
              manual
              columns={columns}
              data={visibleItems}
              searchKey="name"
              searchValue={search}
              searchPlaceholder="Search by code or name..."
              emptyText={hasFilters ? 'No courses match your filters.' : 'No courses yet.'}
              getRowId={(row) => row.id}
              isLoading={false}
              totalRowCount={totalRowCount}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              onSearchChange={resetPage(setSearch)}
              showSearch={false}
              bulkActions={(selectedRows) => (
                <button
                  type="button"
                  onClick={() => {
                    const blocked = selectedRows.filter((c) => c.usedInCurriculumCount > 0);
                    if (blocked.length > 0) {
                      toast.error(
                        `Cannot delete ${blocked
                          .map((c) => c.code)
                          .join(', ')}: still used in a curriculum. Unselect them first.`,
                      );
                      return;
                    }
                    setBulkTargets(selectedRows);
                    setBulkDeleting(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700"
                >
                  <Trash2 className="size-3.5" /> Delete selected
                </button>
              )}
            />
          </div>
        )}
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>

      <CourseFormModal
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing ? (editingQuery.data ?? null) : null}
        isLoadingInitial={!!editing && editingQuery.isLoading}
        categories={categories}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: CreateCourseFormValues) => {
          try {
            if (editing) {
              await update({ id: editing.id, body: values });
            } else {
              await create(values);
            }
            setFormOpen(false);
          } catch {
            // The error toast is shown by the mutation / global handler; keep the form open to correct it.
          }
        }}
      />

      <CourseDetailModal
        open={!!viewingId}
        course={(viewingQuery.data as CourseDetail | undefined) ?? null}
        isLoading={viewingQuery.isLoading}
        isSubmitting={isAddingRelation || isRemovingRelation || isUpdatingRelation}
        onClose={() => setViewingId(null)}
        onNavigate={(id) => setViewingId(id)}
        onAddRelation={(rel) => addRelation({ courseId: viewingId as string, body: rel })}
        onUpdateRelation={(relationId, body) => updateRelation({ courseId: viewingId as string, relationId, body })}
        onRemoveRelation={(relationId) => removeRelation({ courseId: viewingId as string, relationId })}
      />

      <CourseImportPreviewModal
        open={importOpen}
        fileName={importFileName}
        preview={importPreview}
        isConfirming={importing && !!importPreview}
        isReading={importing && !importPreview}
        onClose={() => {
          setImportOpen(false);
          setImportPreview(null);
        }}
        onConfirm={handleConfirmImport}
      />
      {importPreview?.errorRows ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-[11px] font-semibold text-red-600 underline hover:text-red-700"
            onClick={handleDownloadErrors}
          >
            Download error report (CSV)
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!deleting}
        title="Delete course?"
        message={
          deleting
            ? `Delete ${deleting.code} - ${deleting.name}? Courses in curricula must be detached first.`
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
            // toast shown by the error handler (e.g. course is still used in a curriculum)
          }
          setDeleting(null);
        }}
      />

      <ConfirmDialog
        open={bulkDeleting}
        title="Delete selected courses?"
        message={`Delete ${bulkTargets.length} selected course${bulkTargets.length === 1 ? '' : 's'}? Courses used in a curriculum or required by another course cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isLoading={isBulkRemoving}
        onCancel={() => setBulkDeleting(false)}
        onConfirm={async () => {
          try {
            await bulkRemove(bulkTargets.map((c) => c.id));
          } catch {
            // toast shown by the error handler
          }
          setBulkTargets([]);
          setBulkDeleting(false);
        }}
      />
    </div>
  );
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
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

/** Search input rendered in the filter card (mirrors the Curriculum toolbar). */
function DataTableSearchMirror({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by code or name..."
        aria-label="Search by code or name..."
        role="searchbox"
        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="p-4" aria-label="Loading courses">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-4 py-3.5 last:border-0">
            <div className="h-6 w-20 animate-pulse rounded-lg bg-orange-100/70" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="hidden h-4 w-32 animate-pulse rounded bg-gray-100 sm:block" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="h-6 w-16 animate-pulse rounded-full bg-emerald-100/70" style={{ animationDelay: `${i * 60}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-gray-400">Loading courses… (mock delay 500ms)</p>
    </div>
  );
}
