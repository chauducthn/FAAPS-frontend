import { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { APPOINTMENT_STATUS_LABEL, AppointmentStatusBadge, formatSlot } from '../components/AppointmentBits';
import { Pagination } from '../components/Pagination';
import { useAppointmentSummary, useAppointments } from '../hooks/queries/useAdminAppointments';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AppointmentStatus } from '../types/admin';

const PAGE_SIZE = 10;
const STATUSES = Object.keys(APPOINTMENT_STATUS_LABEL) as AppointmentStatus[];
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

function SummaryCard({ label, value, isLoading }: { label: string; value?: number; isLoading: boolean }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-[#555f6f]">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-1 text-3xl font-bold text-[#151c27]">{value === undefined ? '—' : value.toLocaleString('en-US')}</p>
      )}
    </div>
  );
}

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AppointmentStatus | ''>('');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search.trim());
  const summary = useAppointmentSummary();
  const list = useAppointments({ status: status || undefined, search: debouncedSearch || undefined, page, size: PAGE_SIZE });

  const items = list.data?.items ?? [];
  const hasFilters = !!status || !!search;
  const refreshing = summary.isFetching || list.isFetching;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#555f6f]">Reports &amp; Statistics / Appointments</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Appointments Oversight</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            summary.refetch();
            list.refetch();
          }}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} />
          Refresh
        </button>
      </div>

      {summary.isError ? (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load appointment totals.
          <button type="button" onClick={() => summary.refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <SummaryCard label="Total sessions" value={summary.data?.total} isLoading={summary.isLoading} />
          <SummaryCard label="Scheduled" value={summary.data?.scheduled} isLoading={summary.isLoading} />
          <SummaryCard label="Completed" value={summary.data?.completed} isLoading={summary.isLoading} />
          <SummaryCard label="Cancelled" value={summary.data?.cancelled} isLoading={summary.isLoading} />
          <SummaryCard label="No-show" value={summary.data?.noShow} isLoading={summary.isLoading} />
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <label className="flex h-[38px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
          <Search className="size-4 text-[#98a2b3]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by student name, advisor, or topic keyword..."
            aria-label="Search appointments"
            className="flex-1 bg-transparent text-sm font-medium text-[#151c27] outline-none placeholder:text-[#98a2b3]"
          />
        </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as AppointmentStatus | '');
            setPage(0);
          }}
          aria-label="Filter by status"
          className="h-[38px] rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#151c27] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="">Status: All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {APPOINTMENT_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearch('');
            setStatus('');
            setPage(0);
          }}
          className="h-[38px] rounded-lg px-3 text-sm font-medium text-[#555f6f] hover:bg-gray-50 disabled:opacity-40"
        >
          Clear filters
        </button>
      </section>

      <section className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className={th}>Slot time</th>
                <th className={th}>Student</th>
                <th className={th}>Advisor</th>
                <th className={th}>Consultation topic</th>
                <th className={th}>Location</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-[#e7eefe]">
                    <td colSpan={7} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : list.isError && !list.data ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    Could not load appointments.{' '}
                    <button type="button" onClick={() => list.refetch()} className="font-semibold text-orange-600 hover:underline">
                      Retry
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="border-t border-[#e7eefe]">
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#555f6f]">
                    {hasFilters ? 'No appointments match your filters.' : 'No appointments yet.'}
                  </td>
                </tr>
              ) : (
                items.map((a) => (
                  <tr key={a.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-3 py-4 text-[13px] font-semibold text-[#151c27]">{formatSlot(a)}</td>
                    <td className="px-3 py-4 text-sm font-medium text-[#151c27]">{a.studentName}</td>
                    <td className="px-3 py-4 text-sm text-[#151c27]">{a.advisorName}</td>
                    <td className="max-w-[260px] px-3 py-4 text-[13px] text-[#555f6f]">
                      <p className="line-clamp-2">{a.agenda || '—'}</p>
                    </td>
                    <td className="px-3 py-4 text-[13px] text-[#555f6f]">{a.location || '—'}</td>
                    <td className="px-3 py-4">
                      <AppointmentStatusBadge status={a.status} />
                    </td>
                    <td className="px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenId(a.id)}
                        className="text-[13px] font-semibold text-[#f37021] underline-offset-2 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={list.data?.totalElements ?? 0} noun="appointments" onChange={setPage} />
      </section>

      <AppointmentDetailModal appointmentId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
