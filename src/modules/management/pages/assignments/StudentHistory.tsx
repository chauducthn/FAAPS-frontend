import { Link, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { useBackTarget } from '../../../../shared/lib/backLink';
import { useStudentHistory } from '../../hooks/queries/useAdminAssignments';
import { useAdminUser } from '../../hooks/queries/useAdminUsers';
import { cn } from '@/shared/lib/utils';

const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

// Dates from the API are plain yyyy-MM-dd values; parse them as local dates.
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#151c27]">{children}</p>
    </div>
  );
}

export default function StudentHistory() {
  const { studentId } = useParams();
  const { data: history, isLoading, isError, refetch } = useStudentHistory(studentId);
  const { data: student } = useAdminUser(studentId ?? null);

  const current = history?.find((h) => h.endDate === null && h.status === 'ACTIVE');
  const backTarget = useBackTarget(
    student?.curriculumVersionId ? `/admin/assignments/cohorts/${student.curriculumVersionId}` : '/admin/assignments',
    student?.curriculumVersionId ? 'Cohort Assignment Details' : 'Advisor Assignments'
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <Link to={backTarget.to} className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
          <ChevronLeft className="size-4" />
          Back to {backTarget.label}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Student Assignment History</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Read-only assignment records{student ? ` for ${student.fullName} · ${student.userId}` : ''}
        </p>
      </div>

      {student && (
        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#151c27]">{student.fullName}</h2>
              <p className="text-sm text-[#555f6f]">
                {student.userId} · {student.email}
              </p>
            </div>
            <StatusBadge status={student.status} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Tile label="Cohort code">{student.curriculumCode ?? '—'}</Tile>
            <Tile label="Major">{student.majorName ?? '—'}</Tile>
            <Tile label="Current advisor">{current ? current.advisorName : 'No advisor assigned'}</Tile>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between p-5 sm:px-6">
          <h2 className="text-base font-semibold text-[#151c27]">All assignment records</h2>
          <p className="text-[13px] text-[#555f6f]">{history?.length ?? 0} records · Newest first</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className={th}>Assigned advisor</th>
                <th className={th}>Start date</th>
                <th className={th}>End date</th>
                <th className={th}>Status</th>
                <th className={th}>Assigned by</th>
                <th className={th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-8">
                    <div className="h-4 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ) : isError && !history ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load the history.{' '}
                    <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : !history || history.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    This student has never been assigned an advisor.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="border-t border-[#e7eefe]">
                    <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{h.advisorName}<span className="block text-xs font-normal text-[#555f6f]">{h.advisorEmail}</span></td>
                    <td className="px-3 py-4 text-sm text-[#151c27]">{h.assignedAt ? formatDateTime(h.assignedAt) : formatDate(h.assignedDate)}</td>
                    <td className="px-3 py-4 text-sm text-[#151c27]">{h.endDate ? formatDate(h.endDate) : 'Present'}</td>
                    <td className={cn('px-3 py-4 text-sm font-semibold', h.status === 'ACTIVE' ? 'text-[#047857]' : 'text-[#555f6f]')}>
                      {h.status}
                    </td>
                    <td className="px-3 py-4 text-sm text-[#555f6f]">{h.assignedByName ?? '—'}</td>
                    <td className="max-w-[220px] px-3 py-4 text-[13px] text-[#555f6f]">{h.notes?.trim() ? h.notes : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
