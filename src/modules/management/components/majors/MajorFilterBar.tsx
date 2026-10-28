import { Search, ChevronDown } from 'lucide-react';

interface MajorFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCohort: string;
  onCohortChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onClearContext: () => void;
  resultCount?: number;
}

const selectClass =
  'appearance-none bg-[#F9FAFB] hover:bg-[#F3F4F6] rounded-lg pl-3.5 pr-9 py-2.5 text-[13px] font-medium text-[#374151] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#F26F21]/25 focus:ring-offset-0 cursor-pointer transition-all border border-transparent focus:border-[#F26F21]/40 min-w-[132px]';

export default function MajorFilterBar({
  search,
  onSearchChange,
  selectedCohort,
  onCohortChange,
  selectedStatus,
  onStatusChange,
  onClearContext,
  resultCount,
}: MajorFilterBarProps) {
  const hasFilter = search !== '' || selectedCohort !== 'ALL' || selectedStatus !== 'ALL';
  const cohortOptions = Array.from(new Set(['ALL', selectedCohort, 'K99DEMO']));

  return (
    <div className="px-6 pt-5 pb-4 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by major code or name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] focus:bg-white rounded-lg text-[13px] text-[#111827] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#F26F21]/25 focus:border-[#F26F21]/40 border border-transparent transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select value={selectedCohort} onChange={(e) => onCohortChange(e.target.value)} className={selectClass} aria-label="Filter by cohort">
              {cohortOptions.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'Cohort: All' : c}</option>
              ))}
            </select>
            <ChevronDown className="size-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} className={selectClass} aria-label="Filter by status">
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="size-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasFilter && (
            <button
              onClick={onClearContext}
              className="px-3 py-2.5 text-[13px] font-semibold text-gray-500 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {typeof resultCount === 'number' && (
        <p className="mt-2.5 text-xs text-gray-400 font-medium">
          {resultCount} major{resultCount === 1 ? '' : 's'} found
          {selectedCohort !== 'ALL' && <span> in cohort <span className="text-gray-600 font-semibold">{selectedCohort}</span></span>}
        </p>
      )}
    </div>
  );
}
