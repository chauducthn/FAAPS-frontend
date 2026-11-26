import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ChartBar as BarChart3, CaretDown as ChevronDown, DownloadSimple as Download, SpinnerGap as Loader2, EnvelopeSimple as Mail, ArrowsClockwise as RefreshCw, MagnifyingGlass as Search, ShieldWarning as ShieldAlert, Users, VideoCamera as Video } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import { AdminTabBar } from '../components/AdminTabBar';
import { AdvisingBreakdownPanel } from '../components/AdvisingBreakdownPanel';
import { advisingReportService, type AdvisorEffectivenessRow } from '../services/advising-report.service';

type SortKey = 'completed' | 'assigned' | 'pending' | 'name';

function ReportStatTile({
  icon, label, value, meta, tone, loading,
}: {
  icon: ReactNode; label: string; value: string; meta: string;
  tone: 'orange' | 'emerald' | 'blue' | 'amber'; loading: boolean;
}) {
  const iconTone = { orange: 'bg-orange-50 text-[#C2410C]', emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-700' }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        {loading ? <div className="mt-1 h-5 w-16 animate-pulse rounded bg-gray-100" /> : (
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold leading-none tabular-nums text-gray-900">{value}</span>
            <span className="truncate text-xs text-gray-400">{meta}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdvisingReports() {
  const navigate = useNavigate();
  const [semesterId, setSemesterId] = useState<string>('');
  const [reportTab, setReportTab] = useState<'all' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('completed');
  const [isExporting, setIsExporting] = useState(false);

  const semestersQuery = useQuery({ queryKey: ['admin', 'semesters'], queryFn: advisingReportService.getSemesters });
  const overviewQuery = useQuery({
    queryKey: ['admin', 'advising-reports', 'overview', semesterId],
    queryFn: () => advisingReportService.getOverview(semesterId || undefined),
  });
  const advisorsQuery = useQuery({
    queryKey: ['admin', 'advising-reports', 'by-advisor', semesterId],
    queryFn: () => advisingReportService.getByAdvisor(semesterId || undefined),
  });

  const pendingAdvisorCount = useMemo(
    () => (advisorsQuery.data ?? []).filter((r) => r.pendingRequests > 0).length,
    [advisorsQuery.data],
  );

  const filteredAdvisors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (advisorsQuery.data ?? []).filter(
      (r) =>
        (reportTab === 'all' || r.pendingRequests > 0) &&
        (!q || r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)),
    );
    return [...list].sort((a, b) => {
      if (sortBy === 'assigned') return b.assignedStudents - a.assignedStudents;
      if (sortBy === 'pending') return b.pendingRequests - a.pendingRequests;
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      return b.completedSessions - a.completedSessions || a.fullName.localeCompare(b.fullName);
    });
  }, [advisorsQuery.data, reportTab, search, sortBy]);

  const columns: StaticColumn<AdvisorEffectivenessRow>[] = useMemo(() => [
    {
      key: 'advisor', header: 'Advisor',
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {row.fullName}<span className="block text-xs font-normal text-gray-500">{row.email}</span>
        </span>
      ),
    },
    { key: 'assignedStudents', header: 'Assigned Students', align: 'right', render: (r) => <span className="tabular-nums">{r.assignedStudents}</span> },
    { key: 'completedSessions', header: 'Completed Sessions', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-emerald-700">{r.completedSessions}</span> },
    { key: 'emailOutreaches', header: 'Email Outreaches', align: 'right', render: (r) => <span className="tabular-nums">{r.emailOutreaches}</span> },
    { key: 'pendingRequests', header: 'Pending Requests', align: 'right', render: (r) => <span className={r.pendingRequests > 0 ? 'font-semibold tabular-nums text-amber-700' : 'tabular-nums text-gray-400'}>{r.pendingRequests}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <button type="button" onClick={() => navigate(`/admin/appointments?advisorId=${r.advisorId}`)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#C2410C] transition-colors hover:bg-orange-50">
          Sessions <ArrowUpRight className="size-3.5" />
        </button>
      ),
    },
  ], [navigate]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await advisingReportService.exportCsv(semesterId || undefined);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = `faaps-advising-report-${overviewQuery.data?.semesterCode ?? 'all'}.csv`;
      anchor.click(); URL.revokeObjectURL(url);
      toast.success('Advising report exported to CSV.');
    } catch (error) { toast.error(apiMessage(error)); } finally { setIsExporting(false); }
  };

  const overview = overviewQuery.data;
  const refreshing = overviewQuery.isFetching || advisorsQuery.isFetching;

  return (
    <div className="flex w-full flex-col gap-4">
      <AdminTabBar
        ariaLabel="Advising report filter"
        activeKey={reportTab}
        onChange={setReportTab}
        tabs={[
          { key: 'all', label: 'All advisors', icon: Users, count: advisorsQuery.data?.length, badgeTone: 'slate' },
          { key: 'pending', label: 'With pending', icon: ShieldAlert, count: pendingAdvisorCount, badgeTone: 'amber' },
        ]}
        actions={
          <>
            <div className="relative w-[196px]">
              <select aria-label="Filter by semester" value={semesterId} onChange={(e) => setSemesterId(e.target.value)} className="h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[13px] font-medium text-gray-700 hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15">
                <option value="">All semesters</option>
                {(semestersQuery.data ?? []).map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.code} — {sem.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            <button type="button" onClick={() => { overviewQuery.refetch(); advisorsQuery.refetch(); }} disabled={refreshing} aria-label="Refresh report" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 shadow-2xs hover:bg-gray-50 disabled:opacity-60">
              <RefreshCw className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'} />
            </button>
            <button type="button" onClick={handleExport} disabled={isExporting || overviewQuery.isLoading} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55">
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <ReportStatTile icon={<ShieldAlert className="size-4" />} label="At-risk coverage" value={overview ? `${overview.coverageRate}%` : '—'} meta={overview ? `${overview.contactedAtRisk}/${overview.atRiskStudents} contacted` : ''} tone="orange" loading={overviewQuery.isLoading} />
        <ReportStatTile icon={<BarChart3 className="size-4" />} label="Total sessions" value={overview ? String(overview.totalSessions) : '—'} meta={overview ? `${overview.completedSessions} done · ${overview.noShowSessions} no-show` : ''} tone="emerald" loading={overviewQuery.isLoading} />
        <ReportStatTile icon={<Video className="size-4" />} label="Online / offline" value={overview ? `${overview.onlineSessions} / ${overview.offlineSessions}` : '—'} meta="virtual vs in-person" tone="blue" loading={overviewQuery.isLoading} />
        <ReportStatTile icon={<Mail className="size-4" />} label="Email advising" value={overview ? String(overview.emailSessions) : '—'} meta={overview ? `${overview.totalStudents} tracked` : ''} tone="amber" loading={overviewQuery.isLoading} />
      </div>

      {overviewQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load advising overview metrics.
          <button type="button" onClick={() => overviewQuery.refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      <AdvisingBreakdownPanel overview={overview} loading={overviewQuery.isLoading} />

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[#F26F21]" />
            <h2 className="text-[13px] font-bold text-gray-900">Advisor effectiveness breakdown</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search advisor…" aria-label="Search advisors" className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none" />
            </div>
            <select aria-label="Sort advisors" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 focus:border-[#F26F21] focus:outline-none">
              <option value="completed">Most completed</option>
              <option value="assigned">Most assigned</option>
              <option value="pending">Most pending</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
        <div className="flex h-[calc(100vh-310px)] min-h-[460px] flex-col">
          <StaticTable
            stickyHeader className="min-h-0 flex-1 overflow-auto"
            columns={columns} rows={filteredAdvisors}
            rowKey={(row) => row.advisorId} loading={advisorsQuery.isLoading}
            error={advisorsQuery.isError ? 'Could not load the advisor breakdown.' : undefined}
            emptyTitle={search ? 'No advisors match your search.' : 'No advisor activity recorded for this semester yet.'}
          />
        </div>
      </section>
    </div>
  );
}
