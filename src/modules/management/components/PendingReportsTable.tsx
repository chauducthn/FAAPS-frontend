import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MagnifyingGlass as Search } from '@phosphor-icons/react';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import { useAiReports } from '../hooks/queries/useAdminDashboard';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AiReportSummary } from '../types/admin';

const PAGE_SIZE = 10;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
const shortId = (id: string) => id.slice(0, 8).toUpperCase();

function createPendingReportColumns(): DataTableColumnDef<AiReportSummary>[] {
  return [
    {
      accessorKey: 'id',
      header: 'Report ID',
      cell: ({ row }) => (
        <span className="font-semibold text-[var(--ink-primary)]" title={row.original.id}>
          {shortId(row.original.id)}
        </span>
      ),
    },
    {
      accessorKey: 'studentCode',
      header: 'Student ID (MSSV)',
      cell: ({ row }) => (
        <span className="font-semibold text-[var(--ink-primary)]">
          {row.original.studentCode ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student Name',
      cell: ({ row }) => (
        <span className="font-semibold text-[var(--ink-primary)]">{row.original.studentName}</span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <p className="line-clamp-2 max-w-[240px] text-[var(--ink-muted)]">{row.original.reason}</p>
      ),
    },
    {
      accessorKey: 'flaggedCount',
      header: 'Flagged',
      cell: ({ row }) => (
        <span className="font-medium text-[var(--ink-muted)]">{row.original.flaggedCount}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-[var(--ink-muted)]">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs font-semibold uppercase tracking-[0.02em] text-red-600">
          {row.original.status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <Link
          to={`/admin/ai-reports/${row.original.id}`}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]"
        >
          Report Details
        </Link>
      ),
    },
  ];
}
export function PendingReportsTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search.trim());

  const { data, isLoading, isError, refetch } = useAiReports({
    status: 'PENDING',
    search: debouncedSearch || undefined,
    page,
    size: PAGE_SIZE,
  });

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.totalElements ?? 0;
  const columns = useMemo(() => createPendingReportColumns(), []);

  return (
    <section className="flex flex-col gap-5 rounded-lg bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">Pending AI Responses</h2>
        <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[#b91c1c]">
          {total} pending
        </span>
      </div>

      <label className="flex h-[38px] items-center gap-2 rounded-lg border border-[var(--line)] px-3 focus-within:border-[var(--brand)] focus-within:ring-1 focus-within:ring-[var(--brand-ring)]">
        <Search className="size-4 text-[var(--ink-subtle)]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by Report ID, MSSV, or Student Name"
          aria-label="Search pending reports"
          className="flex-1 bg-transparent text-sm font-medium text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-subtle)]"
        />
      </label>

      {isError && !data ? (
        <div className="rounded-lg border border-[var(--line)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
          Could not load reports.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-semibold text-[var(--brand)] hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          manual
          columns={columns}
          data={rows}
          searchKey="studentName"
          showSearch={false}
          emptyText={
            debouncedSearch ? 'No pending reports match your search.' : 'No pending reports.'
          }
          getRowId={(row) => row.id}
          isLoading={isLoading}
          totalRowCount={total}
          pagination={{ pageIndex: page, pageSize: PAGE_SIZE }}
          onPaginationChange={(next) => setPage(next.pageIndex)}
          showPageSizeSelect={false}
        />
      )}
    </section>
  );
}
