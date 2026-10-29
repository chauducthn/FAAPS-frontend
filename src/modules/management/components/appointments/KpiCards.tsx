import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Minus,
  UserX,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AppointmentStatus, MetricDelta } from '../../types/admin';

export interface KpiMetric {
  key: string;
  label: string;
  value?: number;
  icon: LucideIcon;
  /** Tailwind surface + text + ring for the icon tile. */
  tone: string;
  delta?: MetricDelta | null;
}

/**
 * Week-over-week deltas for the five appointment metrics.
 *
 * The API does not expose these yet, so the page falls back to `null` and the
 * card renders no delta chip until the backend provides a comparison.
 */
export type KpiDeltas = Partial<Record<'total' | AppointmentStatus, MetricDelta>>;

const DELTA_ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

function DeltaChip({ delta }: { delta: MetricDelta }) {
  const direction = delta.percent === 0 ? 'flat' : delta.percent > 0 ? 'up' : 'down';
  const Icon = DELTA_ICON[direction];
  const tone =
    direction === 'flat'
      ? 'bg-[#f1f5f9] text-[#475569]'
      : delta.positive
        ? 'bg-[#ecfdf5] text-[#047857]'
        : 'bg-[#fef2f2] text-[#b91c1c]';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
        tone,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {Math.abs(delta.percent).toFixed(1)}%
    </span>
  );
}

/**
 * A single KPI card: icon tile, label, value and the week-over-week delta.
 *
 * The card is a link-free, non-interactive block, so the hover treatment is
 * a quiet depth shift rather than a click affordance.
 */
export function KpiCard({ metric }: { metric: KpiMetric }) {
  const Icon = metric.icon;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-4',
        'shadow-[0_1px_2px_rgba(20,32,51,0.04),0_1px_3px_rgba(20,32,51,0.03)]',
        'transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-0.5 hover:border-[#e0e0e0] hover:shadow-[0_8px_20px_rgba(20,32,51,0.08)]',
      )}
    >
      {/* A soft brand wash that only appears on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-orange-50/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-medium text-[#555f6f]">{metric.label}</p>
          {metric.value === undefined ? (
            <div className="mt-2 h-8 w-14 animate-pulse rounded bg-[#f1f5f9]" />
          ) : (
            <p className="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.02em] text-[#151c27] tabular-nums">
              {metric.value.toLocaleString('en-US')}
            </p>
          )}
        </div>

        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
            metric.tone,
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
      </div>

      <div className="relative mt-3 flex h-5 items-center">
        {metric.delta ? (
          <>
            <DeltaChip delta={metric.delta} />
            <span className="ml-1.5 truncate text-[11px] text-[#5b6577]">vs last week</span>
          </>
        ) : (
          <span className="text-[11px] text-[#5b6577]">No weekly comparison</span>
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
}[] = [
  {
    key: 'total',
    label: 'Total sessions',
    icon: CalendarCheck,
    tone: 'bg-[#fff7ed] text-[#f37021] ring-[#f37021]/15',
  },
  {
    key: 'SCHEDULED',
    label: 'Scheduled',
    icon: Clock,
    tone: 'bg-[#eff6ff] text-[#1d4ed8] ring-[#1d4ed8]/15',
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    icon: CheckCircle2,
    tone: 'bg-[#ecfdf5] text-[#047857] ring-[#047857]/15',
  },
  {
    key: 'CANCELLED',
    label: 'Cancelled',
    icon: XCircle,
    tone: 'bg-[#fef2f2] text-[#b91c1c] ring-[#b91c1c]/15',
  },
  {
    key: 'NO_SHOW',
    label: 'No-show',
    icon: UserX,
    tone: 'bg-[#f1f5f9] text-[#475569] ring-[#475569]/20',
  },
];
