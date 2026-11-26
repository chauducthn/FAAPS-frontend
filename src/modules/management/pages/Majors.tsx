import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateMajorDto, Major, MajorStatus } from '../../academic/types/major';
import { majorService } from '../services/major.service';
import { useMajorsQuery, MAJOR_QUERY_KEYS } from '../../academic/hooks/queries/useMajorsQuery';
import MajorTable, { MajorItem } from '@/modules/management/components/majors/MajorTable';
import MajorFilterBar from '@/modules/management/components/majors/MajorFilterBar';
import { MajorsTopBar } from '@/modules/management/components/majors/MajorsTopBar';
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

  const { data: result, isLoading, isError } = useMajorsQuery({
    search: search || undefined, status: selectedStatus as MajorStatus | 'ALL', cohort: selectedCohort, page, size: 20,
  });
  const { data: allMajors } = useMajorsQuery({ page: 0, size: 100 });

  const data: MajorItem[] = useMemo(
    () => (result?.items ?? []).map((m) => ({ id: m.id, code: m.code, name: m.name, totalCredits: m.totalCredits, durationYears: m.durationYears, cohort: m.cohort, status: m.status })),
    [result],
  );
  const cohortOptions = useMemo(() => {
    const source = allMajors?.items ?? result?.items ?? [];
    return Array.from(new Set(source.map((m) => m.cohort).filter(Boolean))).sort();
  }, [allMajors, result]);

  const applyFilter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
    setSelectedIds([]);
  };

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
    } catch (error) { toast.error(`Major could not be deleted: ${errorMessage(error)}`); }
    finally { setIsDeleting(false); }
  };

  const handleDeleteSingle = async () => {
    if (!deletingMajor) return;
    setIsDeleting(true);
    try {
      await majorService.deleteMajor(deletingMajor.id);
      toast.success(`Major ${deletingMajor.code} deleted.`);
      setDeletingMajor(null);
      await refresh();
    } catch (error) { toast.error(`Major could not be deleted: ${errorMessage(error)}`); }
    finally { setIsDeleting(false); }
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
    } catch (error) { toast.error(`Could not save major: ${errorMessage(error)}`); }
    finally { setIsSaving(false); }
  };

  const handleEdit = async (item: MajorItem) => {
    try {
      setEditingMajor(await majorService.getMajorById(item.id));
      setIsModalOpen(true);
    } catch (error) { toast.error(`Could not load major: ${errorMessage(error)}`); }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCohort('ALL');
    setSelectedStatus('ALL');
    setPage(0);
    setSelectedIds([]);
  };

  return (
    <div className="w-full space-y-4">
      <MajorsTopBar
        totalItems={result?.totalItems}
        activeCount={data.filter((m) => m.status === 'ACTIVE').length}
        draftCount={data.filter((m) => m.status === 'DRAFT').length}
        inactiveCount={data.filter((m) => m.status === 'INACTIVE').length}
        selectedStatus={selectedStatus}
        onSelectStatus={applyFilter(setSelectedStatus)}
        onCreate={() => { setEditingMajor(null); setIsModalOpen(true); }}
      />

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <MajorFilterBar
          search={search}
          onSearchChange={applyFilter(setSearch)}
          selectedCohort={selectedCohort}
          cohortOptions={cohortOptions}
          onCohortChange={applyFilter(setSelectedCohort)}
          selectedStatus={selectedStatus}
          onStatusChange={applyFilter(setSelectedStatus)}
          onClearContext={clearFilters}
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onDeleteSelected={() => setIsBulkDeleteOpen(true)}
        />
        <div className="h-[520px]">
          {isLoading && (
            <div className="space-y-3 px-6 py-10" aria-label="Loading majors">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          )}
          {isError && (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-gray-900">Could not load majors from the server.</p>
              <p className="mt-1 text-[13px] text-gray-500">Check your connection and try again.</p>
              <button onClick={() => refresh()} className="mt-4 cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-200">Retry</button>
            </div>
          )}
          {!isLoading && !isError && (
            <div className="h-full">
              <MajorTable
                data={data}
                selectedIds={selectedIds}
                onSelectAll={(checked) => setSelectedIds(checked ? data.map((item) => item.id) : [])}
                onSelectRow={(id) => setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))}
                onEditMajor={handleEdit}
                onDeleteMajor={(item) => setDeletingMajor(item)}
                page={page}
                totalItems={result?.totalItems ?? 0}
                totalPages={result?.totalPages ?? 0}
                onPageChange={(nextPage) => { setPage(nextPage); setSelectedIds([]); }}
              />
            </div>
          )}
        </div>
      </section>

      <CreateMajorModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMajor(null); }}
        onSubmit={handleSubmit}
        existingCodes={Array.from(new Set((allMajors?.items ?? result?.items ?? []).map((m) => m.code))).sort()}
        initialData={editingMajor ? { code: editingMajor.code, name: editingMajor.name, description: editingMajor.description, totalCredits: editingMajor.totalCredits, durationYears: editingMajor.durationYears, cohort: editingMajor.cohort, status: editingMajor.status } : undefined}
        isSaving={isSaving}
      />

      <ConfirmDialog
        open={!!deletingMajor}
        title="Delete major?"
        message={deletingMajor ? `Delete ${deletingMajor.code} - ${deletingMajor.name}? Majors referenced by a curriculum or cohort cannot be deleted.` : ''}
        confirmLabel="Delete major"
        destructive
        isLoading={isDeleting}
        onCancel={() => { if (!isDeleting) setDeletingMajor(null); }}
        onConfirm={handleDeleteSingle}
      />

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
