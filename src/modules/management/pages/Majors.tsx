import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CreateMajorDto, Major, MajorStatus } from '../../academic/types/major';
import { majorService } from '../services/major.service';
import { useMajorsQuery, MAJOR_QUERY_KEYS } from '../../academic/hooks/queries/useMajorsQuery';
import MajorTable, { MajorItem } from '@/modules/management/components/majors/MajorTable';
import MajorFilterBar from '@/modules/management/components/majors/MajorFilterBar';
import MajorSelectionBanner from '@/modules/management/components/majors/MajorSelectionBanner';
import CreateMajorModal from '@/modules/management/components/majors/CreateMajorModal';
import { ConfirmDialog } from '@/modules/management/components/ConfirmDialog';

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Please try again.';

export default function MajorsPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMajor, setDeletingMajor] = useState<MajorItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: result, isLoading, isError } = useMajorsQuery({ search: search || undefined, status: selectedStatus as MajorStatus | 'ALL', cohort: selectedCohort, page, size: 20 });
  const data: MajorItem[] = (result?.items ?? []).map((major) => ({ id: major.id, code: major.code, name: major.name, cohort: major.cohort, status: major.status }));

  const refresh = async () => {
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    setIsDeleting(true);
    try {
      const deleted = await majorService.bulkRemove(selectedIds);
      toast.success(`${deleted} major${deleted === 1 ? '' : 's'} deleted.`);
      setIsBulkDeleteOpen(false);
      await refresh();
    } catch (error) {
      toast.error(`Major could not be deleted: ${errorMessage(error)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deletingMajor) return;
    setIsDeleting(true);
    try {
      await majorService.deleteMajor(deletingMajor.id);
      toast.success(`Major ${deletingMajor.code} deleted.`);
      setDeletingMajor(null);
      await refresh();
    } catch (error) {
      toast.error(`Major could not be deleted: ${errorMessage(error)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (formData: CreateMajorDto) => {
    setIsSaving(true);
    try {
      if (editingMajor) await majorService.updateMajor(editingMajor.id, formData);
      else await majorService.createMajor(formData);
      toast.success(editingMajor ? 'Major updated.' : 'Major created.');
      setIsModalOpen(false);
      setEditingMajor(null);
      await refresh();
    } catch (error) {
      toast.error(`Could not save major: ${errorMessage(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (item: MajorItem) => {
    try {
      setEditingMajor(await majorService.getMajorById(item.id));
      setIsModalOpen(true);
    } catch (error) {
      toast.error(`Could not load major: ${errorMessage(error)}`);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Page header — title + primary action */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827] tracking-tight leading-tight">Majors</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage academic majors for each training cohort</p>
        </div>
        <button
          onClick={() => { setEditingMajor(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#F26F21] hover:bg-[#d95e13] active:bg-[#c55310] text-white font-semibold text-[13px] rounded-lg transition-all cursor-pointer shadow-[0_1px_2px_rgba(242,111,33,0.45),0_8px_16px_-6px_rgba(242,111,33,0.35)] hover:shadow-[0_1px_2px_rgba(242,111,33,0.5),0_10px_20px_-6px_rgba(242,111,33,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26F21]/40 focus-visible:ring-offset-2"
        >
          <Plus className="size-4" strokeWidth={2.5} /> Create Major
        </button>
      </div>

      <MajorSelectionBanner selectedCount={selectedIds.length} onCancelSelection={() => setSelectedIds([])} onDeleteSelected={() => setIsBulkDeleteOpen(true)} />

      {/* Main content surface — single white layer, no nested boxes */}
      <section className="bg-white rounded-xl shadow-[0_1px_2px_rgba(16,24,40,0.05),0_8px_24px_-12px_rgba(16,24,40,0.12)] overflow-hidden">
        <MajorFilterBar
          search={search}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          selectedCohort={selectedCohort}
          onCohortChange={(value) => { setSelectedCohort(value); setPage(0); }}
          selectedStatus={selectedStatus}
          onStatusChange={(value) => { setSelectedStatus(value); setPage(0); }}
          onClearContext={() => { setSearch(''); setSelectedCohort('ALL'); setSelectedStatus('ALL'); setPage(0); }}
          resultCount={result?.totalItems}
        />
        {isLoading && (
          <div className="px-6 py-10 space-y-3" aria-label="Loading majors">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}
        {isError && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-semibold text-gray-900">Could not load majors from the server.</p>
            <p className="text-[13px] text-gray-500 mt-1">Check your connection and try again.</p>
            <button onClick={() => refresh()} className="mt-4 px-4 py-2 text-[13px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && !isError && (
          <MajorTable
            data={data}
            selectedIds={selectedIds}
            onSelectAll={(checked) => setSelectedIds(checked ? data.map((item) => item.id) : [])}
            onSelectRow={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
            onEditMajor={handleEdit}
            onDeleteMajor={(item) => setDeletingMajor(item)}
            page={page}
            totalItems={result?.totalItems ?? 0}
            totalPages={result?.totalPages ?? 0}
            onPageChange={(nextPage) => { setPage(nextPage); setSelectedIds([]); }}
          />
        )}
      </section>

      <CreateMajorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMajor(null); }}
        onSubmit={handleSubmit}
        initialData={editingMajor ? { code: editingMajor.code, name: editingMajor.name, description: editingMajor.description, totalCredits: editingMajor.totalCredits, durationYears: editingMajor.durationYears, cohort: editingMajor.cohort, status: editingMajor.status } : undefined}
        isSaving={isSaving}
      />

      {/* Delete a single major */}
      <ConfirmDialog
        open={!!deletingMajor}
        title="Delete major?"
        message={
          deletingMajor
            ? `Delete ${deletingMajor.code} - ${deletingMajor.name}? Majors referenced by a curriculum or cohort cannot be deleted.`
            : ''
        }
        confirmLabel="Delete major"
        destructive
        isLoading={isDeleting}
        onCancel={() => { if (!isDeleting) setDeletingMajor(null); }}
        onConfirm={handleDeleteSingle}
      />

      {/* Delete selected majors */}
      <ConfirmDialog
        open={isBulkDeleteOpen}
        title="Delete selected majors?"
        message={`Delete ${selectedIds.length} selected major${selectedIds.length === 1 ? '' : 's'}? Majors referenced by a curriculum or cohort cannot be deleted.`}
        confirmLabel={`Delete ${selectedIds.length} major${selectedIds.length === 1 ? '' : 's'}`}
        destructive
        isLoading={isDeleting}
        onCancel={() => { if (!isDeleting) setIsBulkDeleteOpen(false); }}
        onConfirm={handleDeleteSelected}
      />
    </div>
  );
}
