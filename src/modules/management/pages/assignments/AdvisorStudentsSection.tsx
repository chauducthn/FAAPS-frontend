import { ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, X } from '@phosphor-icons/react';
import { Pagination } from '../../components/Pagination';
import { StaticTable } from '../../../../shared/components/common/table/StaticTable';
import { buildAdvisorStudentColumns } from './advisorStudentColumns';

export interface AdvisorStudentRow {
  id: string;
  studentCode: string;
  fullName: string;
  majorCode: string;
  cohort: string;
  assignedDate?: string | null;
}

export function AdvisorStudentsSection({
  advisorId,
  advisorName,
  search,
  page,
  pageSize,
  totalFiltered,
  pageRows,
  selected,
  allPageSelected,
  onSearchChange,
  onClearSearch,
  onToggleAll,
  onToggleOne,
  onSelectAllFiltered,
  onClearSelection,
  onReassignSelected,
  onUnassignSelected,
  onReassignOne,
  onUnassignOne,
  onHistoryOne,
  onPageChange,
}: {
  advisorId?: string;
  advisorName: string;
  search: string;
  page: number;
  pageSize: number;
  totalFiltered: number;
  pageRows: AdvisorStudentRow[];
  selected: Set<string>;
  allPageSelected: boolean;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onSelectAllFiltered?: () => void;
  onClearSelection: () => void;
  onReassignSelected: () => void;
  onUnassignSelected: () => void;
  onReassignOne: (student: { id: string; name: string }) => void;
  onUnassignOne: (student: { id: string; name: string }) => void;
  onHistoryOne?: (student: { id: string; code: string; name: string }) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Assigned students</h2>
          <span className="rounded-md bg-gray-200/70 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-gray-700">
            {totalFiltered}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:max-w-sm">
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by student ID or name..."
              aria-label="Search students"
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {search && (
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-dashed border-gray-300 bg-white px-2.5 text-xs font-semibold text-gray-600 hover:border-[#F26F21] hover:text-[#C2410C]"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-orange-200/80 bg-orange-50/70 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#F26F21] px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
              {selected.size} student{selected.size === 1 ? '' : 's'} selected
            </span>
            {onSelectAllFiltered && totalFiltered > selected.size && (
              <button
                type="button"
                onClick={onSelectAllFiltered}
                className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-orange-100/70"
              >
                Select all {totalFiltered}
              </button>
            )}
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-orange-100/80 hover:text-gray-900"
            >
              <X className="size-3.5" aria-hidden /> Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReassignSelected}
              className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#e05f14]"
            >
              Reassign
            </button>
            <button
              type="button"
              onClick={onUnassignSelected}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              Unassign
            </button>
          </div>
        </div>
      )}

      <StaticTable
        columns={buildAdvisorStudentColumns({ advisorId, advisorName, onReassignOne, onUnassignOne, onHistoryOne })}
        rows={pageRows}
        rowKey={(row) => row.id}
        emptyTitle={search ? 'No students match your search.' : 'No assigned students.'}
        minWidth="620px"
        selection={{
          selectedIds: selected,
          allSelected: allPageSelected,
          someSelected: pageRows.some((row) => selected.has(row.id)),
          onToggleAll: () => onToggleAll(),
          onToggleOne: (id) => onToggleOne(id),
          label: (row) => row.fullName,
        }}
      />
      <Pagination page={page} pageSize={pageSize} total={totalFiltered} noun="students" onChange={onPageChange} />
    </section>
  );
}
