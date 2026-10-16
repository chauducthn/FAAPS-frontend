import { useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { Pagination } from '../../components/admin/Pagination';
import { ReportStatusBadge, formatDateTime, shortReportId } from '../../components/admin/AiReportBits';
import { useAiReports } from '../../hooks/queries/useAdminDashboard';
import { useDebounce } from '../../hooks/useDebounce';
import type { AiReportStatus } from '../../types/admin';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;
const TABS: { value: AiReportStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

export default function AiReports() {
  const [status, setStatus] = useState<AiReportStatus | ''>('PENDING');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search.trim());

  const list = useAiReports({ status: status || undefined, search: debouncedSearch || undefined, page, size: PAGE_SIZE });
  // Cheap one-row queries just to read the totals for the header.
  const pending = useAiReports({ status: 'PENDING', page: 0, size: 1 });
  const resolved = useAiReports({ status: 'RESOLVED', page: 0, size: 1 });
  const dismissed = useAiReports({ status: 'DISMISSED', page: 0, size: 1 });
  const counts = [pending, resolved, dismissed].map((q) => q.data?.totalElements);
  const total = counts.every((c) => c !== undefined) ? counts.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) : undefined;

  const items = list.data?.items ?? [];
  const hasFilters = !!search || status !== 'PENDING';

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-xs text-[#555f6f]">AI / Reported AI Responses</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Reported AI Responses</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#555f6f]">
          {total ?? '–'} reports
          <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-bold uppercase text-[#b91c1c]">
            {pending.data?.totalElements ?? '–'} pending
          </span>
          <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-bold uppercase text-[#047857]">
            {resolved.data?.totalElements ?? '–'} resolved
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase text-[#555f6f]">
            {dismissed.data?.totalElements ?? '–'} dismissed
          </span>
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by Report ID, Student ID (MSSV), or Student Name"
            aria-label="Search reports"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#555f6f]">Status:</span>
          <div role="tablist" aria-label="Report status" className="flex rounded-lg bg-[#f7f8fa] p-0.5">
            {TABS.map((t) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={status === t.value}
                onClick={() => {
                  setStatus(t.value);
                  setPage(0);
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium',
                  status === t.value ? 'bg-[#f37021] text-white' : 'text-[#555f6f] hover:text-[#151c27]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearch('');
            setStatus('PENDING');
            setPage(0);
          }}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className={th}>Report ID</th>
                <th className={th}>Student ID (MSSV)</th>
                <th className={th}>Student name</th>
                <th className={th}>Reason</th>
                <th className={th}>Flagged</th>
                <th className={th}>Date</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={8} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : list.isError ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load reports.{' '}
                    <button type="button" onClick={() => list.refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {debouncedSearch ? 'No reports match your search.' : 'No reports in this status.'}
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                    <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]" title={r.id}>
                      {shortReportId(r.id)}
                    </td>
                    <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]">{r.studentCode ?? '—'}</td>
                    <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{r.studentName}</td>
                    <td className="max-w-[240px] px-3 py-4 text-[13px] text-[#555f6f]">
                      <p className="line-clamp-2">{r.reason}</p>
                    </td>
                    <td className="px-3 py-4 text-[13px] text-[#555f6f]">{r.flaggedCount}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-[#555f6f]">{formatDateTime(r.createdAt)}</td>
                    <td className="px-3 py-4">
                      <ReportStatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Link
                        to={`/admin/ai-reports/${r.id}`}
                        className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#151c27] hover:bg-gray-50"
                      >
                        Report Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={list.data?.totalElements ?? 0} noun="reports" onChange={setPage} />
      </section>
    </div>
  );
}
