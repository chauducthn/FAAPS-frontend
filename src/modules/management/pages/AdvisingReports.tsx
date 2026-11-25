import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Mail, ShieldAlert, Users, Video } from 'lucide-react';
import { toast } from 'sonner';
import { apiMessage } from '@/shared/lib/apiMessage';
import { advisingReportService } from '../services/advising-report.service';

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
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--brand)]"
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
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-hover)]"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Advisor</th>
                <th className="px-4 py-3 text-right">Assigned Students</th>
                <th className="px-4 py-3 text-right">Completed Sessions</th>
                <th className="px-4 py-3 text-right">Email Outreaches</th>
                <th className="px-6 py-3 text-right">Pending Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(advisorsQuery.data ?? []).map((row) => (
                <tr key={row.advisorId} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-slate-900">{row.fullName}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.assignedStudents}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-700">{row.completedSessions}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.emailOutreaches}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{row.pendingRequests}</td>
                </tr>
              ))}
              {!advisorsQuery.isLoading && (advisorsQuery.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No advisor activity recorded for this semester yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
