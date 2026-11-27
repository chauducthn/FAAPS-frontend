import { useMemo, useState } from 'react';
import { CalendarBlank, DownloadSimple as Download, SpinnerGap as Loader2, ArrowsClockwise as RefreshCw, Table } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { buildCsv, csvFilename, downloadCsv, type CsvValue } from '@/shared/lib/csv';
import { AdminTabBar } from '../components/AdminTabBar';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';
import { AppointmentFilters } from '../components/appointments/AppointmentFilters';
import { AppointmentTimeline } from '../components/appointments/AppointmentTimeline';
import { KpiCard } from '../components/appointments/KpiCards';
import type { AppointmentViewMode } from '../components/appointments/ViewToggle';
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
    setSearch(''); setStatus('');
    setAdvisorId(''); setFromDate('');
    setToDate(''); setPagination((p) => ({ ...p, pageIndex: 0 }));
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
      <AdminTabBar
        ariaLabel="Appointment view"
        activeKey={view}
        onChange={setView}
        tabs={[
          { key: 'table', label: 'Table', icon: Table },
          { key: 'timeline', label: 'Timeline', icon: CalendarBlank },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => void exportCsv()}
              disabled={isExporting || (list.data?.totalElements ?? 0) === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => { summary.refetch(); list.refetch(); }}
              disabled={refreshing}
              aria-label="Refresh appointments"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs transition-colors hover:bg-surface-hover disabled:opacity-60"
            >
              <RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </>
        }
      />

      {summary.isError ? (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load appointment totals.
          <button type="button" onClick={() => summary.refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
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

      {list.isError && !list.data && (
        <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load appointments.{' '}
          <button type="button" onClick={() => list.refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-line/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <AppointmentFilters
          search={search} status={status} advisorId={advisorId} advisors={advisors}
          fromDate={fromDate} toDate={toDate} hasFilters={hasFilters}
          onSearchChange={resetPage(setSearch)} onStatusChange={resetPage(setStatus)}
          onAdvisorChange={resetPage(setAdvisorId)} onFromDateChange={resetPage(setFromDate)}
          onToDateChange={resetPage(setToDate)} onClear={clearFilters}
        />

        {view === 'table' ? (
          <DataTable
            className="admin-fill"
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
          <div className="admin-fill overflow-y-auto p-4 sm:p-5">
            <AppointmentTimeline items={items} isLoading={list.isLoading} onOpen={setOpenId} />
          </div>
        )}
      </section>

      <AppointmentDetailModal appointmentId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
