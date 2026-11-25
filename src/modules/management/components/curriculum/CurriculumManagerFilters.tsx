import { CheckCircle2, ChevronDown, CircleOff, RotateCcw, Search, Trash2 } from 'lucide-react';
import type { CurriculumKind } from '../../../academic/hooks/queries/useCurriculumsQuery';
import type { CurriculumBulkAction } from '../../utils/curriculumBulk';

const selectClass =
  'appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3.5 pr-9 text-xs font-semibold text-gray-700 shadow-xs transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20';

interface MajorOption {
  id: string;
  code: string;
  name: string;
}

interface Props {
  kind: CurriculumKind;
  searchPlaceholder: string;
  search: string;
  majorId: string;
  status: string;
  current: string;
  majors: MajorOption[];
  hasFilters: boolean;
  selectedCount: number;
  onSearchChange: (v: string) => void;
  onMajorChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onCurrentChange: (v: string) => void;
  onClearFilters: () => void;
  onBulkAction: (action: CurriculumBulkAction) => void;
  onClearSelection: () => void;
}

export function CurriculumManagerFilters({
  kind,
  searchPlaceholder,
  search,
  majorId,
  status,
  current,
  majors,
  hasFilters,
  selectedCount,
  onSearchChange,
  onMajorChange,
  onStatusChange,
  onCurrentChange,
  onClearFilters,
  onBulkAction,
  onClearSelection,
}: Props) {
  return (
    <>
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <select value={majorId} onChange={(e) => onMajorChange(e.target.value)} aria-label="Major filter" className={`${selectClass} w-full sm:w-52`}>
                <option value="">Major: All majors</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select value={status} onChange={(e) => onStatusChange(e.target.value)} aria-label="Status filter" className={`${selectClass} w-full sm:w-44`}>
                <option value="">Status: All</option>
                <option value="ACTIVE">● Active</option>
                <option value="INACTIVE">○ Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            {kind === 'curriculum' && (
              <div className="relative">
                <select value={current} onChange={(e) => onCurrentChange(e.target.value)} aria-label="Current version filter" className={`${selectClass} w-full sm:w-48`}>
                  <option value="">Version: All</option>
                  <option value="true">Current only</option>
                  <option value="false">Previous only</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3.5 py-2.5 text-xs font-bold text-gray-500 transition-colors hover:border-[#F26F21] hover:text-[#C2410C]"
              >
                <RotateCcw className="size-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {kind === 'curriculum' && selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-[#713f12]" role="toolbar" aria-label="Curriculum bulk actions">
          <span className="mr-auto">{selectedCount} selected on this page</span>
          <button type="button" onClick={() => onBulkAction('ACTIVE')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white hover:bg-emerald-700">
            <CheckCircle2 className="size-3.5" /> Set active
          </button>
          <button type="button" onClick={() => onBulkAction('INACTIVE')} className="inline-flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 font-bold text-white hover:bg-gray-800">
            <CircleOff className="size-3.5" /> Set inactive
          </button>
          <button type="button" onClick={() => onBulkAction('DELETE')} className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 font-bold text-white hover:bg-red-800">
            <Trash2 className="size-3.5" /> Delete selected
          </button>
          <button type="button" onClick={onClearSelection} className="rounded-lg px-2 py-2 text-gray-600 hover:bg-white">
            Clear
          </button>
        </div>
      )}
    </>
  );
}
