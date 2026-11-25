import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { backState } from '../../../../shared/lib/backLink';
import { Pagination } from '../../components/Pagination';
import { cn } from '@/shared/lib/utils';

const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

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
  onClearSelection,
  onReassignSelected,
  onUnassignSelected,
  onReassignOne,
  onUnassignOne,
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
  onClearSelection: () => void;
  onReassignSelected: () => void;
  onUnassignSelected: () => void;
  onReassignOne: (student: { id: string; name: string }) => void;
  onUnassignOne: (student: { id: string; name: string }) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#151c27]">Assigned students</h2>
        <p className="text-[13px] text-[#555f6f]">Each student has only one active advisor.</p>
      </div>
      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student ID or name..."
            aria-label="Search students"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        <button
          type="button"
          disabled={!search}
          onClick={onClearSearch}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </section>
      <section className="rounded-xl bg-white shadow-sm">
        {selected.size > 0 && (
          <div className="flex flex-col items-start justify-between gap-3 border-b border-[#e7eefe] p-4 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-[#151c27]">
              {selected.size} student{selected.size === 1 ? '' : 's'} selected
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onClearSelection} className="px-2 text-sm font-semibold text-[#f37021] hover:underline">
                Clear selection
              </button>
              <button
                type="button"
                onClick={onReassignSelected}
                className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]"
              >
                Reassign
              </button>
              <button
                type="button"
                onClick={onUnassignSelected}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
              >
                Unassign
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className="w-12 px-4 py-3.5">
                  <input type="checkbox" checked={allPageSelected} onChange={onToggleAll} aria-label="Select all students on this page" className="size-4 accent-[#f37021]" />
                </th>
                <th className={th}>Student ID</th>
                <th className={th}>Name</th>
                <th className={th}>Major</th>
                <th className={th}>Cohort</th>
                <th className={th}>Assigned</th>
                <th className={cn(th, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {search ? 'No students match your search.' : 'No assigned students.'}
                  </td>
                </tr>
              ) : (
                pageRows.map((s) => (
                  <tr key={s.id} className={cn('border-t border-[#e7eefe] hover:bg-gray-50/60', selected.has(s.id) && 'bg-[#fff7ed]/50')}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(s.id)} onChange={() => onToggleOne(s.id)} aria-label={`Select ${s.fullName}`} className="size-4 accent-[#f37021]" />
                    </td>
                    <td className="px-3 py-3.5 text-[13px] font-semibold text-[#151c27]">{s.studentCode}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">{s.fullName}</td>
                    <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.majorCode}</td>
                    <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.cohort}</td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">
                      {s.assignedDate
                        ? new Date(`${s.assignedDate}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => onReassignOne({ id: s.id, name: s.fullName })} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50">
                          Reassign
                        </button>
                        <button type="button" onClick={() => onUnassignOne({ id: s.id, name: s.fullName })} className="rounded-lg border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-700 hover:bg-red-50">
                          Unassign
                        </button>
                        <Link
                          to={`/admin/assignments/students/${s.id}/history`}
                          state={backState(`/admin/assignments/advisors/${advisorId}`, `Advisor ${advisorName}`)}
                          className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                        >
                          History
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={totalFiltered} noun="students" onChange={onPageChange} />
      </section>
    </div>
  );
}
