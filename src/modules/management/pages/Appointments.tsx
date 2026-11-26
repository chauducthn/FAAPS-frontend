import { useMemo, useState } from 'react';
import { DownloadSimple as Download, SpinnerGap as Loader2, ArrowsClockwise as RefreshCw } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { buildCsv, csvFilename, downloadCsv, type CsvValue } from '@/shared/lib/csv';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { AppointmentFilters } from '../components/appointments/AppointmentFilters';
import { AppointmentTimeline } from '../components/appointments/AppointmentTimeline';
import { KpiCard } from '../components/appointments/KpiCards';
import { ViewToggle, type AppointmentViewMode } from '../components/appointments/ViewToggle';
import { useAppointmentSummary, useAppointments } from '../hooks/queries/useAdminAppointments';
import { useAssignmentAdvisors } from '../hooks/queries/useAdminAssignments';
import { adminAppointmentService } from '../services/appointment.service';
import { DataTable } from '../../../shared/components/common/DataTable';
import type { PaginationState } from '@tanstack/react-table';
import type { AppointmentStatus } from '../types/admin';
import { buildAppointmentMetrics, createAppointmentColumns } from './appointments/appointmentColumns';

const PAGE_SIZE = 10;

const initialAdvisorParam = () =>
  typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('advisorId') ?? '' : '';

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AppointmentStatus | ''>('');
  const [advisorId, setAdvisorId] = useState(initialAdvisorParam);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const [openId, setOpenId] = useState<string | null>(null);
  const [view, setView] = useState<AppointmentViewMode>('table');
  const [isExporting, setIsExporting] = useState(false);

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

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const page = await adminAppointmentService.getAppointments({
        status: status || undefined, search: search || undefined, advisorId: advisorId || undefined,
        fromDate: fromDate || undefined, toDate: toDate || undefined, page: 0, size: 100,
      });
      if (page.items.length === 0) {
        toast.info('No appointments to export.');
        return;
      }
      const header: CsvValue[] = ['ID', 'Student', 'Advisor', 'Scheduled At', 'Ended At', 'Location', 'Status', 'Agenda', 'Summary'];
      const rows: CsvValue[][] = page.items.map((a) => [
        a.id, a.studentName ?? '', a.advisorName ?? '', a.scheduledAt ?? '', a.endedAt ?? '',
        a.location ?? '', a.status, a.agenda ?? '', a.consultationSummary ?? a.decisionNote ?? '',
      ]);
      downloadCsv(csvFilename('appointments'), buildCsv([{ rows: [header, ...rows] }]));
      toast.success(`Exported ${page.items.length} appointment${page.items.length === 1 ? '' : 's'} to CSV.`);
    } catch {
      toast.error('Failed to export appointments.');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = useMemo(() => createAppointmentColumns(setOpenId), []);
  const metrics = useMemo(() => buildAppointmentMetrics(summary.data), [summary.data]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {summary.isError ? (
          <div className="flex flex-1 items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            Could not load appointment totals.
            <button type="button" onClick={() => summary.refetch()} className="font-semibold hover:underline">Retry</button>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((metric) => {
              const isActive = metric.key === 'total' ? status === '' : status === metric.key;
              return (
                <KpiCard
                  key={metric.key}
                  metric={metric}
                  active={isActive}
                  onClick={() => {
                    const next: AppointmentStatus | '' =
                      metric.key === 'total' ? '' : status === metric.key ? '' : metric.key;
                    resetPage(setStatus)(next);
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <ViewToggle value={view} onChange={setView} />
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={isExporting || (list.data?.totalElements ?? 0) === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => { summary.refetch(); list.refetch(); }}
            disabled={refreshing}
            aria-label="Refresh appointments"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {list.isError && !list.data && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load appointments.{' '}
          <button type="button" onClick={() => list.refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
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

        {view === 'table' ? (
          <DataTable
            className="h-[calc(100vh-295px)] min-h-[460px]"
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
        ) : (
          <div className="h-[calc(100vh-295px)] min-h-[460px] overflow-y-auto p-4 sm:p-5">
            <AppointmentTimeline items={items} isLoading={list.isLoading} onOpen={setOpenId} />
          </div>
        )}
      </section>

      <AppointmentDetailModal appointmentId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
