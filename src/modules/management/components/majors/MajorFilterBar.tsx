import { Search, ChevronDown } from 'lucide-react';

interface MajorFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCohort: string;
  onCohortChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearContext: () => void;
}

export default function MajorFilterBar({
  search,
  onSearchChange,
  selectedCohort,
  onCohortChange,
  selectedStatus,
  onStatusChange,
  onClearContext,
}: MajorFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-800">Cohort {selectedCohort === 'ALL' ? 'All' : selectedCohort}</h3>
        <button
          onClick={onClearContext}
          className="text-xs font-semibold text-[#F26F21] hover:underline cursor-pointer"
        >
          Clear context
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by major code or name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F26F21] transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative">
            <select
              value={selectedCohort}
              onChange={(e) => onCohortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#F26F21] cursor-pointer"
            >
              <option value="ALL">Cohort: All</option>
              <option value="K99DEMO">Cohort: K99DEMO</option>
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#F26F21] cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="INACTIVE">Status: Inactive</option>
              <option value="DRAFT">Status: Draft</option>
            </select>
            <ChevronDown className="size-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
