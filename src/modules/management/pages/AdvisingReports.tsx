import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Mail, ShieldAlert, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { StaticTable, type StaticColumn } from '../../../shared/components/common/table/StaticTable';
import { cn } from '@/shared/lib/utils';
import {
  advisingReportService,
  type AdvisorEffectivenessRow,
} from '../services/advising-report.service';

const advisorEffectivenessColumns: StaticColumn<AdvisorEffectivenessRow>[] = [
  {
    key: 'advisor',
    header: 'Advisor',
    render: (row) => (
      <span className="font-semibold text-[var(--ink-primary)]">
        {row.fullName}
        <span className="block text-xs font-normal text-[var(--ink-muted)]">{row.email}</span>
      </span>
    ),
  },
  {
    key: 'assignedStudents',
    header: 'Assigned Students',
    align: 'right',
    render: (row) => <span>{row.assignedStudents}</span>,
  },
  {
    key: 'completedSessions',
    header: 'Completed Sessions',
    align: 'right',
    render: (row) => (
      <span className="font-semibold text-emerald-700">{row.completedSessions}</span>
    ),
  },
  {
    key: 'emailOutreaches',
    header: 'Email Outreaches',
    align: 'right',
    render: (row) => <span>{row.emailOutreaches}</span>,
  },
  {
    key: 'pendingRequests',
    header: 'Pending Requests',
    align: 'right',
    render: (row) => <span>{row.pendingRequests}</span>,
  },
];

export default function AdvisingReports() {
  const [semesterId, setSemesterId] = useState<string>('');

  const semestersQuery = useQuery({
    queryKey: ['admin', 'semesters'],
    queryFn: advisingReportService.getSemesters,
  });

  const overviewQuery = useQuery({
    queryKey: ['admin', 'advising-reports', 'overview', semesterId],
    queryFn: () => advisingReportService.getOverview(semesterId || undefined),
  });

  const advisorsQuery = useQuery({
    queryKey: ['admin', 'advising-reports', 'by-advisor', semesterId],
    queryFn: () => advisingReportService.getByAdvisor(semesterId || undefined),
  });

  const handleExport = async () => {
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
    }
  };

  const overview = overviewQuery.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Advising Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor advising outreach, at-risk coverage, and advisor effectiveness by semester.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by semester"
            value={semesterId}
            onChange={(event) => setSemesterId(event.target.value)}
            className={cn(
                'h-10 rounded-lg border border-slate-200 bg-white',
                'px-3 text-sm font-medium text-slate-800 outline-none',
                'focus:border-[var(--brand)]'
              )}
          >
            <option value="">All Semesters</option>
            {(semestersQuery.data ?? []).map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.code} — {sem.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExport}
            className={cn(
                'inline-flex h-10 items-center gap-2 rounded-lg',
                'bg-[var(--brand)] px-4 text-sm font-bold text-white',
                'hover:bg-[var(--brand-hover)]'
              )}
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </div>

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
              At-Risk Coverage <ShieldAlert className="size-4 text-[var(--brand)]" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{overview.coverageRate}%</p>
            <p className="mt-1 text-xs text-slate-500">
              {overview.contactedAtRisk} / {overview.atRiskStudents} at-risk students contacted
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
              Total Sessions <BarChart3 className="size-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{overview.totalSessions}</p>
            <p className="mt-1 text-xs text-slate-500">
              {overview.completedSessions} completed · {overview.noShowSessions} no-show
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
              Online / Offline <Video className="size-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {overview.onlineSessions} / {overview.offlineSessions}
            </p>
            <p className="mt-1 text-xs text-slate-500">Virtual vs in-person advising</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
              Email Advising <Mail className="size-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{overview.emailSessions}</p>
            <p className="mt-1 text-xs text-slate-500">Total students tracked: {overview.totalStudents}</p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <Users className="size-4 text-[var(--brand)]" />
          <h2 className="text-base font-bold text-slate-900">Advisor Effectiveness Breakdown</h2>
        </div>
        <StaticTable
          columns={advisorEffectivenessColumns}
          rows={advisorsQuery.data ?? []}
          rowKey={(row) => row.advisorId}
          loading={advisorsQuery.isLoading}
          error={advisorsQuery.isError ? 'Could not load the advisor breakdown.' : undefined}
          emptyTitle="No advisor activity recorded for this semester yet."
        />
      </section>
    </div>
  );
}
