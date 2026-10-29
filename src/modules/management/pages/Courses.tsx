// src/pages/management/Courses.tsx
import { useMemo, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { courseService } from '../services/course.service';
import {
  CourseFormModal,
  CourseDetailModal,
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

const PAGE_SIZE = 10;
import type { CreateCourseFormValues } from '../../academic/validations/course.schema';

/** Credit values offered by the "Credits" filter (FE-03). */
const CREDIT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const selectClass =
  'h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500';

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
  const [importPreview, setImportPreview] = useState<CourseImportPreview | null>(null);

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

  const { data, isLoading, isError, refetch } = useCoursesQuery(params);
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
   * The backend `/api/admin/courses` endpoint does not expose a `credits`
   * query parameter yet, so the filter is applied to the rows that were
   * loaded as well. Once the backend supports it, the client-side pass
   * becomes a no-op because the API already returns matching rows only.
   */
  const visibleItems = useMemo(
    () => (credits === 'ALL' ? items : items.filter((c) => c.credits === credits)),
    [items, credits],
  );

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

  const columns = useMemo<DataTableColumnDef<CourseSummary>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-semibold text-[#151c27]">{row.original.code}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Course Name',
        // The backend whitelist has no `name` sort, so the column is not sortable.
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setViewingId(row.original.id)}
            className="text-left font-medium text-[#151c27] hover:underline"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: 'credits',
        header: 'Credits',
        cell: ({ row }) => <span className="font-medium">{row.original.credits}</span>,
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Courses</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Master catalogue of all courses the system knows about
          </p>
        </div>
        <div className="flex gap-2"><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold">
          <Upload className="size-4" /> Import XLSX
          <input type="file" accept=".xlsx" className="hidden" disabled={importing} onChange={async (event) => {
            const file = event.target.files?.[0]; if (!file) return; setImporting(true);
            try { const preview = await courseService.previewImport(file); setImportPreview(preview);
              if (preview.errorRows) toast.error(`${preview.errorRows} invalid row(s). Download the error report, fix the spreadsheet and retry.`);
              else { const count = await courseService.confirmImport(preview.items); toast.success(`Imported ${count} course(s)`); window.location.reload(); }
            } finally { setImporting(false); event.target.value = ''; }
          }} />
        </label><button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs"
        >
          <Plus className="size-4" /> Create Course
        </button></div>
      </div>

      {importPreview?.errorRows ? <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
        <span><strong>{importPreview.errorRows}</strong> invalid row(s) found in the course spreadsheet.</span>
        <button type="button" className="font-semibold text-red-700 underline" onClick={async () => {
          try {
            const blob = await courseService.downloadImportErrors(importPreview.items);
            download(blob, 'course-import-errors.xlsx');
          } catch { toast.error('Unable to download the course error report.'); }
        }}>Download error report</button>
      </div> : null}

      {isError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load courses.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <DataTable
          manual
          columns={columns}
          data={visibleItems}
          searchKey="name"
          searchValue={search}
          searchPlaceholder="Search by code or name..."
          emptyText={hasFilters ? 'No courses match your filters.' : 'No courses yet.'}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          totalRowCount={credits === 'ALL' ? totalItems : visibleItems.length}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          onSearchChange={resetPage(setSearch)}
          filters={
            <>
              <select
                value={status}
                onChange={(e) =>
                  resetPage(setStatus)(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                }
                aria-label="Filter by status"
                className={selectClass}
              >
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Status: Active</option>
                <option value="INACTIVE">Status: Inactive</option>
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
                onChange={(e) =>
                  resetPage(setCredits)(
                    e.target.value === 'ALL' ? 'ALL' : Number(e.target.value),
                  )
                }
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

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
              >
                Clear filters
              </button>
            </>
          }
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
      </section>

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
        isSubmitting={isAddingRelation || isRemovingRelation || isUpdatingRelation}
        onClose={() => setViewingId(null)}
        onAddRelation={(rel) => addRelation({ courseId: viewingId as string, body: rel })}
        onUpdateRelation={(relationId, body) => updateRelation({ courseId: viewingId as string, relationId, body })}
        onRemoveRelation={(relationId) => removeRelation({ courseId: viewingId as string, relationId })}
      />

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
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}
