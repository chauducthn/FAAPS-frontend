import { Link } from 'react-router';
import { CalendarBlank, DownloadSimple as Download, Flag, FolderOpen, GraduationCap, UserMinus, User as UserRound } from '@phosphor-icons/react';

function DashboardStatTile({
  icon, label, value, sub, isLoading, tone, to,
}: {
  icon: React.ReactNode; label: string; value?: number; sub?: string;
  isLoading: boolean; tone: 'blue' | 'orange' | 'emerald' | 'amber' | 'violet' | 'rose'; to: string;
}) {
  const iconTone = {
    blue: 'bg-blue-50 text-blue-600', orange: 'bg-orange-50 text-[#C2410C]', emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700', rose: 'bg-rose-50 text-rose-700',
  }[tone];

  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-3.5 py-2.5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50/40">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-5 w-12 animate-pulse rounded bg-gray-100" />
        ) : (
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-lg font-bold leading-none tabular-nums text-gray-900">
              {value !== undefined ? value.toLocaleString('en-US') : '—'}
            </span>
            {sub && <span className="truncate text-[11px] text-gray-400">{sub}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}

export function DashboardKpiStrip(props: {
  students?: number; advisors?: number; cohorts?: number; unassigned?: number;
  pendingRequests?: number; appointmentsTotal?: number; appointmentsScheduled?: number;
  pendingReports: number; activeRules?: number; majorsCount?: number; coursesCount?: number;
  coveragePct: number; idleAdvisors: number; hasAssignment: boolean; hasAdvisors: boolean;
  isLoading: boolean; assignmentLoading: boolean; appointmentLoading: boolean;
  aiReportsLoading: boolean; exportDisabled: boolean; onExport: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
        <DashboardStatTile icon={<GraduationCap className="size-4" />} label="Students" value={props.students} sub={props.hasAssignment ? `${props.coveragePct}% assigned` : undefined} isLoading={props.isLoading} tone="blue" to="/admin/users?role=STUDENT" />
        <DashboardStatTile icon={<UserRound className="size-4" />} label="Advisors" value={props.advisors} sub={props.hasAdvisors ? `${props.idleAdvisors} idle` : undefined} isLoading={props.isLoading} tone="orange" to="/admin/assignments" />
        <DashboardStatTile icon={<UserMinus className="size-4" />} label="Unassigned" value={props.unassigned} sub={props.hasAssignment ? `${props.pendingRequests ?? 0} req` : undefined} isLoading={props.assignmentLoading} tone="amber" to="/admin/assignments?tab=unassigned" />
        <DashboardStatTile icon={<FolderOpen className="size-4" />} label="Cohorts" value={props.cohorts} sub={props.majorsCount != null ? `${props.majorsCount}M · ${props.coursesCount ?? 0}C` : undefined} isLoading={props.isLoading} tone="emerald" to="/admin/cohorts" />
        <DashboardStatTile icon={<CalendarBlank className="size-4" />} label="Appointments" value={props.appointmentsTotal} sub={props.appointmentsScheduled != null ? `${props.appointmentsScheduled} upcoming` : undefined} isLoading={props.appointmentLoading} tone="violet" to="/admin/appointments" />
        <DashboardStatTile icon={<Flag className="size-4" />} label="AI Reports" value={props.pendingReports} sub={props.activeRules != null ? `${props.activeRules} active rules` : 'pending'} isLoading={props.aiReportsLoading} tone="rose" to="/admin/ai-reports" />
      </div>
      <div className="flex shrink-0 items-center justify-end">
        <button type="button" onClick={props.onExport} disabled={props.exportDisabled} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-[13px] font-medium text-gray-700 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
          <Download className="size-4" /> Export report
        </button>
      </div>
    </div>
  );
}
