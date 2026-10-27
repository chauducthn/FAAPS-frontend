// src/components/advising/StudentList.tsx
// Bảng sinh viên được phân công cho cố vấn.

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Pagination } from '../../management/components/Pagination';
import { useAdviseeStudents } from '../hooks/queries/useAdvisorQueries';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';
import type { AcademicStatus } from '../types/advising';
import { advisorService, type AdvisorStudentDetail } from '../services/advisorService';
import { Modal } from '../../../shared/components/ui/Modal';

const PAGE_SIZE = 10;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

const ACADEMIC_STATUS_STYLES: Record<AcademicStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800 ring-green-200' },
  PROBATION: { label: 'Probation', className: 'bg-orange-100 text-orange-800 ring-orange-200' },
  SUSPENDED: { label: 'Suspended', className: 'bg-red-100 text-red-800 ring-red-200' },
  GRADUATED: { label: 'Graduated', className: 'bg-blue-100 text-blue-800 ring-blue-200' },
  WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  LEAVE_OF_ABSENCE: { label: 'Leave of absence', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
};

/** "2024-09-01" → "01/09/2024". */
const formatDate = (value: string | null) => {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
};

function TableState({
  cols,
  loading,
  error,
  empty,
  onRetry,
}: {
  cols: number;
  loading: boolean;
  error: boolean;
  empty: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="border-t border-[#e7eefe]">
            <td colSpan={cols} className="px-4 py-5">
              <div className="h-4 animate-pulse rounded bg-gray-100" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <tr className="border-t border-[#e7eefe]">
      <td colSpan={cols} className="px-4 py-12 text-center text-sm text-[#555f6f]">
        {error ? (
          <>
            Unable to load students.{' '}
            <button type="button" onClick={onRetry} className="font-semibold text-orange-600 hover:underline">
              Try again
            </button>
          </>
        ) : (
          empty
        )}
      </td>
    </tr>
  );
}

export function StudentList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<AdvisorStudentDetail | null>(null);
  const debouncedSearch = useDebounce(search.trim());

  const { data, isLoading, isError, refetch } = useAdviseeStudents({
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
  });

  const rows = data?.items ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e7eefe] p-4 sm:flex-row sm:items-center">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name or student ID..."
            aria-label="Search students"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[rgba(240,243,255,0.7)]">
            <tr>
              <th className={th}>Student ID</th>
              <th className={th}>Full Name</th>
              <th className={th}>Cohort</th>
              <th className={th}>Major</th>
              <th className={th}>Semester</th>
              <th className={th}>GPA (/10)</th>
              <th className={th}>Credits</th>
              <th className={th}>Status</th>
              <th className={th}>Assigned Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || (isError && !data) || rows.length === 0 ? (
              <TableState
                cols={9}
                loading={isLoading}
                error={isError && !data}
                empty={
                  debouncedSearch
                    ? 'No students match your search.'
                    : 'No students have been assigned yet.'
                }
                onRetry={() => refetch()}
              />
            ) : (
              rows.map((s) => {
                const status = ACADEMIC_STATUS_STYLES[s.academicStatus] ?? ACADEMIC_STATUS_STYLES.ACTIVE;
                return (
                  <tr key={s.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                    <td className="px-3 py-3.5 text-[13px] font-semibold text-[#151c27]">{s.studentCode}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">{s.fullName}
                      <button type="button" className="ml-2 text-xs text-orange-700 underline" onClick={async () => setDetail(await advisorService.getStudentDetail(s.id))}>View detail</button>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-[#555f6f]">{s.curriculumVersion}</td>
                    <td className="px-3 py-3.5 text-sm text-[#555f6f]">
                      {s.majorCode}
                      <span className="block text-xs text-[#98a2b3]">{s.majorName}</span>
                    </td>
                    <td className="px-3 py-3.5 text-sm text-[#151c27]">{s.currentSemester}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">
                      {s.currentGpa !== null ? s.currentGpa.toFixed(2) : '—'}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-[#151c27]">{s.totalCreditsEarned}</td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{formatDate(s.assignedDate)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="students" onChange={setPage} />
      <Modal open={detail !== null} onClose={() => setDetail(null)} title="Student academic detail" className="max-w-3xl">
        {detail && <div className="max-h-[70vh] space-y-5 overflow-auto p-5 text-sm">
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2"><p><strong>Name:</strong> {detail.profile.fullName}</p><p><strong>Student ID:</strong> {detail.profile.studentCode ?? '—'}</p><p><strong>Major:</strong> {detail.profile.majorName ?? '—'}</p><p><strong>Cohort:</strong> {detail.profile.cohort ?? '—'}</p><p><strong>Semester:</strong> {detail.profile.currentSemester ?? '—'}</p><p><strong>Academic status:</strong> {detail.profile.academicStatus ?? '—'}</p></div>
          <div className="grid gap-3 sm:grid-cols-3"><p><strong>GPA</strong><span className="block text-xl">{detail.progress.currentGpa?.toFixed(2) ?? '—'}</span></p><p><strong>Credits earned</strong><span className="block text-xl">{detail.progress.earnedCredits}/{detail.progress.requiredCredits}</span></p><p><strong>Courses completed</strong><span className="block text-xl">{detail.progress.completedCourses}/{detail.progress.curriculumCourses}</span></p></div>
          <div><h3 className="font-semibold">Transcript</h3>{detail.transcript.length ? <div className="mt-2 overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="p-2 text-left">Course</th><th>Semester</th><th>Score</th><th>Status</th></tr></thead><tbody>{detail.transcript.map((row) => <tr key={row.id} className="border-b"><td className="p-2">{row.courseCode} · {row.courseName}</td><td className="text-center">{row.semesterCode}</td><td className="text-center">{row.finalScore ?? '—'}</td><td className="text-center">{row.status}</td></tr>)}</tbody></table></div> : <p className="mt-2 text-gray-500">No transcript records.</p>}</div>
        </div>}
      </Modal>
    </section>
  );
}
