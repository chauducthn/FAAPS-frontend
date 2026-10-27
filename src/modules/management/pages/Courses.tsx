// src/pages/management/Courses.tsx
import { useMemo, useState } from 'react';
import { Plus, Search, ChevronDown, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { courseService } from '../services/course.service';
import {
  CourseTable,
  CourseFormModal,
  CourseDetailModal,
} from '../components/courses';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';
import {
  useCoursesQuery,
  useCourse,
  useCourseCategoriesQuery,
} from '../../academic/hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../academic/hooks/mutations/useCourseMutations';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type {
  CourseDetail,
  CourseSummary,
  CourseFilterParams,
  CourseImportPreview,
} from '../../academic/types/course';

const PAGE_SIZE = 10;
import type { CreateCourseFormValues } from '../../academic/validations/course.schema';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [categoryId, setCategoryId] = useState('ALL');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourseSummary | null>(null);
  const [deleting, setDeleting] = useState<CourseSummary | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<CourseImportPreview | null>(null);

  const params: CourseFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : (status as 'ACTIVE' | 'INACTIVE'),
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
      page,
      size: PAGE_SIZE,
    }),
    [debouncedSearch, status, categoryId, page],
  );

  const { data, isLoading, isError } = useCoursesQuery(params);
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

  const items = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;
  const categories = categoriesQuery.data ?? [];

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

      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
                setSelectedIds([]);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#F26F21]"
            />
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
                setSelectedIds([]);
              }}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(0);
                setSelectedIds([]);
              }}
              className="appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium"
            >
              <option value="ALL">Category: All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs">
          <span className="font-semibold text-gray-800">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSelectedIds([])} className="rounded-lg px-3 py-1.5 font-semibold text-gray-600 hover:bg-white">
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const blocked = items.filter((c) => selectedIds.includes(c.id) && c.usedInCurriculumCount > 0);
                if (blocked.length > 0) {
                  toast.error(`Cannot delete ${blocked.map((c) => c.code).join(', ')}: still used in a curriculum. Unselect them first.`);
                  return;
                }
                setBulkDeleting(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700"
            >
              <Trash2 className="size-3.5" /> Delete selected
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-xs text-gray-500">Loading courses...</p>}
      {isError && (
        <p className="text-xs text-red-600">Could not load courses.</p>
      )}
      {!isLoading && !isError && (
        <CourseTable
          data={items}
          selectedIds={selectedIds}
          onSelectAll={(c) => setSelectedIds(c ? items.map((i) => i.id) : [])}
          onSelectRow={(id) =>
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onView={(c) => setViewingId(c.id)}
          onEdit={(c) => {
            setEditing(c);
            setFormOpen(true);
          }}
          onDelete={(c) => {
            // The backend answers 500 for a course that is still in a curriculum, so say why before asking.
            if (c.usedInCurriculumCount > 0) {
              toast.error(`${c.code} is used in ${c.usedInCurriculumCount} curriculum${c.usedInCurriculumCount === 1 ? '' : 's'}. Remove it from them first.`);
              return;
            }
            setDeleting(c);
          }}
        />
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white">
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={totalItems}
            noun="courses"
            onChange={(p) => {
              setPage(p);
              setSelectedIds([]);
            }}
          />
        </div>
      )}

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
        message={`Delete ${selectedIds.length} selected course${selectedIds.length === 1 ? '' : 's'}? Courses used in a curriculum or required by another course cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isLoading={isBulkRemoving}
        onCancel={() => setBulkDeleting(false)}
        onConfirm={async () => {
          try {
            await bulkRemove(selectedIds);
            setSelectedIds([]);
          } catch {
            // toast shown by the error handler
          }
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
