// src/components/admin/cohorts/CohortFilterBar.tsx
import { Search, ChevronDown } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
}

export default function CohortFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: Props) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by cohort code or name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F26F21] transition-all"
          />
        </div>
        <div className="relative w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#F26F21]"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Status: Active</option>
            <option value="INACTIVE">Status: Inactive</option>
          </select>
          <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}