// Advisor ticket queue: status tabs, scope filter, the shared ticket table and the chat modal.

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Pagination } from '../../management/components/Pagination';
import { TableBody, TableHead, TableShell } from '../../../shared/components/common/table/TablePrimitives';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { AdvisorRequestDetailModal } from './AdvisorRequestDetailModal';
import { RequestTableRow } from './RequestListRow';
import { RequestListToolbar, type RequestTabKey } from './RequestListToolbar';
import { RequestTableState } from './RequestTableState';
import { useAdvisorAdvisingRequests } from '../hooks/queries/useAdvisorQueries';
import { useRequestDeepLink } from '../hooks/useRequestDeepLink';
import { advisorService } from '../services/advisorService';
import type { AdvisingRequest, AdvisingRequestScope } from '../types/advising';

const PAGE_SIZE = 10;
const CLOSED = new Set(['RESOLVED', 'REJECTED', 'CANCELLED']);
const COLUMNS = ['Student', 'Type', 'Title', 'Submitted', 'Status', 'Major Group', 'Handled by'];

function matchesTab(request: AdvisingRequest, tab: RequestTabKey) {
  return tab === 'RESOLVED' ? CLOSED.has(request.status) : request.status === tab;
}

function matchesKeyword(request: AdvisingRequest, keyword: string) {
  if (!keyword) return true;
  return (
    request.title?.toLowerCase().includes(keyword) ||
    request.studentName?.toLowerCase().includes(keyword) ||
    (request.studentCode ?? '').toLowerCase().includes(keyword)
  );
}

export function RequestListTable({ search = '' }: { search?: string }) {
  const [tab, setTab] = useState<RequestTabKey>('PENDING');
  const [scope, setScope] = useState<AdvisingRequestScope>('ALL');
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<AdvisingRequest | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  useRequestDeepLink(setActive);

  const { data, isLoading, isError, refetch } = useAdvisorAdvisingRequests({
    status: tab,
    search: search || undefined,
    scope,
  });

  // The backend filters too; filtering again keeps the view right if it ignores a parameter.
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (data ?? []).filter(
      (r) => matchesTab(r, tab) && (scope !== 'MINE' || r.participatedByMe) && matchesKeyword(r, keyword),
    );
  }, [data, tab, search, scope]);

  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  /** Claiming does not lock the ticket: other advisors can still reply in the thread. */
  const claim = async (request: AdvisingRequest) => {
    if (claimingId) return;
    setClaimingId(request.id);
    try {
      await advisorService.claimRequest(request.id);
      toast.success('Request claimed', { description: 'You can now chat with the student.' });
      await refetch();
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
        <RequestListToolbar
          tab={tab}
          scope={scope}
          onTab={(next) => {
            setTab(next);
            setPage(0);
          }}
          onScope={(next) => {
            setScope(next);
            setPage(0);
          }}
        />

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <TableShell>
            <thead>
              <tr>
                {COLUMNS.map((label) => (
                  <TableHead key={label} className={label === 'Title' ? undefined : 'whitespace-nowrap'}>
                    {label}
                  </TableHead>
                ))}
                <TableHead align="right" className="whitespace-nowrap">
                  Actions
                </TableHead>
              </tr>
            </thead>
            <TableBody>
              {isLoading || (isError && !data) || rows.length === 0 ? (
                <RequestTableState
                  cols={COLUMNS.length + 1}
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
                    claiming={claimingId === r.id}
                    onClaim={() => void claim(r)}
                    onOpen={() => setActive(r)}
                  />
                ))
              )}
            </TableBody>
          </TableShell>
        </div>

        <div className="mt-5">
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="requests" onChange={setPage} bare />
        </div>
      </div>

      <AdvisorRequestDetailModal request={active} onClose={() => setActive(null)} />
    </>
  );
}
