// src/components/advising/RequestListTable.tsx
// Bảng yêu cầu tư vấn của cố vấn — pill tabs + DataTable-style rows + 3 nút PENDING.
// Đồng bộ 1-1 với My Students / Appointments: avatar gradient, badge pill, action cam FPT.
//
// API `GET /advisor/advising-requests` trả về mảng thô, nên lọc theo status/từ khoá
// và phân trang đều thực hiện phía client (cắt mảng bằng slice).

import { useMemo, useState } from 'react';
import { CheckCircle2, Hourglass, Inbox, Loader2, SearchX, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '../../management/components/Pagination';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestTypeLabel } from './RequestTypeLabel';
import { RequestActionModal } from './RequestActionModal';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { useUpdateAdvisingRequestStatus } from '../hooks/mutations/useAdvisingMutations';
import type { AdvisingRequest, AdvisingRequestStatus } from '../types/advising';

const PAGE_SIZE = 10;

type TabKey = AdvisingRequestStatus | 'ALL';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'ALL', label: 'All' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function TableState({
  cols,
  loading,
  error,
  empty,
  searching,
  onRetry,
}: {
  cols: number;
  loading: boolean;
  error: boolean;
  empty: string | null;
  searching: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="h-12 border-b border-slate-100">
            <td colSpan={cols} className="px-4 py-3">
              <div className="h-3.5 animate-pulse rounded bg-slate-100" style={{ width: `${55 + (i % 3) * 15}%` }} />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            {error ? <Inbox className="size-5" aria-hidden /> : searching ? <SearchX className="size-5" aria-hidden /> : <Inbox className="size-5" aria-hidden />}
          </span>
          {error ? (
            <>
              <p className="text-sm font-semibold text-[#151c27]">Unable to load requests.</p>
              <button type="button" onClick={onRetry} className="text-[13px] font-semibold text-orange-600 hover:underline">
                Try again
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#151c27]">{empty ?? 'No requests found.'}</p>
              <p className="text-[13px] text-slate-500">
                {searching ? 'Try a different keyword or switch tabs.' : 'There is no data to display yet.'}
              </p>
            </>
          )}
        </div>
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
  const [processingId, setProcessingId] = useState<string | null>(null);
  const updateStatus = useUpdateAdvisingRequestStatus();

  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab === 'ALL' ? undefined : tab,
    search: search || undefined,
  });

  // Lọc + tìm kiếm phía client (API trả về mảng thô).
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (data ?? []).filter((request) => {
      if (tab !== 'ALL' && request.status !== tab) return false;
      if (!keyword) return true;
      return (
        request.title.toLowerCase().includes(keyword) ||
        request.studentName.toLowerCase().includes(keyword) ||
        (request.studentCode ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [data, tab, search]);

  // Phân trang phía client.
  const total = filtered.length;
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const switchTab = (key: TabKey) => {
    setTab(key);
    setPage(0);
  };

  const handleInProgress = async (request: AdvisingRequest) => {
    if (processingId) return;
    setProcessingId(request.id);
    try {
      await updateStatus.mutateAsync({ id: request.id, body: { status: 'IN_PROGRESS' } });
    } catch {
      // Toast lỗi đã bắn từ mutation; giữ nguyên hàng để thử lại.
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div>
        {/* Pill tabs — đồng bộ Appointments Upcoming/History + My Students chips */}
        <div role="tablist" aria-label="Request status" className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const activeTab = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={activeTab}
                onClick={() => switchTab(t.key)}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ring-1 ring-inset transition-colors',
                  activeTab
                    ? 'bg-[#F26F21] text-white ring-[#F26F21]'
                    : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Student</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Type</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Title</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Submitted</th>
                <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Status</th>
                <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || (isError && !data) || rows.length === 0 ? (
                <TableState
                  cols={6}
                  loading={isLoading}
                  error={isError && !data}
                  empty={search ? 'No requests match your search.' : 'No requests found.'}
                  searching={search.trim().length > 0}
                  onRetry={() => refetch()}
                />
              ) : (
                rows.map((r) => {
                  const busy = processingId === r.id;
                  return (
                    <tr key={r.id} className="h-12 border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-[13px] font-bold text-white shadow-sm"
                          >
                            {initialsOf(r.studentName)}
                          </span>
                          <div className="min-w-0">
                            <p className="block max-w-full truncate text-sm font-semibold text-[#151c27]">
                              {r.studentName}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {r.studentCode ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-36 px-4 py-3 text-[13px] text-slate-600">
                        <span className="block truncate" title={r.description ?? undefined}>
                          <RequestTypeLabel requestType={r.requestType} />
                        </span>
                        {r.description && (
                          <span className="mt-0.5 block max-w-36 truncate text-xs text-slate-400" title={r.description}>
                            {r.description}
                          </span>
                        )}
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-sm font-semibold text-[#151c27]">
                        <span className="line-clamp-2" title={r.title}>
                          {r.title}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13px] text-slate-600">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <RequestStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {r.status === 'PENDING' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleInProgress(r)}
                                disabled={busy}
                                title="Tiếp nhận xử lý — chuyển sang In progress"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:opacity-50"
                              >
                                {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Hourglass className="size-3.5" aria-hidden />}
                                {busy ? 'Saving…' : 'In Progress'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setActive({ request: r, decision: 'accept' })}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
                              >
                                <CheckCircle2 className="size-3.5" aria-hidden />
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setActive({ request: r, decision: 'reject' })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                              >
                                <XCircle className="size-3.5" aria-hidden />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[13px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="requests" onChange={setPage} bare />
      </div>

      <RequestActionModal
        request={active?.request ?? null}
        decision={active?.decision ?? 'accept'}
        onClose={() => setActive(null)}
      />
    </>
  );
}
