import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { Pagination } from './Pagination';
import { useAiReports } from '../../hooks/queries/useAdminDashboard';
import { useDebounce } from '../../hooks/useDebounce';
import type { AiReportSummary } from '../../types/admin';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

type SortKey = 'id' | 'studentCode' | 'studentName' | 'reason' | 'flaggedCount' | 'createdAt';

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'id', label: 'Report ID' },
  { key: 'studentCode', label: 'Student ID (MSSV)' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'reason', label: 'Reason' },
  { key: 'flaggedCount', label: 'Flagged' },
  { key: 'createdAt', label: 'Date' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const shortId = (id: string) => id.slice(0, 8).toUpperCase();

export function PendingReportsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });
  const debouncedSearch = useDebounce(search.trim());

  const { data, isLoading, isError, refetch } = useAiReports({
    status: 'PENDING',
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
  });

  // The API returns newest first; sorting applies to the rows of the current page.
  const rows = useMemo(() => {
    const items = [...(data?.items ?? [])];
    const { key, dir } = sort;
    items.sort((a: AiReportSummary, b: AiReportSummary) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [data, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const total = data?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-5 rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#151c27]">Pending AI Responses</h2>
        <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[#b91c1c]">
          {total} pending
        </span>
      </div>

      <label className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
        <Search className="size-4 text-[#98a2b3]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by Report ID, MSSV, or Student Name"
          aria-label="Search pending reports"
          className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
        />
      </label>

      <div className="overflow-x-auto rounded-xl border border-[#e7eefe]">
        <table className="w-full min-w-[820px] text-left">
          <thead className="bg-[rgba(240,243,255,0.7)]">
            <tr>
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th key={c.key} className="px-3 py-3.5" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]"
                    >
                      {c.label}
                      <Icon className={cn('size-3', active ? 'text-orange-600' : 'text-[#98a2b3]')} />
                    </button>
                  </th>
                );
              })}
              <th className="px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Status</th>
              <th className="px-3 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-[#e7eefe]">
                  <td colSpan={8} className="px-3 py-5">
                    <div className="h-4 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : isError && !data ? (
              <tr className="border-t border-[#e7eefe]">
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-[#555f6f]">
                  Could not load reports.{' '}
                  <button type="button" onClick={() => refetch()} className="font-semibold text-orange-600 hover:underline">
                    Retry
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="border-t border-[#e7eefe]">
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-[#555f6f]">
                  {debouncedSearch ? 'No pending reports match your search.' : 'No pending reports.'}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                  <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]" title={r.id}>
                    {shortId(r.id)}
                  </td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-[#151c27]">{r.studentCode ?? '—'}</td>
                  <td className="px-3 py-4 text-sm font-semibold text-[#151c27]">{r.studentName}</td>
                  <td className="max-w-[240px] px-3 py-4 text-[13px] text-[#555f6f]">
                    <p className="line-clamp-2">{r.reason}</p>
                  </td>
                  <td className="px-3 py-4 text-[13px] font-medium text-[#555f6f]">{r.flaggedCount}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-[#555f6f]">{formatDate(r.createdAt)}</td>
                  <td className="px-3 py-4">
                    <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.02em] text-[#b91c1c]">
                      {r.status}
                    </span>
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

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="pending reports" onChange={setPage} bare />
    </section>
  );
}
