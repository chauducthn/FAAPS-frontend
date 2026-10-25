// src/pages/advisor/AdvisorPortal.tsx
// Dashboard Cố vấn: thẻ số liệu, danh sách sinh viên được phân công, yêu cầu tư vấn đang chờ.

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../stores/useAuth';
import { useAdviseeStudents, useAdvisorAdvisingRequests } from '../../hooks/queries/useAdvisorQueries';
import { StudentList } from '../../components/advisor/StudentList';
import { RequestListTable } from '../../components/advisor/RequestListTable';
import { MockDataBanner } from '../../components/admin/MockDataToggle';
import { cn } from '@/lib/utils';

const COUNT_SIZE = 50;

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
  const pendingQuery = useAdvisorAdvisingRequests({ status: 'PENDING', page: 0, size: COUNT_SIZE });
  const inProgressQuery = useAdvisorAdvisingRequests({
    status: 'IN_PROGRESS',
    page: 0,
    size: COUNT_SIZE,
  });
  const resolvedQuery = useAdvisorAdvisingRequests({ status: 'RESOLVED', page: 0, size: COUNT_SIZE });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs text-[#555f6f]">Cố vấn / Tổng quan</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">
          Xin chào, {user?.fullName ?? 'bạn'}
        </h1>
        <p className="mt-1 text-sm text-[#555f6f]">
          Quản lý sinh viên được phân công và xử lý các yêu cầu tư vấn.
        </p>
      </div>

      <MockDataBanner scope="portal" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng SV được phân công" value={studentsQuery.data?.totalElements} />
        <StatCard label="Yêu cầu đang chờ" value={pendingQuery.data?.totalElements} tone="warn" />
        <StatCard label="Đang xử lý" value={inProgressQuery.data?.totalElements} />
        <StatCard label="Đã xử lý" value={resolvedQuery.data?.totalElements} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#151c27]">Yêu cầu tư vấn</h2>
            <p className="mt-0.5 text-[13px] text-[#555f6f]">
              Chấp nhận (RESOLVED) hoặc từ chối (CANCELLED) yêu cầu của sinh viên.
            </p>
          </div>
          <label className="flex h-[38px] w-full items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 sm:w-72">
            <Search className="size-4 text-[#98a2b3]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên SV hoặc tiêu đề..."
              aria-label="Tìm yêu cầu"
              className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
            />
          </label>
        </div>

        <RequestListTable search={search.trim()} />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#151c27]">Sinh viên được phân công</h2>
          <p className="mt-0.5 text-[13px] text-[#555f6f]">
            Theo dõi học tập và trạng thái của các sinh viên bạn phụ trách.
          </p>
        </div>

        <StudentList />
      </section>
    </div>
  );
}
