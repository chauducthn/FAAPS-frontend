// src/pages/advising/AdvisorPortal.tsx
// Dashboard Cố vấn: thẻ số liệu, danh sách sinh viên được phân công, yêu cầu tư vấn đang chờ.

import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../../auth/stores/useAuth';
import { useAdviseeStudents, useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { RequestListTable } from '../components/RequestListTable';

import { cn } from '@/shared/lib/utils';

const COUNT_SIZE = 50;

/** API trả về mảng thô — số lượng là độ dài mảng. */
const countOf = (items: unknown[] | undefined): number | undefined =>
  items ? items.length : undefined;

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone?: 'warn';
}) {
  return (
    <div className="rounded-xl bg-white p-4 text-left shadow-sm">
      <p className="text-xs font-medium text-[#555f6f]">{label}</p>
      <p
        className={cn(
          'mt-1 text-3xl font-bold',
          tone === 'warn' && (value ?? 0) > 0 ? 'text-[#b45309]' : 'text-[#151c27]',
        )}
      >
        {value ?? '–'}
      </p>
    </div>
  );
}

export default function AdvisorPortal() {
  const user = useAuth((s) => s.user);
  const [search, setSearch] = useState('');

  // Đếm nhanh theo từng trạng thái (size lớn, không phân trang).
  const studentsQuery = useAdviseeStudents({ page: 0, size: COUNT_SIZE });
  const pendingQuery = useAdvisorAdvisingRequests({ status: 'PENDING' });
  const inProgressQuery = useAdvisorAdvisingRequests({ status: 'IN_PROGRESS' });
  const resolvedQuery = useAdvisorAdvisingRequests({ status: 'RESOLVED' });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs text-[#555f6f]">Advisor / Overview</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">
          Welcome, {user?.fullName ?? 'Advisor'}
        </h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Manage assigned students and process advising requests.
        </p>
      </div>



      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Students" value={studentsQuery.data?.totalElements} />
        <StatCard label="Pending Requests" value={countOf(pendingQuery.data)} tone="warn" />
        <StatCard label="In Progress" value={countOf(inProgressQuery.data)} />
        <StatCard label="Resolved" value={countOf(resolvedQuery.data)} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#151c27]">Advising Requests</h2>
            <p className="mt-0.5 text-[13px] text-[#555f6f]">
              Accept (RESOLVED) or reject (CANCELLED) student requests.
            </p>
          </div>
          <label className="flex h-[38px] w-full items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 sm:w-72">
            <Search className="size-4 text-[#98a2b3]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or title..."
              aria-label="Search requests"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
        </div>

        <RequestListTable search={search.trim()} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#151c27]">Assigned Students</h2>
            <p className="mt-0.5 text-[13px] text-[#555f6f]">
              Monitor the academic progress and status of your assigned students.
            </p>
          </div>
          <Link
            to="/advisor/students"
            className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#e05f14]"
          >
            Open My Students <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="rounded-xl bg-white p-4 text-sm text-[#555f6f] shadow-sm">
          You have <strong className="text-[#151c27]">{studentsQuery.data?.totalElements ?? '–'}</strong> assigned
          students. Search, filter by academic status and open the 360° profile from the dedicated page.
        </div>
      </section>
    </div>
  );
}
