import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { useAiReports } from '../../ai/hooks/queries/useAdminAiReports';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AiReportStatus } from '../types/admin';
import { REPORT_PAGE_SIZE } from './ai/reportConstants';
import { AiReportsFilterBar, AiReportsTable, StatusCard } from './ai/AiReportsComponents';

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
  // Cheap one-row queries just to read the totals for the header.
  const pending = useAiReports({ status: 'PENDING', page: 0, size: 1 });
  const resolved = useAiReports({ status: 'RESOLVED', page: 0, size: 1 });
  const dismissed = useAiReports({ status: 'DISMISSED', page: 0, size: 1 });
  const counts = [pending, resolved, dismissed].map((q) => q.data?.totalElements);
  const total = counts.every((c) => c !== undefined)
    ? counts.reduce((a, b) => (a ?? 0) + (b ?? 0), 0)
    : undefined;

  const items = list.data?.items ?? [];
  const hasFilters = !!search || status !== 'PENDING';

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#555f6f]">AI / Reported AI Responses</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Reported AI Responses</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#555f6f]">
            {total ?? '–'} reports
            <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-bold uppercase text-[#b91c1c]">
              {pending.data?.totalElements ?? '–'} pending
            </span>
            <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-bold uppercase text-[#047857]">
              {resolved.data?.totalElements ?? '–'} resolved
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold uppercase text-[#555f6f]">
              {dismissed.data?.totalElements ?? '–'} dismissed
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          label="Pending"
          value={pending.data?.totalElements}
          icon={AlertTriangle}
          tone="red"
          hint="Requires review and action"
        />
        <StatusCard
          label="Resolved"
          value={resolved.data?.totalElements}
          icon={CheckCircle2}
          tone="green"
          hint="Root cause resolved"
        />
        <StatusCard
          label="Dismissed"
          value={dismissed.data?.totalElements}
          icon={XCircle}
          tone="gray"
          hint="Closed without changes"
        />
      </div>

      <AiReportsFilterBar
        search={search}
        status={status}
        hasFilters={hasFilters}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(0);
        }}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(0);
        }}
        onClear={() => {
          setSearch('');
          setStatus('PENDING');
          setPage(0);
        }}
      />

      <section className="rounded-xl bg-white shadow-sm">
        <AiReportsTable
          items={items}
          isLoading={list.isLoading}
          isError={list.isError}
          hasData={!!list.data}
          debouncedSearch={debouncedSearch}
          onRetry={() => list.refetch()}
        />
        <Pagination
          page={page}
          pageSize={REPORT_PAGE_SIZE}
          total={list.data?.totalElements ?? 0}
          noun="reports"
          onChange={setPage}
        />
      </section>
    </div>
  );
}
