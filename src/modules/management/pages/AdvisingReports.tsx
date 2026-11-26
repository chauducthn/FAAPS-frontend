import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, ChevronDown, Download, Loader2, Mail, ShieldAlert, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import {
  advisingReportService,
  type AdvisorEffectivenessRow,
} from '../services/advising-report.service';

const advisorEffectivenessColumns: StaticColumn<AdvisorEffectivenessRow>[] = [
  {
    key: 'advisor', header: 'Advisor',
    render: (row) => (
      <span className="font-semibold text-[var(--ink-primary)]">
        {row.fullName}
        <span className="block text-xs font-normal text-[var(--ink-muted)]">{row.email}</span>
      </span>
    ),
  },
  { key: 'assignedStudents', header: 'Assigned Students', align: 'right', render: (r) => <span className="tabular-nums">{r.assignedStudents}</span> },
  { key: 'completedSessions', header: 'Completed Sessions', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-emerald-700">{r.completedSessions}</span> },
  { key: 'emailOutreaches', header: 'Email Outreaches', align: 'right', render: (r) => <span className="tabular-nums">{r.emailOutreaches}</span> },
  { key: 'pendingRequests', header: 'Pending Requests', align: 'right', render: (r) => <span className="tabular-nums">{r.pendingRequests}</span> },
];

function ReportStatTile({
  icon,
  label,
  value,
  meta,
  tone,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta: string;
  tone: 'orange' | 'emerald' | 'blue' | 'amber';
  loading: boolean;
}) {
  const iconTone = {
    orange: 'bg-orange-50 text-[#C2410C]',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-5 w-16 animate-pulse rounded bg-gray-100" />
        ) : (
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
  const [semesterId, setSemesterId] = useState<string>('');
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
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setIsExporting(false);
    }
  };

  const overview = overviewQuery.data;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-2.5 lg:grid-cols-4">
          <ReportStatTile
            icon={<ShieldAlert className="size-4" />}
            label="At-risk coverage"
            value={overview ? `${overview.coverageRate}%` : '—'}
            meta={overview ? `${overview.contactedAtRisk}/${overview.atRiskStudents} contacted` : ''}
            tone="orange"
            loading={overviewQuery.isLoading}
          />
          <ReportStatTile
            icon={<BarChart3 className="size-4" />}
            label="Total sessions"
            value={overview ? String(overview.totalSessions) : '—'}
            meta={overview ? `${overview.completedSessions} done · ${overview.noShowSessions} no-show` : ''}
            tone="emerald"
            loading={overviewQuery.isLoading}
          />
          <ReportStatTile
            icon={<Video className="size-4" />}
            label="Online / offline"
            value={overview ? `${overview.onlineSessions} / ${overview.offlineSessions}` : '—'}
            meta="virtual vs in-person"
            tone="blue"
            loading={overviewQuery.isLoading}
          />
          <ReportStatTile
            icon={<Mail className="size-4" />}
            label="Email advising"
            value={overview ? String(overview.emailSessions) : '—'}
            meta={overview ? `${overview.totalStudents} tracked` : ''}
            tone="amber"
            loading={overviewQuery.isLoading}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <div className="relative w-[196px]">
            <select
              aria-label="Filter by semester"
              value={semesterId}
              onChange={(event) => setSemesterId(event.target.value)}
              className="h-9 w-full appearance-none truncate rounded-lg border border-gray-200 bg-white pl-3 pr-7 text-[13px] font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/15"
            >
              <option value="">All semesters</option>
              {(semestersQuery.data ?? []).map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.code} — {sem.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || overviewQuery.isLoading}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {overviewQuery.isError && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          Could not load advising overview metrics.
          <button type="button" onClick={() => overviewQuery.refetch()} className="font-semibold hover:underline">
            Retry
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <Users className="size-4 text-[#F26F21]" />
          <h2 className="text-[13px] font-bold text-gray-900">Advisor effectiveness breakdown</h2>
        </div>
        <div className="flex h-[520px] flex-col">
          <StaticTable
            stickyHeader className="min-h-0 flex-1 overflow-auto"
            columns={advisorEffectivenessColumns} rows={advisorsQuery.data ?? []}
            rowKey={(row) => row.advisorId} loading={advisorsQuery.isLoading}
            error={advisorsQuery.isError ? 'Could not load the advisor breakdown.' : undefined}
            emptyTitle="No advisor activity recorded for this semester yet."
          />
        </div>
      </section>
    </div>
  );
}
