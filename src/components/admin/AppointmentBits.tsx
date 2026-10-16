import { cn } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '../../types/admin';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-[#ecfdf5] text-[#047857]',
  IN_PROGRESS: 'bg-[#eff6ff] text-[#1d4ed8]',
  COMPLETED: 'bg-[#e0f2fe] text-[#0369a1]',
  CANCELLED: 'bg-[#fef2f2] text-[#b91c1c]',
  NO_SHOW: 'bg-[#fffbeb] text-[#b45309]',
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[status])}>
      {APPOINTMENT_STATUS_LABEL[status]}
    </span>
  );
}

const dateFmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
const timeFmt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

/** "Oct 12, 2026 · 09:00 – 09:30" (end omitted when the session has no end time). */
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
  const minutes = Math.round((new Date(a.endedAt).getTime() - new Date(a.scheduledAt).getTime()) / 60000);
  return minutes > 0 ? minutes : null;
}
