import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CreateMajorDto, Major, MajorStatus } from '../../types/major';
import { majorService } from '../../services/admin/major.service';
import { useMajorsQuery, MAJOR_QUERY_KEYS } from '../../hooks/queries/useMajorsQuery';
import MajorTable, { MajorItem } from '@/components/admin/majors/MajorTable';
import MajorFilterBar from '@/components/admin/majors/MajorFilterBar';
import MajorSelectionBanner from '@/components/admin/majors/MajorSelectionBanner';
import CreateMajorModal from '@/components/admin/majors/CreateMajorModal';

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
  const { data: result, isLoading, isError } = useMajorsQuery({ search: search || undefined, status: selectedStatus as MajorStatus | 'ALL', cohort: selectedCohort, page, size: 20 });
  const data: MajorItem[] = (result?.items ?? []).map((major) => ({ id: major.id, code: major.code, name: major.name, cohort: major.cohort, status: major.status }));

  const refresh = async () => {
    setSelectedIds([]);
    await queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected major(s)?`)) return;
    try {
      for (const id of selectedIds) await majorService.deleteMajor(id);
      toast.success('Selected majors deleted.');
      await refresh();
    } catch (error) {
      toast.error(`Major could not be deleted: ${errorMessage(error)}`);
      await refresh();
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

  return <div className="w-full space-y-6">
    <div className="flex items-center justify-between">
      <div><h1 className="text-xl font-bold text-gray-900 tracking-tight">Majors by Cohort</h1><p className="text-xs text-gray-500 mt-0.5">Manage academic majors for each training cohort</p></div>
      <button onClick={() => { setEditingMajor(null); setIsModalOpen(true); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"><Plus className="size-4" /> Create Major</button>
    </div>
    <MajorFilterBar search={search} onSearchChange={(value) => { setSearch(value); setPage(0); }} selectedCohort={selectedCohort} onCohortChange={(value) => { setSelectedCohort(value); setPage(0); }} selectedStatus={selectedStatus} onStatusChange={(value) => { setSelectedStatus(value); setPage(0); }} onClearContext={() => { setSearch(''); setSelectedCohort('ALL'); setSelectedStatus('ALL'); setPage(0); }} />
    <MajorSelectionBanner selectedCount={selectedIds.length} onCancelSelection={() => setSelectedIds([])} onDeleteSelected={handleDeleteSelected} />
    {isLoading && <p className="text-sm text-gray-500">Loading majors...</p>}
    {isError && <p className="text-sm text-red-600">Could not load majors from the server.</p>}
    {!isError && <MajorTable data={data} selectedIds={selectedIds} onSelectAll={(checked) => setSelectedIds(checked ? data.map((item) => item.id) : [])} onSelectRow={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onEditMajor={handleEdit} page={page} totalItems={result?.totalItems ?? 0} totalPages={result?.totalPages ?? 0} onPageChange={(nextPage) => { setPage(nextPage); setSelectedIds([]); }} />}
    <CreateMajorModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingMajor(null); }} onSubmit={handleSubmit} initialData={editingMajor ? { code: editingMajor.code, name: editingMajor.name, description: editingMajor.description, totalCredits: editingMajor.totalCredits, durationYears: editingMajor.durationYears } : undefined} isSaving={isSaving} />
  </div>;
}
