// src/modules/advising/components/RequestListTable.tsx
// The list of advising TICKETS on the Advisor side — a helpdesk queue, NOT a 1-1
// chat with an assigned advisor.
//
//   • Every advisor sees the whole queue.
//   • PENDING     → "Claim request" ⇒ PATCH status = IN_PROGRESS.
//   • IN_PROGRESS → split into "mine" (can reply + resolve) and "someone else's"
//                  (read-only).
//   • RESOLVED    → closed, read-only.
//
// Three tabs: "Pending" (PENDING) · "In Progress" (IN_PROGRESS) · "Resolved" (RESOLVED).
//
// The modal can also be opened from the `?id=<ticketId>` query param — used when the
// advisor clicks a notification whose actionUrl points at a ticket (deep-link).

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CircleCheckBig, Eye, Hand, Inbox, Loader2, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '../../management/components/Pagination';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestTypeLabel } from './RequestTypeLabel';
import { AdvisorRequestDetailModal } from './AdvisorRequestDetailModal';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { advisorService } from '../services/advisorService';
import { useAuth } from '../../auth/stores/useAuth';
import { apiMessage } from '../../../shared/lib/apiMessage';
import type { AdvisingRequest } from '../types/advising';

const PAGE_SIZE = 10;

type TabKey = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
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
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<AdvisingRequest | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const currentUserId = useAuth((state) => state.user?.id);
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
            studyPlanId: null,
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

  // Tab PENDING: NO `advisorId` ⇒ every advisor sees the whole shared queue.
  // Tab IN_PROGRESS: pass `advisorId` to get the tickets this advisor is handling.
  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab,
    search: search || undefined,
    advisorId: tab === 'IN_PROGRESS' ? (currentUserId ?? undefined) : undefined,
  });

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (data ?? []).filter((request) => {
      // The "Resolved" tab also covers CANCELLED (cancelled by the student).
      if (tab === 'RESOLVED') {
        if (request.status !== 'RESOLVED' && request.status !== 'CANCELLED') return false;
      } else if (request.status !== tab) {
        return false;
      }
      if (!keyword) return true;
      return (
        request.title?.toLowerCase().includes(keyword) ||
        request.studentName?.toLowerCase().includes(keyword) ||
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

  /**
   * Claim a PENDING ticket.
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

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Student</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Type</th>
                <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Title</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Submitted</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Status</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Handled by</th>
                <th scope="col" className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.06em] text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading || (isError && !data) || rows.length === 0 ? (
                <TableState
                  cols={7}
                  loading={isLoading}
                  error={isError && !data}
                  empty={search ? 'No requests match your search.' : 'No requests found.'}
                  searching={search.trim().length > 0}
                  onRetry={() => refetch()}
                />
              ) : (
                rows.map((r) => {
                  const busy = claimingId === r.id;
                  // Is this ticket owned by the advisor who is signed in?
                  const isMine = !!r.advisorId && !!currentUserId && r.advisorId === currentUserId;
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
                      <td className="whitespace-nowrap px-6 py-5">
                        {r.status === 'PENDING' ? (
                          <span className="text-sm font-medium text-slate-500">— unclaimed —</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={cn('text-sm font-bold', isMine ? 'text-[#c2410c]' : 'text-slate-900')}>
                              {r.advisorName ?? 'Unknown'}
                            </span>
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
                                  <>
                                    <Eye className="size-4" aria-hidden />
                                    View only
                                  </>
                                )}
                            </button>
                          )}

                          {(r.status === 'RESOLVED' || r.status === 'CANCELLED') && (
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
