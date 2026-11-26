import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateMajorDto, Major, MajorStatus } from '../../academic/types/major';
import { majorService } from '../services/major.service';
import { useMajorsQuery, MAJOR_QUERY_KEYS } from '../../academic/hooks/queries/useMajorsQuery';
import MajorTable, { MajorItem } from '@/modules/management/components/majors/MajorTable';
import MajorFilterBar from '@/modules/management/components/majors/MajorFilterBar';
import { MajorsTopBar } from '@/modules/management/components/majors/MajorsTopBar';
import { MajorsDialogs } from '@/modules/management/components/majors/MajorsDialogs';
import { useMajorImport } from '@/modules/management/components/majors/useMajorImport';
import { useDebounce } from '@/shared/hooks/useDebounce';

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Please try again.';

export default function MajorsPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState('ALL');
  const [selectedDuration, setSelectedDuration] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMajor, setDeletingMajor] = useState<MajorItem | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: result, isLoading, isError } = useMajorsQuery({
    search: debouncedSearch || undefined,
    code: selectedCode === 'ALL' ? undefined : selectedCode,
    durationYears: selectedDuration === 'ALL' ? undefined : Number(selectedDuration),
    status: selectedStatus as MajorStatus | 'ALL', page, size: 20,
  });
  const { data: allMajors } = useMajorsQuery({ page: 0, size: 100 });
  const data: MajorItem[] = useMemo(
    () => (result?.items ?? []).map((m) => ({ id: m.id, code: m.code, name: m.name, totalCredits: m.totalCredits, durationYears: m.durationYears, cohort: m.cohort, status: m.status })),
    [result],
  );
  const sourceMajors = allMajors?.items ?? result?.items ?? [];
  const codeOptions = useMemo(() => Array.from(new Set(sourceMajors.map((m) => m.code))).sort(), [sourceMajors]);
  const durationOptions = useMemo(() => Array.from(new Set(sourceMajors.map((m) => Number(m.durationYears)).filter((d) => d > 0))).sort((a, b) => a - b), [sourceMajors]);

  const applyFilter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0); setSelectedIds([]);
  };

  const refresh = async () => {
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
  };
  const majorImport = useMajorImport(refresh);

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

  const handleBulkStatus = async (status: MajorStatus) => {
    if (!selectedIds.length) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await majorService.bulkUpdateStatus(selectedIds, status);
      toast.success(`Updated ${updated} major${updated === 1 ? '' : 's'} to ${status.toLowerCase()}.`);
      await refresh();
    } catch (error) { toast.error(`Could not update status: ${errorMessage(error)}`); }
    finally { setIsUpdatingStatus(false); }
  };

  const clearFilters = () => {
    setSearch(''); setSelectedCode('ALL');
    setSelectedDuration('ALL'); setSelectedStatus('ALL');
    setPage(0); setSelectedIds([]);
  };

  return (
    <div className="w-full space-y-4">
      <MajorsTopBar
        totalItems={result?.totalItems}
        activeCount={data.filter((m) => m.status === 'ACTIVE').length}
        draftCount={data.filter((m) => m.status === 'DRAFT').length}
        inactiveCount={data.filter((m) => m.status === 'INACTIVE').length}
        selectedStatus={selectedStatus}
        isImporting={majorImport.isImporting}
        examples={majorImport.examples}
        onSelectStatus={applyFilter(setSelectedStatus)}
        onImportFile={(file) => void majorImport.handleImportFile(file)}
        onCreate={() => { setEditingMajor(null); setIsModalOpen(true); }}
      />

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <MajorFilterBar
          search={search}
          onSearchChange={applyFilter(setSearch)}
          selectedCode={selectedCode}
          codeOptions={codeOptions}
          onCodeChange={applyFilter(setSelectedCode)}
          selectedDuration={selectedDuration}
          durationOptions={durationOptions}
          onDurationChange={applyFilter(setSelectedDuration)}
          selectedStatus={selectedStatus}
          onStatusChange={applyFilter(setSelectedStatus)}
          onClearContext={clearFilters}
          selectedCount={selectedIds.length}
          isUpdatingStatus={isUpdatingStatus}
          onClearSelection={() => setSelectedIds([])}
          onBulkStatus={(status) => void handleBulkStatus(status)}
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

      <MajorsDialogs
        isModalOpen={isModalOpen} editingMajor={editingMajor} codeOptions={codeOptions} isSaving={isSaving}
        deletingMajor={deletingMajor} isBulkDeleteOpen={isBulkDeleteOpen} selectedCount={selectedIds.length}
        isDeleting={isDeleting} importProblems={majorImport.importProblems}
        onCloseModal={() => { setIsModalOpen(false); setEditingMajor(null); }} onSubmitMajor={handleSubmit}
        onCancelDeleteSingle={() => { if (!isDeleting) setDeletingMajor(null); }} onConfirmDeleteSingle={handleDeleteSingle}
        onCancelBulkDelete={() => { if (!isDeleting) setIsBulkDeleteOpen(false); }} onConfirmBulkDelete={handleDeleteSelected}
        examples={majorImport.examples} onCloseImportProblems={majorImport.clearImportProblems}
      />
    </div>
  );
}
