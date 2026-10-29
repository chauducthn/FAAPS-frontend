import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import {
  APPOINTMENT_STATUSES,
  AppointmentAvatar,
  AppointmentStatusBadge,
  CalendarTile,
  formatSlotDay,
  formatSlotTimeRange,
} from '../components/AppointmentBits';
import { AppointmentFilters } from '../components/appointments/AppointmentFilters';
import { AppointmentTimeline } from '../components/appointments/AppointmentTimeline';
import { KPI_METRICS, KpiCard } from '../components/appointments/KpiCards';
import { ViewActionButton } from '../components/appointments/ViewActionButton';
import { ViewToggle, type AppointmentViewMode } from '../components/appointments/ViewToggle';
import { useAppointmentSummary, useAppointments } from '../hooks/queries/useAdminAppointments';
import { useAssignmentAdvisors } from '../hooks/queries/useAdminAssignments';
import { DataTable, type DataTableColumnDef } from '../../../shared/components/common/DataTable';
import type { PaginationState } from '@tanstack/react-table';
import type { Appointment, AppointmentStatus } from '../types/admin';

const PAGE_SIZE = 10;

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AppointmentStatus | ''>('');
  const [advisorId, setAdvisorId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [view, setView] = useState<AppointmentViewMode>('table');

  const summary = useAppointmentSummary();
  const advisorsQuery = useAssignmentAdvisors();
  const list = useAppointments({
    status: status || undefined,
    search: search || undefined,
    advisorId: advisorId || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const items = list.data?.items ?? [];
  const advisors = advisorsQuery.data ?? [];
  const hasFilters = !!status || !!search || !!advisorId || !!fromDate || !!toDate;
  const refreshing = summary.isFetching || list.isFetching;

  /** Any change of the query must start again on the first page. */
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setAdvisorId('');
    setFromDate('');
    setToDate('');
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const columns = useMemo<DataTableColumnDef<Appointment>[]>(
    () => [
      {
        accessorKey: 'studentName',
        header: 'Student',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <AppointmentAvatar name={row.original.studentName} />
            <span className="truncate font-semibold text-[#151c27]">
              {row.original.studentName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'advisorName',
        header: 'Advisor',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <AppointmentAvatar name={row.original.advisorName} kind="advisor" />
            <span className="truncate text-[#151c27]">{row.original.advisorName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'scheduledAt',
        header: 'Date & Time',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <CalendarTile />
            <div className="min-w-0">
              <p className="whitespace-nowrap text-[13px] font-semibold text-[#151c27]">
                {formatSlotDay(row.original.scheduledAt)}
              </p>
              <p className="whitespace-nowrap text-[12px] tabular-nums text-[#5b6577]">
                {formatSlotTimeRange(row.original)}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <AppointmentStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ViewActionButton
              label={row.original.studentName}
              onClick={() => setOpenId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const metrics = useMemo(
    () =>
      KPI_METRICS.map((metric) => {
        const summaryData = summary.data;
        let raw: number | undefined;
        switch (metric.key) {
          case 'total':
            raw = summaryData?.total;
            break;
          case 'SCHEDULED':
            raw = summaryData?.scheduled;
            break;
          case 'COMPLETED':
            raw = summaryData?.completed;
            break;
          case 'CANCELLED':
            raw = summaryData?.cancelled;
            break;
          case 'NO_SHOW':
            raw = summaryData?.noShow;
            break;
        }

        return {
          ...metric,
          value: raw,
          delta: summaryData?.deltas?.[metric.key] ?? null,
        };
      }),
    [summary.data],
  );

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-[#151c27]">
            Appointments Oversight
          </h1>
          <p className="mt-1 text-[13px] text-[#555f6f]">
            Track advising sessions across every cohort, advisor and outcome.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <button
            type="button"
            onClick={() => {
              summary.refetch();
              list.refetch();
            }}
            disabled={refreshing}
            aria-label="Refresh appointments"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] font-semibold text-[#555f6f] transition-colors hover:bg-[#f7f8fa] hover:text-[#151c27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37021]/40 disabled:opacity-60"
          >
            <RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* KPI cards */}
      {summary.isError ? (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load appointment totals.
          <button
            type="button"
            onClick={() => summary.refetch()}
            className="font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {metrics.map((metric) => (
            <KpiCard key={metric.key} metric={metric} />
          ))}
        </div>
      )}

      {list.isError && !list.data && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Could not load appointments.{' '}
          <button
            type="button"
            onClick={() => list.refetch()}
            className="font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <AppointmentFilters
        search={search}
        status={status}
        advisorId={advisorId}
        advisors={advisors}
        fromDate={fromDate}
        toDate={toDate}
        hasFilters={hasFilters}
        onSearchChange={resetPage(setSearch)}
        onStatusChange={resetPage(setStatus)}
        onAdvisorChange={resetPage(setAdvisorId)}
        onFromDateChange={resetPage(setFromDate)}
        onToDateChange={resetPage(setToDate)}
        onClear={clearFilters}
      />

      {/* Table or timeline */}
      {view === 'table' ? (
        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(20,32,51,0.04)] sm:p-5">
          <DataTable
            manual
            columns={columns}
            data={items}
            searchKey="studentName"
            showSearch={false}
            emptyText={hasFilters ? 'No appointments match your filters.' : 'No appointments yet.'}
            getRowId={(row) => row.id}
            isLoading={list.isLoading}
            totalRowCount={list.data?.totalElements ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-[0_1px_2px_rgba(20,32,51,0.04)] sm:p-5">
          <AppointmentTimeline items={items} isLoading={list.isLoading} onOpen={setOpenId} />
        </section>
      )}

      <AppointmentDetailModal appointmentId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
