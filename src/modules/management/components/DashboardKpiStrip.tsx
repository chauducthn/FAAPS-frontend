import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  CalendarBlank,
  DownloadSimple as Download,
  Flag,
  FolderOpen,
  GraduationCap,
  UserMinus,
  User as UserRound,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AdminStatTone } from './AdminStatTile';

const EXPORT_BUTTON_CLASS =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-[13px] ' +
  'font-medium text-ink-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50';

const CELL_CLASS =
  'group flex min-w-0 flex-col gap-1 bg-white px-4 py-3 transition-colors hover:bg-surface-hover ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40';

const ICON_TONE: Record<AdminStatTone, string> = {
  neutral: 'text-ink-subtle',
  brand: 'text-brand',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
};

interface SummaryCellProps {
  icon: ReactNode;
  label: string;
  value?: number;
  meta?: string;
  isLoading: boolean;
  tone?: AdminStatTone;
  to: string;
}

/** One cell of the dashboard summary bar; links to the page where the metric can be acted on. */
function SummaryCell({ icon, label, value, meta, isLoading, tone = 'neutral', to }: SummaryCellProps) {
  return (
    <Link
      to={to}
      className={CELL_CLASS}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink-muted">
        <span className={cn('shrink-0 [&_svg]:size-4', ICON_TONE[tone])}>{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {isLoading ? (
        <span className="my-1 block h-5 w-14 animate-pulse rounded-sm bg-line-soft" />
      ) : (
        <span className="text-xl font-semibold leading-tight tracking-tight text-ink-primary tabular-nums">
          {value !== undefined ? value.toLocaleString('en-US') : '—'}
        </span>
      )}
      <span className="truncate text-[11px] text-ink-subtle">{meta ?? ' '}</span>
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
  const unassignedTone: AdminStatTone = (props.unassigned ?? 0) > 0 ? 'warning' : 'neutral';
  const reportsTone: AdminStatTone = props.pendingReports > 0 ? 'danger' : 'neutral';
  const courses = (props.coursesCount ?? 0).toLocaleString('en-US');
  const cohortMeta = props.majorsCount != null ? `${props.majorsCount} majors · ${courses} courses` : undefined;

  return (
    <section aria-label="Key metrics" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">System Overview</h2>
        <button type="button" onClick={props.onExport} disabled={props.exportDisabled} className={EXPORT_BUTTON_CLASS}>
          <Download className="size-4" /> Export report
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 xl:grid-cols-6">
        <SummaryCell
          icon={<GraduationCap />}
          label="Students"
          value={props.students}
          meta={props.hasAssignment ? `${props.coveragePct}% assigned` : undefined}
          isLoading={props.isLoading}
          tone="brand"
          to="/admin/users?role=STUDENT"
        />
        <SummaryCell
          icon={<UserRound />}
          label="Advisors"
          value={props.advisors}
          meta={props.hasAdvisors ? `${props.idleAdvisors} idle` : undefined}
          isLoading={props.isLoading}
          to="/admin/assignments"
        />
        <SummaryCell
          icon={<UserMinus />}
          label="Unassigned"
          value={props.unassigned}
          meta={props.hasAssignment ? `${props.pendingRequests ?? 0} pending requests` : undefined}
          isLoading={props.assignmentLoading}
          tone={unassignedTone}
          to="/admin/assignments?tab=unassigned"
        />
        <SummaryCell
          icon={<FolderOpen />}
          label="Cohorts"
          value={props.cohorts}
          meta={cohortMeta}
          isLoading={props.isLoading}
          to="/admin/cohorts"
        />
        <SummaryCell
          icon={<CalendarBlank />}
          label="Appointments"
          value={props.appointmentsTotal}
          meta={props.appointmentsScheduled != null ? `${props.appointmentsScheduled} upcoming` : undefined}
          isLoading={props.appointmentLoading}
          to="/admin/appointments"
        />
        <SummaryCell
          icon={<Flag />}
          label="AI reports"
          value={props.pendingReports}
          meta={props.activeRules != null ? `${props.activeRules} active rules` : 'pending review'}
          isLoading={props.aiReportsLoading}
          tone={reportsTone}
          to="/admin/ai-reports"
        />
      </div>
    </section>
  );
}
