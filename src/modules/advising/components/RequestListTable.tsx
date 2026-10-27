// src/components/advising/RequestListTable.tsx
// Bảng yêu cầu tư vấn của cố vấn — có tab lọc trạng thái và nút Chấp nhận / Từ chối.

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '../../management/components/Pagination';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestTypeLabel } from './RequestTypeLabel';
import { RequestActionModal } from './RequestActionModal';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import type { AdvisingRequest, AdvisingRequestStatus } from '../types/advising';

const PAGE_SIZE = 10;
const th = 'px-3 py-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]';

type TabKey = AdvisingRequestStatus | 'ALL';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'ALL', label: 'All' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
            Unable to load requests.{' '}
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

export function RequestListTable({ search = '' }: { search?: string }) {
  const [tab, setTab] = useState<TabKey>('PENDING');
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<{ request: AdvisingRequest; decision: 'accept' | 'reject' } | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab === 'ALL' ? undefined : tab,
    search: search || undefined,
    page,
    size: PAGE_SIZE,
  });

  const rows = data?.items ?? [];
  const total = data?.totalElements ?? 0;

  const switchTab = (key: TabKey) => {
    setTab(key);
    setPage(0);
  };

  return (
    <>
      <section className="rounded-xl bg-white shadow-sm">
        <div role="tablist" aria-label="Request status" className="flex flex-wrap gap-1 border-b border-[#e7eefe] p-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => switchTab(t.key)}
              className={cn(
                'rounded-md border-b-2 px-3 py-2 text-sm font-semibold',
                tab === t.key
                  ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]'
                  : 'border-transparent text-[#555f6f] hover:bg-gray-50',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[rgba(240,243,255,0.7)]">
              <tr>
                <th className={th}>Student</th>
                <th className={th}>Type</th>
                <th className={th}>Title</th>
                <th className={th}>Description</th>
                <th className={th}>Submitted</th>
                <th className={th}>Status</th>
                <th className={cn(th, 'text-right')}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || (isError && !data) || rows.length === 0 ? (
                <TableState
                  cols={7}
                  loading={isLoading}
                  error={isError && !data}
                  empty={search ? 'No requests match your search.' : 'No requests found.'}
                  onRetry={() => refetch()}
                />
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-[#e7eefe] hover:bg-gray-50/60">
                    <td className="px-3 py-3.5 text-sm font-semibold text-[#151c27]">
                      {r.studentName}
                      {r.studentCode && (
                        <span className="block text-xs font-normal text-[#555f6f]">{r.studentCode}</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">
                      <RequestTypeLabel requestType={r.requestType} />
                    </td>
                    <td className="max-w-[220px] px-3 py-3.5 text-sm font-semibold text-[#151c27]">
                      <span className="line-clamp-2" title={r.title}>
                        {r.title}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-3 py-3.5 text-[13px] text-[#555f6f]">
                      {r.description ? (
                        <span className="line-clamp-2" title={r.description}>
                          {r.description}
                        </span>
                      ) : (
                        <span className="text-[#98a2b3]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-[13px] text-[#555f6f]">{formatDate(r.createdAt)}</td>
                    <td className="px-3 py-3.5">
                      <RequestStatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex justify-end gap-2">
                        {r.status === 'PENDING' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setActive({ request: r, decision: 'accept' })}
                              className="rounded-lg bg-[#F26F21] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#d95f15]"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => setActive({ request: r, decision: 'reject' })}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[13px] text-[#98a2b3]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="requests" onChange={setPage} />
      </section>

      <RequestActionModal
        request={active?.request ?? null}
        decision={active?.decision ?? 'accept'}
        onClose={() => setActive(null)}
      />
    </>
  );
}
