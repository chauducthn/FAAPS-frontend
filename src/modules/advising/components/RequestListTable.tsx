// src/modules/advising/components/RequestListTable.tsx
// The list of advising TICKETS on the Advisor side — a helpdesk queue, NOT a 1-1
// chat with an assigned advisor.
//
// Mô hình SHARED MULTI-ADVISOR (không còn gán cứng 1 SV - 1 Advisor):
//   • Mọi cố vấn đều thấy toàn bộ hàng đợi chung.
//   • Nhiều cố vấn có thể CÙNG nhảy vào trả lời cùng 1 thread ⇒ KHÔNG khóa,
//     KHÔNG read-only với người khác, KHÔNG báo lỗi 409 khi có người khác đã claim.
//   • PENDING     → "Claim request" ⇒ PATCH status = IN_PROGRESS.
//   • IN_PROGRESS → ai cũng trả lời được; người giữ ticket mới có nút "Resolve".
//   • RESOLVED / REJECTED / CANCELLED → đã đóng, chỉ xem.
//
// Filter theo phạm vi: "All Requests" (mặc định) · "My Handled" (đang phụ trách
// hoặc từng tham gia). BE hỗ trợ `?scope=ALL|MINE` ⇒ truyền thẳng xuống API.
//
// Trong danh sách hiển thị badge "Same Major Group" nếu API trả `sameMajorGroup: true`
// kèm mã nhóm ngành (`studentMajorGroupCode`).
//
// Three tabs: "Pending" (PENDING) · "In Progress" (IN_PROGRESS) · "Resolved" (RESOLVED).
//
// The modal can also be opened from the `?id=<ticketId>` query param — used when the
// advisor clicks a notification whose actionUrl points at a ticket (deep-link).

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CircleCheckBig, Eye, Hand, Inbox, Loader2, SearchX, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '../../management/components/Pagination';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestTypeLabel } from './RequestTypeLabel';
import { AdvisorRequestDetailModal } from './AdvisorRequestDetailModal';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { advisorService } from '../services/advisorService';
import { apiMessage } from '../../../shared/lib/apiMessage';
import type { AdvisingRequest, AdvisingRequestScope } from '../types/advising';

const PAGE_SIZE = 10;

type TabKey = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
];

/**
 * Filter phạm vi danh sách — tương ứng tham số `scope` của BE.
 *   ALL  : toàn bộ hàng đợi chung (mặc định).
 *   MINE : ticket mình đang phụ trách HOẶC từng tham gia trả lời.
 */
const SCOPES: { key: AdvisingRequestScope; label: string }[] = [
  { key: 'ALL', label: 'All Requests' },
  { key: 'MINE', label: 'My Handled' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

function initialsOf(name: string | null | undefined) {
  return (name ?? '')
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
              <p className="text-base font-bold text-slate-900">Could not load the request list.</p>
              <button type="button" onClick={onRetry} className="inline-flex h-11 cursor-pointer items-center px-4 text-sm font-bold text-orange-700 hover:underline">
                Retry
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
  const [scope, setScope] = useState<AdvisingRequestScope>('ALL');
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<AdvisingRequest | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkId = searchParams.get('id');

  // Deep-link from a notification: `?id=<ticketId>` ⇒ open that ticket's modal.
  // The ticket may sit on any tab ⇒ build a minimal stub, the modal loads the real
  // data via `GET /advisor/advising-requests/{id}`.
  useEffect(() => {
    if (!deepLinkId) return;
    setActive((current) =>
      current?.id === deepLinkId
        ? current
        : ({
            id: deepLinkId,
            studentId: '',
            studentName: null,
            studentCode: null,
            advisorId: null,
            advisorName: null,
            sameMajorGroup: false,
            participatedByMe: false,
            studyPlanId: null,
            linkedAppointmentId: null,
            requestType: 'OTHER',
            title: '',
            description: null,
            status: 'PENDING',
            resolvedAt: null,
            resolutionSummary: null,
            createdAt: '',
            updatedAt: '',
          } as AdvisingRequest),
    );
    // Clear the query param so a refresh does not reopen the same modal.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('id');
        return next;
      },
      { replace: true },
    );
  }, [deepLinkId, setSearchParams]);

  // Mô hình Shared Multi-Advisor: không còn gán cứng 1 SV - 1 Advisor ⇒ không gửi
  // `advisorId` nữa. Thay bằng `scope`:
  //   'ALL'  → BE trả toàn bộ hàng đợi chung.
  //   'MINE' → BE lọc ra ticket mình đang phụ trách HOẶC từng tham gia.
  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab,
    search: search || undefined,
    scope,
  });

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (data ?? []).filter((request) => {
      // The "Resolved" tab also covers REJECTED (advisor refused) and CANCELLED
      // (cancelled by the student).
      if (tab === 'RESOLVED') {
        if (
          request.status !== 'RESOLVED' &&
          request.status !== 'REJECTED' &&
          request.status !== 'CANCELLED'
        )
          return false;
      } else if (request.status !== tab) {
        return false;
      }
      // BE đã lọc theo scope, nhưng vẫn chốt lại client-side để an toàn khi BE
      // chưa hỗ trợ `?scope=` (fallback: chỉ giữ ticket mình phụ trách/tham gia).
      if (scope === 'MINE' && !request.participatedByMe) return false;
      if (!keyword) return true;
      return (
        request.title?.toLowerCase().includes(keyword) ||
        request.studentName?.toLowerCase().includes(keyword) ||
        (request.studentCode ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [data, tab, search, scope]);

  const total = filtered.length;
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const switchTab = (key: TabKey) => {
    setTab(key);
    setPage(0);
  };

  const switchScope = (key: AdvisingRequestScope) => {
    setScope(key);
    setPage(0);
  };

  /**
   * Claim a PENDING ticket.
   *
   * Mô hình Shared Multi-Advisor: việc claim KHÔNG khóa ticket cho riêng mình —
   * nhiều cố vấn vẫn có thể cùng trả lời thread đó. Vì vậy không xử lý riêng
   * lỗi 409 (ticket đã có người nhận) — chỉ hiển thị message từ API.
   *
   * On success → open the chat modal right away so the advisor can continue.
   */
  const claim = async (request: AdvisingRequest) => {
    if (claimingId) return;
    setClaimingId(request.id);
    try {
      await advisorService.claimRequest(request.id);
      toast.success('Request claimed', {
        description: 'You can now chat with the student.',
      });
      await refetch();
      // Open the modal straight away — the ticket now belongs to this advisor.
      setActive({ ...request, status: 'IN_PROGRESS' });
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <>
      <div>
        {/* Tabs — Primary khi active, Secondary khi inactive */}
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
                  'inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-5 text-sm font-bold ring-1 ring-inset transition-all',
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

        {/*
          Filter phạm vi — "All Requests" (mặc định) | "My Handled".
          Được truyền xuống BE qua `?scope=ALL|MINE`; nếu BE chưa hỗ trợ thì
          `filtered` tự lọc client-side theo `participatedByMe`.
        */}
        <div
          role="group"
          aria-label="Request scope"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
            Scope
          </span>
          {SCOPES.map((s) => {
            const activeScope = scope === s.key;
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={activeScope}
                onClick={() => switchScope(s.key)}
                className={cn(
                  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-[13px] font-bold ring-1 ring-inset transition-all',
                  activeScope
                    ? 'bg-slate-900 text-white ring-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 ring-slate-200 hover:border-[#F26F21]/40 hover:bg-[#fff7f0] hover:text-slate-900',
                )}
              >
                {s.key === 'MINE' && <Users className="size-3.5" aria-hidden />}
                {s.label}
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
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Major Group</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Handled by</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || (isError && !data) || rows.length === 0 ? (
                <TableState
                  cols={8}
                  loading={isLoading}
                  error={isError && !data}
                  empty={search ? 'No requests match your search.' : 'No requests found.'}
                  searching={search.trim().length > 0}
                  onRetry={() => refetch()}
                />
              ) : (
                rows.map((r) => {
                  const busy = claimingId === r.id;
                  // Mô hình Shared Multi-Advisor: cố vấn đang đăng nhập có đang
                  // phụ trách / từng tham gia ticket này không (BE trả về).
                  const isMine = r.participatedByMe === true;
                  // BE đánh dấu khi SV cùng nhóm ngành với cố vấn đang đăng nhập.
                  const sameMajorGroup = r.sameMajorGroup === true;
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
                              {r.studentName ?? '—'}
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
                      {/*
                        Nhóm ngành của sinh viên + badge "Same Major Group" khi SV
                        cùng nhóm ngành với cố vấn đang đăng nhập (BE tự suy ra).
                      */}
                      <td className="whitespace-nowrap px-6 py-5">
                        {r.studentMajorGroupCode ? (
                          <span className="block text-sm font-bold tabular-nums text-slate-900">
                            {r.studentMajorGroupCode}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-slate-500">—</span>
                        )}
                        {sameMajorGroup && (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-inset ring-emerald-200">
                            Same Major Group
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5">
                        {r.status === 'PENDING' ? (
                          <span className="text-sm font-medium text-slate-500">— unclaimed —</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={cn('text-sm font-bold', isMine ? 'text-[#c2410c]' : 'text-slate-900')}>
                              {r.advisorName ?? 'Unknown'}
                            </span>
                            {/*
                              Mô hình Shared Multi-Advisor: "Another advisor" KHÔNG còn
                              là read-only — mọi cố vấn đều có thể cùng trả lời
                              thread. Vì vậy nhãn chỉ mô tả ai đang giữ ticket.
                            */}
                            {isMine ? (
                              <span className="text-[11px] font-bold uppercase tracking-wide text-[#c2410c]">Yours</span>
                            ) : (
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Another advisor</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => claim(r)}
                                disabled={busy}
                                className="inline-flex h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#F26F21] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#d95f14] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : (
                                  <Hand className="size-4" aria-hidden />
                                )}
                                {busy ? 'Claiming…' : 'Claim request'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setActive(r)}
                                className="inline-flex h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                              >
                                <Eye className="size-4" aria-hidden />
                                View
                              </button>
                            </>
                          )}

                          {r.status === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={() => setActive(r)}
                              className={cn(
                                'inline-flex h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-5 text-sm font-bold shadow-sm transition-colors',
                                isMine
                                  ? 'bg-[#F26F21] text-white hover:bg-[#d95f14]'
                                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                              )}
                            >
                              {isMine ? (
                                <>
                                  <CircleCheckBig className="size-4" aria-hidden />
                                  Open &amp; reply
                                </>
                              ) : (
                                // Không còn read-only: cố vấn khác vẫn mở được để
                                // cùng trả lời (Shared Multi-Advisor).
                                <>
                                  <Eye className="size-4" aria-hidden />
                                  Open &amp; reply
                                </>
                              )}
                            </button>
                          )}
                          {(r.status === 'RESOLVED' || r.status === 'REJECTED' || r.status === 'CANCELLED') && (
                            <button
                              type="button"
                              onClick={() => setActive(r)}
                              className="inline-flex h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                            >
                              <Eye className="size-4" aria-hidden />
                              View
                            </button>
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

      <AdvisorRequestDetailModal request={active} onClose={() => setActive(null)} />
    </>
  );
}
