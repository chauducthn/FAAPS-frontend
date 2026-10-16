// src/pages/admin/Majors.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import MajorFilterBar from '@/components/layout/admin/MajorFilterBar';
import MajorSelectionBanner from '@/components/layout/admin/MajorSelectionBanner';
import MajorTable, { MajorItem } from '@/components/layout/admin/MajorTable';
import CreateMajorModal from '@/components/layout/admin/CreateMajorModal';
import { CreateMajorDto } from '../../types/major';

const initialFigmaData: MajorItem[] = [
  { id: '1', code: 'SE', name: 'Software Engineering', cohort: 'K18', status: 'ACTIVE' },
  { id: '2', code: 'AI', name: 'Artificial Intelligence', cohort: 'K18', status: 'ACTIVE' },
  { id: '3', code: 'IA', name: 'Information Assurance', cohort: 'K18', status: 'ACTIVE' },
  { id: '4', code: 'IS', name: 'Information Systems', cohort: 'K18', status: 'DRAFT' },
  { id: '5', code: 'GD', name: 'Graphic Design', cohort: 'K18', status: 'ACTIVE' },
  { id: '6', code: 'EX_DRAFT', name: 'Academic Program Draft (illustrative)', cohort: 'K18', status: 'DRAFT' },
];

export default function MajorsPage() {
  const [data, setData] = useState<MajorItem[]>(initialFigmaData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('K18');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // State quản lý Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredData.map((d) => d.id) : []);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setData(data.filter((d) => !selectedIds.includes(d.id)));
    toast.success(`Đã xóa ${selectedIds.length} ngành học!`);
    setSelectedIds([]);
  };

  // Xử lý khi Submit Modal Tạo Ngành
  const handleCreateMajorSubmit = (formData: CreateMajorDto) => {
    const newMajor: MajorItem = {
      id: String(Date.now()),
      code: formData.code,
      name: formData.name,
      cohort: selectedCohort === 'ALL' ? 'K18' : selectedCohort,
      status: 'ACTIVE',
    };

    setData([newMajor, ...data]);
    setIsCreateModalOpen(false);

    toast.success('Tạo ngành học mới thành công!', {
      description: `Ngành ${newMajor.code} - ${newMajor.name} đã được thêm vào hệ thống.`,
    });
  };

  return (
    // BỎ MAX-W-7XL MX-AUTO -> DÙNG W-FULL ĐỂ TRÀN MÀN HÌNH THOÁNG ĐÃNG
    <div className="w-full space-y-6">
      {/* Top Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Majors by Cohort</h1>
          <p className="text-xs text-gray-500 mt-0.5">Quản lý các ngành học theo từng khóa đào tạo</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="size-4" />
          Create Major
        </button>
      </div>

      {/* Filter Component */}
      <MajorFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedCohort={selectedCohort}
        onCohortChange={setSelectedCohort}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onClearContext={() => {
          setSearch('');
          setSelectedCohort('K18');
          setSelectedStatus('ALL');
        }}
      />

      {/* Banner Thao tác hàng loạt */}
      <MajorSelectionBanner
        selectedCount={selectedIds.length}
        onCancelSelection={() => setSelectedIds([])}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Bảng Dữ liệu */}
      <MajorTable
        data={filteredData}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onEditMajor={(item) => toast.info(`Đang mở chỉnh sửa ngành: ${item.code}`)}
      />

      {/* MODAL TẠO NGÀNH HỌC */}
      <CreateMajorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMajorSubmit}
      />
    </div>
  );
}