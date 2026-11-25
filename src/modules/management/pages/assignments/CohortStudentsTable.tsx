import { Link } from 'react-router';
import { Pagination } from '../../components/Pagination';
import { backState } from '../../../../shared/lib/backLink';
import { cn } from '@/shared/lib/utils';

const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';
const btn = 'rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50';

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

export interface CohortStudentRow {
  id: string;
  studentCode: string;
  fullName: string;
  advisorName: string | null;
  assignedDate: string | null;
  hasPendingRequest: boolean;
}

export function CohortStudentsTable({
  cohortId,
  title,
  rows,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  hasFilters,
  selected,
  allPageSelected,
  onToggleAll,
  onToggleOne,
  onClearSelection,
  onAssignSelected,
  onUnassignSelected,
  onAssignOne,
  onUnassignOne,
  onRetry,
  onPageChange,
}: {
  cohortId: string;
  title: string;
  rows: CohortStudentRow[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  selected: Set<string>;
  allPageSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onClearSelection: () => void;
  onAssignSelected: () => void;
  onUnassignSelected: () => void;
  onAssignOne: (student: { id: string; name: string }) => void;
  onUnassignOne: (student: { id: string; name: string }) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}) {
  return (
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
            <button type="button" onClick={onAssignSelected} className="rounded-lg bg-[#f37021] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d95f15]">
              Assign / reassign
            </button>
            {rows.some((student) => selected.has(student.id) && student.advisorName) && (
              <button type="button" onClick={onUnassignSelected} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">
                Unassign selected
              </button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-[rgba(240,243,255,0.7)]">
            <tr>
              <th className="w-12 px-4 py-3.5">
                <input type="checkbox" checked={allPageSelected} onChange={onToggleAll} aria-label="Select all students on this page" className="size-4 accent-[#f37021]" />
              </th>
              <th className={th}>Student ID</th>
              <th className={th}>Full name</th>
              <th className={th}>Current advisor</th>
              <th className={th}>Assigned</th>
              <th className={th}>Request</th>
              <th className={cn(th, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-5">
                    <div className="h-4 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr className="border-t border-[#e7eefe]">
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                  Could not load students.{' '}
                  <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
                    Retry
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="border-t border-[#e7eefe]">
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                  {hasFilters ? 'No students match your filters.' : 'This cohort has no students.'}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className={cn('border-t border-[#e7eefe] hover:bg-gray-50/60', selected.has(s.id) && 'bg-[#fff7ed]/50')}>
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => onToggleOne(s.id)} aria-label={`Select ${s.fullName}`} className="size-4 accent-[#f37021]" />
                  </td>
                  <td className="px-3 py-3.5 text-[13px] font-semibold text-[#151c27]">{s.studentCode}</td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">{s.fullName}</td>
                  <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.advisorName ?? 'No advisor assigned'}</td>
                  <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{s.assignedDate ? formatDate(s.assignedDate) : '—'}</td>
                  <td className="px-3 py-3.5">
                    {s.hasPendingRequest ? (
                      <span className="rounded-full bg-[#fffbeb] px-2 py-0.5 text-[11px] font-bold uppercase text-[#b45309]">Requested</span>
                    ) : (
                      <span className="text-[13px] text-[#98a2b3]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button type="button" className={btn} onClick={() => onAssignOne({ id: s.id, name: s.fullName })}>
                        {s.advisorName ? 'Reassign' : 'Assign'}
                      </button>
                      {s.advisorName && (
                        <button type="button" className={btn} onClick={() => onUnassignOne({ id: s.id, name: s.fullName })}>
                          Unassign
                        </button>
                      )}
                      <Link
                        to={`/admin/assignments/students/${s.id}/history`}
                        state={backState(`/admin/assignments/cohorts/${cohortId}`, `Cohort ${title}`)}
                        className={btn}
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
      <Pagination page={page} pageSize={pageSize} total={total} noun="students" onChange={onPageChange} />
    </section>
  );
}
