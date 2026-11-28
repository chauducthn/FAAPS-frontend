import {
  CalendarCheck,
  CheckCircle as CheckCircle2,
  Clock,
  UserMinus as UserX,
  XCircle,
  type Icon as LucideIcon,
} from '@phosphor-icons/react';
import { AdminStatTile, type AdminStatTone } from '../AdminStatTile';
import type { AppointmentStatus, MetricDelta } from '../../types/admin';

export interface KpiMetric {
  key: 'total' | AppointmentStatus;
  label: string;
  value?: number;
  icon: LucideIcon;
  tone: AdminStatTone;
  delta?: MetricDelta | null;
}

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
    <AdminStatTile
      icon={<Icon aria-hidden />}
      label={metric.label}
      value={metric.value?.toLocaleString('en-US')}
      isLoading={metric.value === undefined}
      tone={metric.tone}
      active={active}
      onClick={onClick}
    />
  );
}

/** The five metrics of the Appointments dashboard, in display order. */
export const KPI_METRICS: {
  key: 'total' | AppointmentStatus;
  label: string;
  icon: LucideIcon;
  tone: AdminStatTone;
}[] = [
  {
    key: 'total',
    label: 'Total sessions',
    icon: CalendarCheck,
    tone: 'brand',
  },
  {
    key: 'SCHEDULED',
    label: 'Scheduled',
    icon: Clock,
    tone: 'neutral',
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    icon: CheckCircle2,
    tone: 'success',
  },
  {
    key: 'CANCELLED',
    label: 'Cancelled',
    icon: XCircle,
    tone: 'danger',
  },
  {
    key: 'NO_SHOW',
    label: 'No-show',
    icon: UserX,
    tone: 'warning',
  },
];
