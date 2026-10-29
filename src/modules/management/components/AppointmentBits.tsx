import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  UserX,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Appointment, AppointmentStatus } from '../types/admin';

/**
 * One source of truth for every status: the label, the icon and the colour
 * ramp. The KPI cards, the table badges and the timeline all read from it,
 * so a status always looks the same across the page.
 */
interface StatusMeta {
  label: string;
  icon: LucideIcon;
  /** Badge: tinted surface, readable label, hairline ring for definition. */
  badge: string;
  /** Solid chip used inside the timeline cards. */
  chip: string;
  /** Dot colour on the timeline rail. */
  dot: string;
}

export const STATUS_META: Record<AppointmentStatus, StatusMeta> = {
  SCHEDULED: {
    label: 'Scheduled',
    icon: Clock,
    badge: 'bg-[#eff6ff] text-[#1d4ed8] ring-[#1d4ed8]/15',
    chip: 'bg-[#dbeafe] text-[#1e40af]',
    dot: 'bg-[#3b82f6]',
  },
  IN_PROGRESS: {
    label: 'In progress',
    icon: Activity,
    badge: 'bg-[#f5f3ff] text-[#6d28d9] ring-[#6d28d9]/15',
    chip: 'bg-[#ede9fe] text-[#5b21b6]',
    dot: 'bg-[#8b5cf6]',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    badge: 'bg-[#ecfdf5] text-[#047857] ring-[#047857]/15',
    chip: 'bg-[#d1fae5] text-[#065f46]',
    dot: 'bg-[#10b981]',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    badge: 'bg-[#fef2f2] text-[#b91c1c] ring-[#b91c1c]/15',
    chip: 'bg-[#fee2e2] text-[#991b1b]',
    dot: 'bg-[#ef4444]',
  },
  NO_SHOW: {
    label: 'No-show',
    icon: UserX,
    badge: 'bg-[#f1f5f9] text-[#475569] ring-[#475569]/20',
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
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        meta.badge,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {meta.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Avatars                                  */
/* -------------------------------------------------------------------------- */

const STUDENT_TONES = [
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
];

/** A stable tone per name, so the same person always looks the same. */
function hashName(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Initials avatar. Students get a rotating warm palette; advisors keep one
 * cool tone, so the two roles are readable at a glance in a dense table.
 */
export function AppointmentAvatar({
  name,
  kind = 'student',
  className,
}: {
  name: string;
  kind?: 'student' | 'advisor';
  className?: string;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?';

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

/* -------------------------------------------------------------------------- */
/*                              Date & time helpers                           */
/* -------------------------------------------------------------------------- */

const dateFmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

/** "Oct 12, 2026" */
export function formatSlotDay(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', dateFmt);
}

/** "09:00" */
export function formatSlotTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', timeFmt);
}

/** "09:00 – 09:30" (end omitted when the session has no end time). */
export function formatSlotTimeRange(a: Pick<Appointment, 'scheduledAt' | 'endedAt'>) {
  if (!a.scheduledAt) return '—';
  const start = new Date(a.scheduledAt);
  const from = start.toLocaleTimeString('en-US', timeFmt);
  if (!a.endedAt) return from;
  const end = new Date(a.endedAt);
  const sameDay = end.toDateString() === start.toDateString();
  const to = sameDay
    ? end.toLocaleTimeString('en-US', timeFmt)
    : `${end.toLocaleDateString('en-US', dateFmt)} ${end.toLocaleTimeString('en-US', timeFmt)}`;
  return `${from} – ${to}`;
}

/** Local calendar key (yyyy-MM-dd) — the grouping key of the timeline. */
export function localDayKey(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA');
}

/** "Monday" */
export function formatWeekday(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
}

/** "Oct 12, 2026 · 09:00 – 09:30" (kept for the detail modal). */
export function formatSlot(a: Pick<Appointment, 'scheduledAt' | 'endedAt'>) {
  if (!a.scheduledAt) return '—';
  const start = new Date(a.scheduledAt);
  const day = start.toLocaleDateString('en-US', dateFmt);
  const from = start.toLocaleTimeString('en-US', timeFmt);
  if (!a.endedAt) return `${day} · ${from}`;
  const end = new Date(a.endedAt);
  const sameDay = end.toDateString() === start.toDateString();
  const to = sameDay
    ? end.toLocaleTimeString('en-US', timeFmt)
    : `${end.toLocaleDateString('en-US', dateFmt)} ${end.toLocaleTimeString('en-US', timeFmt)}`;
  return `${day} · ${from} – ${to}`;
}

export function durationMinutes(a: Pick<Appointment, 'scheduledAt' | 'endedAt'>) {
  if (!a.scheduledAt || !a.endedAt) return null;
  const minutes = Math.round(
    (new Date(a.endedAt).getTime() - new Date(a.scheduledAt).getTime()) / 60000,
  );
  return minutes > 0 ? minutes : null;
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
