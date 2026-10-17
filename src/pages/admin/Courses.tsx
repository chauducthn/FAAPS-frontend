// src/pages/admin/Courses.tsx
import { useMemo, useState } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import {
  CourseTable,
  CourseFormModal,
  CourseDetailModal,
} from '../../components/admin/courses';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import {
  useCoursesQuery,
  useCourse,
  useCourseCategoriesQuery,
} from '../../hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../hooks/mutations/useCourseMutations';
import { useDebounce } from '../../hooks/useDebounce';
import type {
  CourseDetail,
  CourseSummary,
  CourseFilterParams,
} from '../../types/course';
import type { CreateCourseFormValues } from '../../validations/course.schema';

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
  const [viewingId, setViewingId] = useState<string | null>(null);

  const params: CourseFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : (status as 'ACTIVE' | 'INACTIVE'),
      categoryId: categoryId === 'ALL' ? undefined : categoryId,
      page,
      size: 20,
    }),
    [debouncedSearch, status, categoryId, page],
  );

  const { data, isLoading, isError } = useCoursesQuery(params);
  const categoriesQuery = useCourseCategoriesQuery();
  const viewingQuery = useCourse(viewingId);

  const {
    create,
    isCreating,
    update,
    isUpdating,
    remove,
    isRemoving,
    addRelation,
    isAddingRelation,
    removeRelation,
    isRemovingRelation,
  } = useCourseMutations();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const categories = categoriesQuery.data ?? [];

  // For the picker dropdown in CourseDetailModal
  const allCoursesQuery = useCoursesQuery({ size: 200 });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Courses</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Master catalogue of all courses the system knows about
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs"
        >
          <Plus className="size-4" /> Create Course
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#F26F21]"
            />
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              onChange={(e) => setCategoryId(e.target.value)}
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
          onDelete={(c) => setDeleting(c)}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2.5 py-1 hover:text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 hover:text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CourseFormModal
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        categories={categories}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormOpen(false)}
        onSubmit={async (values: CreateCourseFormValues) => {
          if (editing) {
            await update({ id: editing.id, body: values });
          } else {
            await create(values);
          }
          setFormOpen(false);
        }}
      />

      <CourseDetailModal
        open={!!viewingId}
        course={(viewingQuery.data as CourseDetail | undefined) ?? null}
        availableCourses={(allCoursesQuery.data?.items ?? []).map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        }))}
        isSubmitting={isAddingRelation || isRemovingRelation}
        onClose={() => setViewingId(null)}
        onAddRelation={(rel) =>
          viewingId &&
          addRelation({ courseId: viewingId, body: rel })
        }
        onRemoveRelation={(relationId) =>
          viewingId &&
          removeRelation({ courseId: viewingId, relationId })
        }
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
          await remove(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}