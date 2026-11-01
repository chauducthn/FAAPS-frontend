// src/components/advising/RequestListTable.tsx
// Bảng yêu cầu tư vấn — SIMPLIFIED (audit 37/100):
// 1 nút chính Accept + menu More (In Progress / Reject), 3 kiểu nút duy nhất,
// chữ body tối thiểu 14px, hàng thoáng px-6 py-5.

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Hourglass, Inbox, Loader2, MoreHorizontal, SearchX, XCircle } from 'lucide-react';
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
          <tr key={i} className="border-b border-slate-100 last:border-b-0">
            <td colSpan={cols} className="px-6 py-6">
              <div className="h-4 animate-pulse rounded-lg bg-slate-100" style={{ width: `${55 + (i % 3) * 15}%` }} />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <tr>
      <td colSpan={cols}>
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            {error ? <Inbox className="size-5" aria-hidden /> : searching ? <SearchX className="size-5" aria-hidden /> : <Inbox className="size-5" aria-hidden />}
          </span>
          {error ? (
            <>
              <p className="text-base font-bold text-slate-900">Unable to load requests.</p>
              <button type="button" onClick={onRetry} className="inline-flex h-11 items-center px-4 text-sm font-bold text-orange-700 hover:underline">
                Try again
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-slate-900">{empty ?? 'No requests found.'}</p>
              <p className="text-sm font-medium text-slate-600">
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const updateStatus = useUpdateAdvisingRequestStatus();

  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab === 'ALL' ? undefined : tab,
    search: search || undefined,
  });

  // Đóng menu More khi click ra ngoài / nhấn Escape.
  useEffect(() => {
    if (!menuOpenId) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpenId(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpenId]);

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

  const total = filtered.length;
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const switchTab = (key: TabKey) => {
    setTab(key);
    setPage(0);
  };

  const handleInProgress = async (request: AdvisingRequest) => {
    if (processingId) return;
    setMenuOpenId(null);
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
        {/* Tabs — Primary khi active, Secondary khi inactive (trong 3 kiểu nút chuẩn) */}
        <div role="tablist" aria-label="Request status" className="flex flex-wrap items-center gap-3">
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
                  'inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold ring-1 ring-inset transition-all',
                  activeTab
                    ? 'bg-[#F26F21] text-white ring-[#F26F21] shadow-sm'
                    : 'bg-white text-slate-700 ring-slate-200 hover:border-[#F26F21]/40 hover:bg-[#fff7f0] hover:text-slate-900',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Student</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Type</th>
                <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Title</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Submitted</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Status</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  const menuOpen = menuOpenId === r.id;
                  return (
                    <tr key={r.id} className="bg-white transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden
                            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F26F21] to-[#ff9a4d] text-sm font-extrabold text-white shadow-sm"
                          >
                            {initialsOf(r.studentName)}
                          </span>
                          <div className="min-w-0">
                            <p className="block max-w-full truncate text-sm font-bold text-slate-900">
                              {r.studentName}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-medium text-slate-600">
                              {r.studentCode ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-40 px-6 py-5 text-sm font-medium text-slate-700">
                        <span className="block truncate" title={r.description ?? undefined}>
                          <RequestTypeLabel requestType={r.requestType} />
                        </span>
                        {r.description && (
                          <span className="mt-1 block max-w-40 truncate text-sm font-normal text-slate-600" title={r.description}>
                            {r.description}
                          </span>
                        )}
                      </td>
                      <td className="max-w-[220px] px-6 py-5 text-sm font-bold text-slate-900">
                        <span className="line-clamp-2 leading-snug" title={r.title}>
                          {r.title}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium tabular-nums text-slate-700">{formatDate(r.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-5">
                        <RequestStatusBadge status={r.status} className="px-3 py-1 text-xs font-bold" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'PENDING' || r.status === 'IN_PROGRESS' ? (
                            <>
                              {/* 1 hành động chính duy nhất — Primary */}
                              <button
                                type="button"
                                onClick={() => setActive({ request: r, decision: 'accept' })}
                                className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#F26F21] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14]"
                              >
                                <CheckCircle2 className="size-4" aria-hidden />
                                {r.status === 'PENDING' ? 'Accept' : 'Resolve'}
                              </button>
                              {/* Hành động phụ gom vào menu More — Secondary/Ghost */}
                              <div
                                className="relative"
                                ref={menuOpen ? menuRef : undefined}
                              >
                                <button
                                  type="button"
                                  aria-haspopup="menu"
                                  aria-expanded={menuOpen}
                                  aria-label={`More actions for ${r.studentName}`}
                                  onClick={() => setMenuOpenId(menuOpen ? null : r.id)}
                                  className={cn(
                                    'inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-white text-slate-700 shadow-sm transition-colors',
                                    menuOpen
                                      ? 'border-[#F26F21]/50 bg-[#fff7f0] text-[#F26F21]'
                                      : 'border-slate-200 hover:border-[#F26F21]/40 hover:bg-[#fff7f0] hover:text-slate-900',
                                  )}
                                >
                                  <MoreHorizontal className="size-5" aria-hidden />
                                </button>
                                {menuOpen && (
                                  <div
                                    role="menu"
                                    aria-label="More actions"
                                    className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
                                  >
                                    {r.status === 'PENDING' && (
                                      <button
                                        type="button"
                                        role="menuitem"
                                        disabled={busy}
                                        onClick={() => handleInProgress(r)}
                                        className="flex h-11 w-full items-center gap-2.5 px-4 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                      >
                                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Hourglass className="size-4 text-slate-500" aria-hidden />}
                                        {busy ? 'Saving…' : 'Mark in progress'}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        setActive({ request: r, decision: 'reject' });
                                      }}
                                      className="flex h-11 w-full items-center gap-2.5 px-4 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                                    >
                                      <XCircle className="size-4" aria-hidden />
                                      Reject request
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="inline-flex h-11 items-center text-sm font-medium text-slate-600">—</span>
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

        <div className="mt-5">
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} noun="requests" onChange={setPage} bare />
        </div>
      </div>

      <RequestActionModal
        request={active?.request ?? null}
        decision={active?.decision ?? 'accept'}
        onClose={() => setActive(null)}
      />
    </>
  );
}
