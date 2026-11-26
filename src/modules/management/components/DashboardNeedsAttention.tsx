import { Link } from 'react-router';
import { ArrowRight, Bell, CalendarBlank, Flag, ShieldCheck, UserMinus, WarningCircle } from '@phosphor-icons/react';
import type { AppointmentSummary, AssignmentAdvisor, AssignmentSummary } from '../types/admin';

interface AttentionItem {
  label: string;
  count: number;
  detail: string;
  to: string;
  tone: 'amber' | 'red' | 'blue' | 'gray';
  icon: React.ReactNode;
}

export function DashboardNeedsAttention({
  assignment,
  advisors,
  pendingReports,
  draftRules,
  appointments,
}: {
  assignment?: AssignmentSummary;
  advisors: AssignmentAdvisor[];
  pendingReports: number;
  draftRules: number;
  appointments?: AppointmentSummary;
}) {
  const total = assignment?.total ?? 0;
  const assigned = assignment?.assigned ?? 0;
  const coveragePct = total > 0 ? Math.round((assigned / total) * 100) : 0;
  const overLimit = advisors.filter((a) => a.maxAdvisees !== null && a.activeStudents > a.maxAdvisees).length;

  const items: AttentionItem[] = [
    {
      label: 'Unassigned students',
      count: assignment?.unassigned ?? 0,
      detail: `${assignment?.cohorts.filter((c) => c.unassigned > 0).length ?? 0} cohorts`,
      to: '/admin/assignments?tab=unassigned',
      tone: 'amber',
      icon: <UserMinus className="size-3.5" />,
    },
    {
      label: 'Pending advisor requests',
      count: assignment?.pendingAdvisorRequests ?? 0,
      detail: 'Students waiting',
      to: '/admin/assignments?tab=unassigned&pending=1',
      tone: 'red',
      icon: <Bell className="size-3.5" />,
    },
    {
      label: 'Over-limit advisors',
      count: overLimit,
      detail: 'Above max advisees',
      to: '/admin/assignments',
      tone: 'red',
      icon: <WarningCircle className="size-3.5" />,
    },
    {
      label: 'Pending AI reports',
      count: pendingReports,
      detail: 'Needs review',
      to: '/admin/ai-reports',
      tone: 'blue',
      icon: <Flag className="size-3.5" />,
    },
    {
      label: 'Scheduled appointments',
      count: appointments?.scheduled ?? 0,
      detail: `${appointments?.completed ?? 0} completed`,
      to: '/admin/appointments',
      tone: 'blue',
      icon: <CalendarBlank className="size-3.5" />,
    },
    {
      label: 'Draft academic rules',
      count: draftRules,
      detail: 'Not published yet',
      to: '/admin/academic-rules',
      tone: 'gray',
      icon: <ShieldCheck className="size-3.5" />,
    },
  ];

  const toneBadge = {
    amber: 'bg-amber-50 text-amber-800',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <section className="flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-2xs">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Action Queue</h3>
          <span className="text-xs font-semibold tabular-nums text-emerald-700">{coveragePct}% covered</span>
        </div>

        <div className="mt-2.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#F26F21] transition-all" style={{ width: `${coveragePct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-gray-500">
            <span>{assigned.toLocaleString()} assigned</span>
            <span>{total.toLocaleString()} total students</span>
          </div>
        </div>

        <div className="mt-3 divide-y divide-gray-100">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex items-center justify-between gap-2 py-2 text-xs transition-colors hover:text-[#C2410C]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-gray-400 group-hover:text-[#F26F21]">{item.icon}</span>
                <span className="truncate font-medium text-gray-800 group-hover:text-[#C2410C]">{item.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-[11px] text-gray-400 sm:inline">{item.detail}</span>
                <span
                  className={`min-w-[28px] rounded-md px-1.5 py-0.5 text-center font-mono text-[11px] font-bold tabular-nums ${
                    item.count > 0 ? toneBadge[item.tone] : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {item.count.toLocaleString()}
                </span>
                <ArrowRight className="size-3 text-gray-300 group-hover:text-[#F26F21]" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {(assignment?.missingAcademicProfile ?? 0) > 0 && (
        <Link
          to="/admin/users?role=STUDENT"
          className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 hover:bg-amber-50"
        >
          <span>{assignment?.missingAcademicProfile} students missing profile</span>
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </section>
  );
}
