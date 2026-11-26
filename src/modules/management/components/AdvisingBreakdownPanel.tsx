import type { SchoolAdvisingOverview } from '../services/advising-report.service';

const pct = (part: number, total: number) => (total <= 0 ? 0 : Math.round((part / total) * 100));

export function AdvisingBreakdownPanel({ overview, loading }: { overview?: SchoolAdvisingOverview; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-3 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-gray-200/80 bg-white" />
        ))}
      </div>
    );
  }
  if (!overview) return null;

  const uncontacted = Math.max(0, overview.atRiskStudents - overview.contactedAtRisk);
  const onlinePct = pct(overview.onlineSessions, overview.totalSessions);
  const offlinePct = pct(overview.offlineSessions, overview.totalSessions);
  const emailPct = pct(overview.emailSessions, overview.totalSessions);
  const completionPct = pct(overview.completedSessions, overview.totalSessions);
  const noShowPct = pct(overview.noShowSessions, overview.totalSessions);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">At-risk outreach</p>
          <span className="text-sm font-bold tabular-nums text-[#C2410C]">{overview.coverageRate}%</span>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-[#F26F21] transition-all" style={{ width: `${Math.min(100, overview.coverageRate)}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-800">{overview.contactedAtRisk}</span> contacted ·{' '}
          <span className={uncontacted > 0 ? 'font-semibold text-red-600' : 'text-gray-600'}>{uncontacted} remaining</span>
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Session channels</p>
          <span className="text-xs font-semibold tabular-nums text-gray-500">{overview.totalSessions} total</span>
        </div>
        <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-blue-500" style={{ width: `${onlinePct}%` }} />
          <div className="bg-emerald-500" style={{ width: `${offlinePct}%` }} />
          <div className="bg-amber-400" style={{ width: `${emailPct}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-blue-500" /> Online {onlinePct}%</span>
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-emerald-500" /> Offline {offlinePct}%</span>
          <span className="inline-flex items-center gap-1"><i className="size-2 rounded-full bg-amber-400" /> Email {emailPct}%</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Session outcomes</p>
          <span className="text-sm font-bold tabular-nums text-emerald-700">{completionPct}% done</span>
        </div>
        <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="bg-emerald-500" style={{ width: `${completionPct}%` }} />
          <div className="bg-red-400" style={{ width: `${noShowPct}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          <span className="font-semibold text-emerald-700">{overview.completedSessions} completed</span> ·{' '}
          <span className="font-semibold text-red-600">{overview.noShowSessions} no-show</span> ({noShowPct}%)
        </p>
      </div>
    </div>
  );
}
