// src/components/admin/curriculum/CurriculumFilterBar.tsx
import { Search, ChevronDown } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  isCurrent: string;
  onIsCurrentChange: (v: string) => void;
}

export default function CurriculumFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  isCurrent,
  onIsCurrentChange,
}: Props) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, version..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F26F21]"
          />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-gray-700"
          >
            <option value="ALL">Status: All</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={isCurrent}
            onChange={(e) => onIsCurrentChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-gray-700"
          >
            <option value="ALL">Current: All</option>
            <option value="true">Current only</option>
            <option value="false">Not current</option>
          </select>
          <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}