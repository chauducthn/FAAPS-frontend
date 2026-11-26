import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserX,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AppointmentStatus, MetricDelta } from '../../types/admin';

export interface KpiMetric {
  key: 'total' | AppointmentStatus;
  label: string;
  value?: number;
  icon: LucideIcon;
  tone: string;
  activeTone: string;
  delta?: MetricDelta | null;
}

export type KpiDeltas = Partial<Record<'total' | AppointmentStatus, MetricDelta>>;

export function KpiCard({
  metric,
  active,
  onClick,
}: {
  metric: KpiMetric;
  active?: boolean;
  onClick?: () => void;
}) {
  const Icon = metric.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition-colors',
        onClick && 'cursor-pointer',
        active ? metric.activeTone : 'border-gray-200/80 hover:border-gray-300',
      )}
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', metric.tone)}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{metric.label}</p>
        {metric.value === undefined ? (
          <div className="mt-1 h-5 w-10 animate-pulse rounded bg-gray-100" />
        ) : (
          <span className="mt-0.5 block text-lg font-bold leading-none tabular-nums text-gray-900">
            {metric.value.toLocaleString('en-US')}
          </span>
        )}
      </div>
    </div>
  );
}

/** The five metrics of the Appointments dashboard, in display order. */
export const KPI_METRICS: {
  key: 'total' | AppointmentStatus;
  label: string;
  icon: LucideIcon;
  tone: string;
  activeTone: string;
}[] = [
  {
    key: 'total',
    label: 'Total sessions',
    icon: CalendarCheck,
    tone: 'bg-orange-50 text-[#C2410C]',
    activeTone: 'border-[#F26F21]/60 bg-orange-50/40',
  },
  {
    key: 'SCHEDULED',
    label: 'Scheduled',
    icon: Clock,
    tone: 'bg-blue-50 text-blue-700',
    activeTone: 'border-blue-400/70 bg-blue-50/40',
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700',
    activeTone: 'border-emerald-400/70 bg-emerald-50/40',
  },
  {
    key: 'CANCELLED',
    label: 'Cancelled',
    icon: XCircle,
    tone: 'bg-red-50 text-red-600',
    activeTone: 'border-red-300 bg-red-50/40',
  },
  {
    key: 'NO_SHOW',
    label: 'No-show',
    icon: UserX,
    tone: 'bg-gray-100 text-gray-700',
    activeTone: 'border-gray-400 bg-gray-50/70',
  },
];
