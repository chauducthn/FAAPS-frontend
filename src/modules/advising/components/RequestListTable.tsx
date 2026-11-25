// Advising request list table with status tabs, search filtering, and row actions.

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Pagination } from '../../management/components/Pagination';
import { TableBody, TableHead, TableShell } from '../../../shared/components/common/table/TablePrimitives';
import { RequestActionModal } from './RequestActionModal';
import { RequestTableRow } from './RequestListRow';
import { RequestTableState } from './RequestTableState';
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

export function RequestListTable({ search = '' }: { search?: string }) {
  const [tab, setTab] = useState<TabKey>('PENDING');
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<{ request: AdvisingRequest; decision: 'accept' | 'reject' } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const updateStatus = useUpdateAdvisingRequestStatus();

  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab === 'ALL' ? undefined : tab,
    search: search || undefined,
  });

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
      if (tab === 'RESOLVED') {
        if (request.status !== 'RESOLVED' && request.status !== 'CANCELLED') return false;
      } else if (tab !== 'ALL' && request.status !== tab) {
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

  const handleInProgress = async (request: AdvisingRequest) => {
    if (processingId) return;
    setMenuOpenId(null);
    setProcessingId(request.id);
    try {
      await updateStatus.mutateAsync({ id: request.id, body: { status: 'IN_PROGRESS' } });
    } catch {
      // Error feedback is handled by the mutation hook.
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div>
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
          <TableShell>
            <thead>
              <tr>
                <TableHead className="whitespace-nowrap">Student</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="whitespace-nowrap">Submitted</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead align="right" className="whitespace-nowrap">
                  Actions
                </TableHead>
              </tr>
            </thead>
            <TableBody>
              {isLoading || (isError && !data) || rows.length === 0 ? (
                <RequestTableState
                  cols={6}
                  loading={isLoading}
                  error={isError && !data}
                  empty={search ? 'No requests match your search.' : 'No requests found.'}
                  searching={search.trim().length > 0}
                  onRetry={() => refetch()}
                />
              ) : (
                rows.map((r) => (
                  <RequestTableRow
                    key={r.id}
                    request={r}
                    busy={processingId === r.id}
                    menuOpen={menuOpenId === r.id}
                    menuRef={menuRef}
                    onToggleMenu={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                    onAccept={() => setActive({ request: r, decision: 'accept' })}
                    onInProgress={() => handleInProgress(r)}
                    onReject={() => {
                      setMenuOpenId(null);
                      setActive({ request: r, decision: 'reject' });
                    }}
                  />
                ))
              )}
            </TableBody>
          </TableShell>
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
