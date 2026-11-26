import {
  Pulse as Activity,
  CalendarBlank as CalendarDays,
  CheckCircle as CheckCircle2,
  Clock,
  UserMinus as UserX,
  XCircle,
  type Icon as LucideIcon,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { AppointmentStatus } from '../types/admin';
import { initialsOf } from './UserInitials';

export {
  durationMinutes,
  formatSlot,
  formatSlotDay,
  formatSlotTime,
  formatSlotTimeRange,
  formatWeekday,
  localDayKey,
} from '../utils/appointmentFormat';

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  badge: string;
  chip: string;
  dot: string;
}

export const STATUS_META: Record<AppointmentStatus, StatusMeta> = {
  SCHEDULED: {
    label: 'Scheduled',
    icon: Clock,
    badge: 'text-[#1d4ed8]',
    chip: 'bg-[#dbeafe] text-[#1e40af]',
    dot: 'bg-[#3b82f6]',
  },
  IN_PROGRESS: {
    label: 'In progress',
    icon: Activity,
    badge: 'text-[#6d28d9]',
    chip: 'bg-[#ede9fe] text-[#5b21b6]',
    dot: 'bg-[#8b5cf6]',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    badge: 'text-[#047857]',
    chip: 'bg-[#d1fae5] text-[#065f46]',
    dot: 'bg-[#10b981]',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    badge: 'text-[#b91c1c]',
    chip: 'bg-[#fee2e2] text-[#991b1b]',
    dot: 'bg-[#ef4444]',
  },
  NO_SHOW: {
    label: 'No-show',
    icon: UserX,
    badge: 'text-[#475569]',
    chip: 'bg-[#e2e8f0] text-[#334155]',
    dot: 'bg-[#94a3b8]',
  },
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

/** The status order used by the filter dropdown and the KPI cards. */
export const APPOINTMENT_STATUSES = Object.keys(STATUS_META) as AppointmentStatus[];

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold',
        meta.badge,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {meta.label}
    </span>
  );
}

const STUDENT_TONES = [
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
];

function hashName(name: string | null | undefined) {
  const safe = name ?? '';
  let hash = 0;
  for (let index = 0; index < safe.length; index += 1) {
    hash = (hash * 31 + safe.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function AppointmentAvatar({
  name,
  kind = 'student',
  className,
}: {
  name: string | null | undefined;
  kind?: 'student' | 'advisor';
  className?: string;
}) {
  const initials = initialsOf(name);
  const tone =
    kind === 'advisor'
      ? 'bg-[#eef2ff] text-[#4338ca]'
      : STUDENT_TONES[hashName(name) % STUDENT_TONES.length];

  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-wide',
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** Icon tile used by the date cell and the schedule header. */
export function CalendarTile({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#fff7ed] text-[#f37021] ring-1 ring-inset ring-[#f37021]/15',
        className,
      )}
    >
      <CalendarDays className="size-[18px]" />
    </span>
  );
}
