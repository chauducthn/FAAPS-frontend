import { Link } from 'react-router';
import { CheckCircle, Users } from '@phosphor-icons/react';
import type { AssignmentAdvisor, AssignmentSummary } from '../types/admin';

export { DashboardNeedsAttention } from './DashboardNeedsAttention';

export function MajorCoverageCard({ assignment }: { assignment?: AssignmentSummary }) {
  const byMajor = (() => {
    const map = new Map<string, { majorCode: string; total: number; assigned: number; cohorts: number }>();
    for (const c of assignment?.cohorts ?? []) {
      const cur = map.get(c.majorCode) ?? { majorCode: c.majorCode, total: 0, assigned: 0, cohorts: 0 };
      cur.total += c.total;
      cur.assigned += c.assigned;
      cur.cohorts += 1;
      map.set(c.majorCode, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 8);
  })();

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Students by Major</h3>
        <Link to="/admin/majors" className="text-xs font-semibold text-[#C2410C] hover:underline">
          Manage majors
        </Link>
      </div>

      {byMajor.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-400">No major data yet.</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {byMajor.map((m) => {
            const pct = m.total > 0 ? Math.round((m.assigned / m.total) * 100) : 0;
            return (
              <div key={m.majorCode} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{m.majorCode}</span>
                    <span className="text-[11px] text-gray-400">{m.cohorts} cohorts</span>
                  </div>
                  <span className="tabular-nums text-gray-600">
                    <strong className="text-gray-900">{m.assigned.toLocaleString()}</strong> / {m.total.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-[#F26F21]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function AdvisorCapacityCard({
  assignment,
  advisors,
}: {
  assignment?: AssignmentSummary;
  advisors: AssignmentAdvisor[];
}) {
  const totalActive = advisors.reduce((sum, a) => sum + a.activeStudents, 0);
  const totalCap = advisors.reduce((sum, a) => sum + (a.maxAdvisees ?? 30), 0);
  const idleCount = advisors.filter((a) => a.activeStudents === 0).length;
  const fullOrOver = advisors.filter((a) => a.maxAdvisees !== null && a.activeStudents >= a.maxAdvisees).length;
  const utilPct = totalCap > 0 ? Math.min(100, Math.round((totalActive / totalCap) * 100)) : 0;

  const topUnassignedCohorts = [...(assignment?.cohorts ?? [])]
    .filter((c) => c.unassigned > 0)
    .sort((a, b) => b.unassigned - a.unassigned)
    .slice(0, 5);

  return (
    <section className="flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[#F26F21]" />
            <h3 className="text-sm font-semibold text-gray-900">Advisor Capacity &amp; Gaps</h3>
          </div>
          <Link to="/admin/assignments" className="text-xs font-semibold text-[#C2410C] hover:underline">
            Open assignments
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[11px] text-gray-500">Utilization</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900">
              {utilPct}% <span className="text-[11px] font-normal text-gray-400">({totalActive}/{totalCap})</span>
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[11px] text-gray-500">Idle advisors</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900">{idleCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-[11px] text-gray-500">Full / Over</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-gray-900">{fullOrOver}</p>
          </div>
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Top cohorts needing advisors
          </p>
          {topUnassignedCohorts.length === 0 ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle className="size-4" /> Every cohort is fully assigned.
            </p>
          ) : (
            <div className="mt-1.5 divide-y divide-gray-100">
              {topUnassignedCohorts.map((c) => (
                <Link
                  key={c.cohortId}
                  to={`/admin/assignments/cohorts/${c.cohortId}`}
                  className="flex items-center justify-between py-2 text-xs transition-colors hover:text-[#C2410C]"
                >
                  <span className="font-medium text-gray-800">
                    <span className="font-mono font-bold text-gray-900">{c.majorCode}</span> · {c.cohort}
                  </span>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-amber-800">
                    {c.unassigned.toLocaleString()} unassigned
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
