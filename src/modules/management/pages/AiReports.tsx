import { useState } from 'react';
import { Warning as AlertTriangle, CheckCircle as CheckCircle2, Flag, XCircle } from '@phosphor-icons/react';
import { AdminTabBar } from '../components/AdminTabBar';
import { Pagination } from '../components/Pagination';
import { useAiReports } from '../../ai/hooks/queries/useAdminAiReports';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AiReportStatus } from '../types/admin';
import { REPORT_PAGE_SIZE } from './ai/reportConstants';
import { AiReportsFilterBar, StatusCard } from './ai/AiReportsComponents';
import { AiReportsTable } from './ai/AiReportsTable';

export default function AiReports() {
  const [status, setStatus] = useState<AiReportStatus | ''>('PENDING');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search.trim());

  const list = useAiReports({
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    size: REPORT_PAGE_SIZE,
  });

  // Cheap one-row queries just to read the totals for the top stat strip.
  const pending = useAiReports({ status: 'PENDING', page: 0, size: 1 });
  const resolved = useAiReports({ status: 'RESOLVED', page: 0, size: 1 });
  const dismissed = useAiReports({ status: 'DISMISSED', page: 0, size: 1 });
  const counts = [pending, resolved, dismissed].map((q) => q.data?.totalElements);
  const total = counts.every((c) => c !== undefined)
    ? counts.reduce((a, b) => (a ?? 0) + (b ?? 0), 0)
    : undefined;

  const items = list.data?.items ?? [];
  const hasFilters = !!search || status !== 'PENDING';

  const selectStatus = (next: AiReportStatus | '') => {
    setStatus(next);
    setPage(0);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <AdminTabBar
        ariaLabel="AI report status tabs"
        activeKey={status || 'ALL'}
        onChange={(next) => selectStatus(next === 'ALL' ? '' : (next as AiReportStatus))}
        tabs={[
          { key: 'ALL', label: 'All reports', icon: Flag, count: total, badgeTone: 'slate' },
          { key: 'PENDING', label: 'Pending', icon: AlertTriangle, count: pending.data?.totalElements, badgeTone: 'red' },
          { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2, count: resolved.data?.totalElements, badgeTone: 'emerald' },
          { key: 'DISMISSED', label: 'Dismissed', icon: XCircle, count: dismissed.data?.totalElements, badgeTone: 'slate' },
        ]}
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatusCard
          label="Total reports"
          value={total}
          icon={Flag}
          tone="slate"
          active={status === ''}
          onClick={() => selectStatus('')}
        />
        <StatusCard
          label="Pending"
          value={pending.data?.totalElements}
          icon={AlertTriangle}
          tone="red"
          hint="needs review"
          active={status === 'PENDING'}
          onClick={() => selectStatus(status === 'PENDING' ? '' : 'PENDING')}
        />
        <StatusCard
          label="Resolved"
          value={resolved.data?.totalElements}
          icon={CheckCircle2}
          tone="green"
          hint="root cause fixed"
          active={status === 'RESOLVED'}
          onClick={() => selectStatus(status === 'RESOLVED' ? '' : 'RESOLVED')}
        />
        <StatusCard
          label="Dismissed"
          value={dismissed.data?.totalElements}
          icon={XCircle}
          tone="gray"
          hint="closed"
          active={status === 'DISMISSED'}
          onClick={() => selectStatus(status === 'DISMISSED' ? '' : 'DISMISSED')}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <AiReportsFilterBar
          search={search}
          status={status}
          hasFilters={hasFilters}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(0);
          }}
          onStatusChange={selectStatus}
          onClear={() => {
            setSearch('');
            setStatus('PENDING');
            setPage(0);
          }}
        />

        <div className="flex h-[calc(100vh-295px)] min-h-[460px] flex-col">
          <div className="min-h-0 flex-1 overflow-auto">
            <AiReportsTable
              items={items}
              isLoading={list.isLoading}
              isError={list.isError}
              hasData={!!list.data}
              debouncedSearch={debouncedSearch}
              onRetry={() => list.refetch()}
            />
          </div>
          <Pagination
            page={page}
            pageSize={REPORT_PAGE_SIZE}
            total={list.data?.totalElements ?? 0}
            noun="reports"
            onChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
