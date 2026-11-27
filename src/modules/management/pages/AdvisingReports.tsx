import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight, ChartBar as BarChart3, CaretDown as ChevronDown, DownloadSimple as Download,
  SpinnerGap as Loader2, MagnifyingGlassMinus, EnvelopeSimple as Mail, ArrowsClockwise as RefreshCw,
  MagnifyingGlass as Search, ShieldWarning as ShieldAlert, Users, VideoCamera as Video,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { EmptyState } from '../../../shared/components/common/EmptyState';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import { AdminStatTile } from '../components/AdminStatTile';
import { AdminTabBar } from '../components/AdminTabBar';
import { AdvisingBreakdownPanel } from '../components/AdvisingBreakdownPanel';
import { advisingReportService, type AdvisorEffectivenessRow } from '../services/advising-report.service';

type SortKey = 'completed' | 'assigned' | 'pending' | 'name';

const SELECT_CLASS =
  'h-9 w-full appearance-none truncate rounded-md border border-line bg-white pl-3 pr-7 ' +
  'text-[13px] font-medium text-ink-secondary hover:border-ink-subtle/50 ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

export default function AdvisingReports() {
  const navigate = useNavigate();
  const [semesterId, setSemesterId] = useState<string>('');
  const [reportTab, setReportTab] = useState<'all' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('completed');
  const [isExporting, setIsExporting] = useState(false);

  const semestersQuery = useQuery({ queryKey: ['admin', 'semesters'], queryFn: advisingReportService.getSemesters });
  const overviewQuery = useQuery({ queryKey: ['admin', 'advising-reports', 'overview', semesterId], queryFn: () => advisingReportService.getOverview(semesterId || undefined) });
  const advisorsQuery = useQuery({ queryKey: ['admin', 'advising-reports', 'by-advisor', semesterId], queryFn: () => advisingReportService.getByAdvisor(semesterId || undefined) });

  const semesters = useMemo(() => (Array.isArray(semestersQuery.data) ? semestersQuery.data : []), [semestersQuery.data]);
  const advisorRows = useMemo(() => (Array.isArray(advisorsQuery.data) ? advisorsQuery.data : []), [advisorsQuery.data]);
  const pendingAdvisorCount = useMemo(() => advisorRows.filter((r) => r.pendingRequests > 0).length, [advisorRows]);

  const filteredAdvisors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = advisorRows.filter(
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
  }, [advisorRows, reportTab, search, sortBy]);

  const columns: StaticColumn<AdvisorEffectivenessRow>[] = useMemo(() => [
    {
      key: 'advisor', header: 'Advisor',
      render: (row) => (
        <span className="font-semibold text-ink-primary">
          {row.fullName}<span className="block text-xs font-normal text-ink-muted">{row.email}</span>
        </span>
      ),
    },
    { key: 'assignedStudents', header: 'Assigned Students', align: 'right', render: (r) => <span className="tabular-nums">{r.assignedStudents}</span> },
    { key: 'completedSessions', header: 'Completed Sessions', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-emerald-700">{r.completedSessions}</span> },
    { key: 'emailOutreaches', header: 'Email Outreaches', align: 'right', render: (r) => <span className="tabular-nums">{r.emailOutreaches}</span> },
    { key: 'pendingRequests', header: 'Pending Requests', align: 'right', render: (r) => <span className={r.pendingRequests > 0 ? 'font-semibold tabular-nums text-amber-700' : 'tabular-nums text-ink-subtle'}>{r.pendingRequests}</span> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/appointments?advisorId=${r.advisorId}`)}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
        >
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
      anchor.href = url;
      anchor.download = `faaps-advising-report-${overviewQuery.data?.semesterCode ?? 'all'}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
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
          { key: 'all', label: 'All advisors', icon: Users, count: advisorRows.length, badgeTone: 'slate' },
          { key: 'pending', label: 'With pending', icon: ShieldAlert, count: pendingAdvisorCount, badgeTone: 'amber' },
        ]}
        actions={
          <>
            <div className="relative w-[196px]">
              <select aria-label="Filter by semester" value={semesterId} onChange={(e) => setSemesterId(e.target.value)} className={SELECT_CLASS}>
                <option value="">All semesters</option>
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>{sem.code} — {sem.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
            </div>
            <button
              type="button"
              onClick={() => { void overviewQuery.refetch(); void advisorsQuery.refetch(); }}
              disabled={refreshing}
              aria-label="Refresh report"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary shadow-2xs hover:bg-surface-hover disabled:opacity-60"
            >
              <RefreshCw className={refreshing ? 'size-4 animate-spin' : 'size-4'} />
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || overviewQuery.isLoading}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3.5 text-[13px] font-semibold text-white shadow-2xs hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isExporting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
              Export CSV
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <AdminStatTile icon={<ShieldAlert />} label="At-risk coverage" value={overview ? `${overview.coverageRate}%` : '—'} meta={overview ? `${overview.contactedAtRisk}/${overview.atRiskStudents} contacted` : ''} tone="brand" isLoading={overviewQuery.isLoading} />
        <AdminStatTile icon={<BarChart3 />} label="Total sessions" value={overview ? String(overview.totalSessions) : '—'} meta={overview ? `${overview.completedSessions} done · ${overview.noShowSessions} no-show` : ''} tone="success" isLoading={overviewQuery.isLoading} />
        <AdminStatTile icon={<Video />} label="Online / offline" value={overview ? `${overview.onlineSessions} / ${overview.offlineSessions}` : '—'} meta="virtual vs in-person" tone="neutral" isLoading={overviewQuery.isLoading} />
        <AdminStatTile icon={<Mail />} label="Email advising" value={overview ? String(overview.emailSessions) : '—'} meta={overview ? `${overview.totalStudents} tracked` : ''} tone="warning" isLoading={overviewQuery.isLoading} />
      </div>

      {overviewQuery.isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          Could not load advising overview metrics.
          <button type="button" onClick={() => void overviewQuery.refetch()} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      <AdvisingBreakdownPanel overview={overview} loading={overviewQuery.isLoading} />

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-brand" />
            <h2 className="text-sm font-semibold text-ink-primary">Advisor effectiveness breakdown</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search advisor…" aria-label="Search advisors" className="h-9 w-full rounded-md border border-line bg-white pl-8 pr-3 text-[13px] text-ink-primary placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
            </div>
            <select aria-label="Sort advisors" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="h-9 rounded-md border border-line bg-white px-2.5 text-[13px] font-medium text-ink-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15">
              <option value="completed">Most completed</option><option value="assigned">Most assigned</option>
              <option value="pending">Most pending</option><option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
        <div className="admin-fill flex flex-col">
          {!advisorsQuery.isLoading && !advisorsQuery.isError && filteredAdvisors.length === 0 ? (
            <EmptyState
              className="h-full justify-center"
              icon={search || reportTab === 'pending' ? <MagnifyingGlassMinus aria-hidden /> : <Users aria-hidden />}
              title={search ? 'No advisors match your search' : reportTab === 'pending' ? 'No advisors with pending requests' : 'No advisor activity yet'}
              description={search ? 'Try a different name or email to find an advisor.' : reportTab === 'pending' ? 'All advisor requests for this semester have been handled.' : 'Advisor sessions and outreach metrics will appear here once recorded.'}
            />
          ) : (
            <StaticTable
              stickyHeader className="min-h-0 flex-1 overflow-auto"
              columns={columns} rows={filteredAdvisors} rowKey={(row) => row.advisorId}
              loading={advisorsQuery.isLoading} onRetry={() => void advisorsQuery.refetch()}
              error={advisorsQuery.isError ? 'Could not load the advisor breakdown.' : undefined}
            />
          )}
        </div>
      </section>
    </div>
  );
}
