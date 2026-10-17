// src/pages/admin/Cohorts.tsx
import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CohortTable, CohortFilterBar, CohortFormModal } from '../../components/admin/cohorts';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useCohortsQuery } from '../../hooks/queries/useCohortsQuery';
import { useCohortMutations } from '../../hooks/mutations/useCohortMutations';
import { useDebounce } from '../../hooks/useDebounce';
import type { Cohort, CohortFilterParams } from '../../types/cohort';
import type { CreateCohortFormValues } from '../../validations/cohort.schema';
import type { UpdateCohortFormValues } from '../../validations/cohort.schema';

export default function CohortsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cohort | null>(null);
  const [deleting, setDeleting] = useState<Cohort | null>(null);

  const params: CohortFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : (status as 'ACTIVE' | 'INACTIVE'),
      page,
      size: 20,
    }),
    [debouncedSearch, status, page],
  );

  const { data, isLoading, isError } = useCohortsQuery(params);
  const {
    create,
    isCreating,
    update,
    isUpdating,
    remove,
    isRemoving,
  } = useCohortMutations();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cohorts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage student cohorts and the majors available to each one
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs"
        >
          <Plus className="size-4" /> Create Cohort
        </button>
      </div>

      <CohortFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {isLoading && <p className="text-xs text-gray-500">Loading cohorts...</p>}
      {isError && (
        <p className="text-xs text-red-600">
          Could not load cohorts. Check the backend connection and try again.
        </p>
      )}
      {!isLoading && !isError && (
        <CohortTable
          data={items}
          selectedIds={selectedIds}
          onSelectAll={(checked) =>
            setSelectedIds(checked ? items.map((i) => i.id) : [])
          }
          onSelectRow={(id) =>
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onEdit={(c) => {
            setEditing(c);
            setModalOpen(true);
          }}
          onDelete={(c) => setDeleting(c)}
          onOpenDetail={() => {
            /* detail page is not implemented yet */
          }}
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
              className="px-2.5 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CohortFormModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        isLoading={isCreating || isUpdating}
        onClose={() => setModalOpen(false)}
        onCreate={async (values: CreateCohortFormValues) => {
          await create(values);
          setModalOpen(false);
        }}
        onUpdate={async (values: UpdateCohortFormValues) => {
          if (!editing) return;
          await update({ id: editing.id, body: values });
          setModalOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete cohort?"
        message={
          deleting
            ? `Delete ${deleting.code} - ${deleting.name}? This cannot be undone.`
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

      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-3">
          <span>{selectedIds.length} selected</span>
          <button
            onClick={() => setSelectedIds([])}
            className="text-gray-500 hover:text-gray-900"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}