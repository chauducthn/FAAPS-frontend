// src/pages/advising/AdvisorAdvisingRequests.tsx
// Trang "Yêu cầu tư vấn" của cố vấn — hero cam FPT + stat cards + bảng đầy đủ + ô tìm kiếm.
// Đồng bộ 1-1 với My Students / Appointments: hero gradient, section rounded-2xl, pill tabs.

import { useMemo, useState } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { RequestListTable } from '../components/RequestListTable';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';

export default function AdvisorAdvisingRequests() {
  const [search, setSearch] = useState('');
  const { data } = useAdvisorAdvisingRequests({});

  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      total: all.length,
      pending: all.filter((r) => r.status === 'PENDING').length,
      inProgress: all.filter((r) => r.status === 'IN_PROGRESS').length,
      resolved: all.filter((r) => r.status === 'RESOLVED').length,
    };
  }, [data]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Hero cam FPT — đồng bộ My Students / Appointments */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] p-6 text-white shadow-sm">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-40 size-36 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Advisor / Advising Requests
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <ClipboardList className="size-6" aria-hidden />
            Advising Requests
          </h1>
          <p className="mt-1 text-[13px] text-white/85">
            {stats.pending > 0
              ? `${stats.pending} pending request${stats.pending === 1 ? '' : 's'} need your response.`
              : 'No pending requests right now. Nice work!'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Total', value: String(stats.total) },
              { label: 'Pending', value: String(stats.pending) },
              { label: 'In progress', value: String(stats.inProgress) },
              { label: 'Resolved', value: String(stats.resolved) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-white/80">{s.label}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition-colors focus-within:border-[#F26F21] focus-within:ring-1 focus-within:ring-[#F26F21]/40">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, student ID, or title..."
              aria-label="Search requests"
              className="flex-1 bg-transparent text-sm text-[#151c27] outline-none placeholder:text-slate-400"
            />
          </label>
          {search.trim() !== '' && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="h-10 rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="mt-4">
          <RequestListTable search={search.trim()} />
        </div>
      </section>
    </div>
  );
}
