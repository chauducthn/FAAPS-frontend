import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, Search } from 'lucide-react';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { UserAvatar } from '../../../components/admin/UserAvatar';
import { Pagination } from '../../../components/admin/Pagination';
import { useAdvisorAssignment } from '../../../hooks/queries/useAdminAssignments';
import { useAdminUser } from '../../../hooks/queries/useAdminUsers';

const PAGE_SIZE = 20;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

function InfoTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f7f8fa] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#151c27]">{children}</p>
    </div>
  );
}

export default function AdvisorDetails() {
  const { advisorId } = useParams();
  const { data, isLoading, isError, refetch } = useAdvisorAssignment(advisorId);
  const { data: profile } = useAdminUser(advisorId ?? null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const students = useMemo(() => data?.students ?? [], [data]);
  const cohorts = useMemo(() => {
    const counts = new Map<string, number>();
    students.forEach((s) => counts.set(s.cohort, (counts.get(s.cohort) ?? 0) + 1));
    return [...counts.entries()];
  }, [students]);

  const term = search.trim().toLowerCase();
  const filtered = students.filter(
    (s) => s.studentCode.toLowerCase().includes(term) || s.fullName.toLowerCase().includes(term)
  );

  const back = (
    <Link to="/admin/assignments" className="inline-flex items-center gap-1 text-sm text-[#555f6f] hover:text-orange-600">
      <ChevronLeft className="size-4" />
      Back to Advisor Assignments
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-[#555f6f]">
          Could not load this advisor. They may be inactive or no longer exist.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { advisor } = data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        {back}
        <h1 className="mt-3 text-2xl font-semibold text-[#151c27]">Advisor Assignment Details</h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Current student assignments for {advisor.fullName} · {advisor.advisorCode}
        </p>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={advisor.fullName} src={profile?.avatarUrl} className="size-12" />
            <div>
              <h2 className="text-xl font-semibold text-[#151c27]">{advisor.fullName}</h2>
              <p className="text-sm text-[#555f6f]">{profile?.email ?? ' '}</p>
            </div>
          </div>
          {profile && <StatusBadge status={profile.status} />}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoTile label="Advisor ID">{advisor.advisorCode}</InfoTile>
          <InfoTile label="Currently assigned students">
            {advisor.activeStudents}
            {advisor.maxAdvisees !== null ? ` / ${advisor.maxAdvisees}` : ''}
          </InfoTile>
          <InfoTile label="Assigned cohorts">
            {cohorts.length} cohort{cohorts.length === 1 ? '' : 's'}
          </InfoTile>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-[#151c27]">Assigned cohorts</h2>
        {cohorts.length === 0 ? (
          <p className="mt-3 text-sm text-[#555f6f]">This advisor has no assigned students yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {cohorts.map(([cohort, count]) => (
              <li key={cohort} className="flex items-center justify-between rounded-lg bg-[#f7f8fa] px-4 py-3 text-sm">
                <Link to={`/admin/assignments/cohorts/${encodeURIComponent(cohort)}`} className="font-semibold text-[#151c27] hover:text-orange-600">
                  Cohort {cohort}
                </Link>
                <span className="text-[#555f6f]">
                  {count} assigned student{count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#151c27]">Assigned students</h2>
          <p className="text-[13px] text-[#555f6f]">Each student has only one active advisor.</p>
        </div>
        <section className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <Search className="size-4 text-[#98a2b3]" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search by student ID or name..."
                aria-label="Search students"
                className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
              />
            </label>
            <button
              type="button"
              disabled={!search}
              onClick={() => setSearch('')}
              className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
            >
              Clear filters
            </button>
          </div>
        </section>
        <section className="rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-[rgba(240,243,255,0.7)]">
                <tr>
                  <th className={th}>Student ID</th>
                  <th className={th}>Name</th>
                  <th className={th}>Cohort</th>
                  <th className={`${th} text-right`}>History</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="border-t border-[#e7eefe]">
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                      {search ? 'No students match your search.' : 'No assigned students.'}
                    </td>
                  </tr>
                ) : (
                  filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((s) => (
                    <tr key={s.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                      <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]">{s.studentCode}</td>
                      <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{s.fullName}</td>
                      <td className="px-3 py-4 text-sm text-[#555f6f]">{s.cohort}</td>
                      <td className="px-3 py-4 text-right">
                        <Link
                          to={`/admin/assignments/students/${s.id}/history`}
                          className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                        >
                          View history
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="students" onChange={setPage} />
        </section>
      </div>
    </div>
  );
}
