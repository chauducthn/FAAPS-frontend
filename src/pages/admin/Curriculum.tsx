// src/pages/admin/Curriculum.tsx
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  CurriculumList,
  CurriculumFilterBar,
  CurriculumFormModal,
} from '../../components/admin/curriculum';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useCurriculumsQuery } from '../../hooks/queries/useCurriculumsQuery';
import { useCurriculumMutations } from '../../hooks/mutations/useCurriculumMutations';
import { useDebounce } from '../../hooks/useDebounce';
import type {
  CurriculumSummary,
  CurriculumFilterParams,
  CurriculumBulkAction,
} from '../../types/curriculum';
import type { CreateCurriculumFormValues } from '../../validations/curriculum.schema';

// In a real impl these come from BE; expose them as props for the form modal.
const FAKE_MAJORS = [
  { id: '11111111-1111-1111-1111-111111111111', code: 'SE', name: 'Software Engineering' },
  { id: '22222222-2222-2222-2222-222222222222', code: 'AI', name: 'Artificial Intelligence' },
];
const FAKE_SEMESTERS = [
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', code: 'SP2026', name: 'Spring 2026' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', code: 'SU2026', name: 'Summer 2026' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', code: 'FA2026', name: 'Fall 2026' },
];

export default function CurriculumPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [isCurrent, setIsCurrent] = useState('ALL');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CurriculumSummary | null>(null);
  const [deleting, setDeleting] = useState<CurriculumSummary | null>(null);

  const params: CurriculumFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status === 'ALL' ? undefined : (status as 'DRAFT' | 'ACTIVE' | 'ARCHIVED'),
      isCurrent: isCurrent === 'ALL' ? undefined : isCurrent === 'true',
      page,
      size: 20,
    }),
    [debouncedSearch, status, isCurrent, page],
  );

  const { data, isLoading, isError } = useCurriculumsQuery(params);
  const {
    create,
    isCreating,
    update,
    isUpdating,
    publish,
    isPublishing,
    archive,
    isArchiving,
    remove,
    isRemoving,
    bulk,
    isBulk,
  } = useCurriculumMutations();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  const runBulk = async (action: CurriculumBulkAction) => {
    if (selectedIds.length === 0) return;
    await bulk({ curriculumIds: selectedIds, action });
    setSelectedIds([]);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Curriculum</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Build and publish academic curricula per major and cohort
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => runBulk('PUBLISH')}
                disabled={isBulk}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Publish ({selectedIds.length})
              </button>
              <button
                onClick={() => runBulk('ARCHIVE')}
                disabled={isBulk}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Archive ({selectedIds.length})
              </button>
              <button
                onClick={() => runBulk('DELETE')}
                disabled={isBulk}
                className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50"
              >
                Delete ({selectedIds.length})
              </button>
            </>
          )}
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg shadow-xs"
          >
            <Plus className="size-4" /> Create Curriculum
          </button>
        </div>
      </div>

      <CurriculumFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        isCurrent={isCurrent}
        onIsCurrentChange={setIsCurrent}
      />

      {isLoading && <p className="text-xs text-gray-500">Loading curricula...</p>}
      {isError && (
        <p className="text-xs text-red-600">
          Could not load curricula. Please try again.
        </p>
      )}
      {!isLoading && !isError && (
        <CurriculumList
          data={items}
          selectedIds={selectedIds}
          onSelectAll={(c) => setSelectedIds(c ? items.map((i) => i.id) : [])}
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
          onPublish={async (c) => {
            await publish(c.id);
          }}
          onArchive={async (c) => {
            await archive(c.id);
          }}
          onOpenDetail={(c) => toast.info(`Detail page coming soon for ${c.name}`)}
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

      <CurriculumFormModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        majors={FAKE_MAJORS}
        semesters={FAKE_SEMESTERS}
        isLoading={isCreating || isUpdating || isPublishing || isArchiving}
        onClose={() => setModalOpen(false)}
        onSubmit={async (values: CreateCurriculumFormValues) => {
          if (editing) {
            await update({ id: editing.id, body: values });
          } else {
            await create(values);
          }
          setModalOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete curriculum?"
        message={
          deleting
            ? `Delete ${deleting.name}? This will detach every course in it.`
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