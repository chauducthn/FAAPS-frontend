// src/components/appointments/WeeklyCalendar.tsx
import { useMemo } from 'react';
import { addDays, formatColumnDay, formatIsoTime, isToday, toDateKey, weekDays } from '../../../shared/lib/appointmentDate';
import { BookingStatusBadge } from './AppointmentBits';
import type { AdvisorAppointment } from '../types/appointment';
import { cn } from '@/shared/lib/utils';

interface WeeklyCalendarProps {
  /** Any date inside the displayed week. */
  weekAnchor: Date;
  appointments: AdvisorAppointment[];
  isLoading: boolean;
  onSelect: (appointment: AdvisorAppointment) => void;
}

const STATUS_BORDER: Record<AdvisorAppointment['status'], string> = {
  PENDING: 'border-l-[#f59e0b]',
  ACCEPTED: 'border-l-[#10b981]',
  REJECTED: 'border-l-[#ef4444]',
  CANCELLED: 'border-l-[#94a3b8]',
  COMPLETED: 'border-l-[#3b82f6]',
  NO_SHOW: 'border-l-[#a855f7]',
};

const STATUS_BG: Record<AdvisorAppointment['status'], string> = {
  PENDING: 'bg-[#fffbeb]',
  ACCEPTED: 'bg-[#ecfdf5]',
  REJECTED: 'bg-[#fef2f2]',
  CANCELLED: 'bg-slate-50',
  COMPLETED: 'bg-blue-50/60',
  NO_SHOW: 'bg-purple-50/60',
};

/**
 * A lightweight 7-day grid (Mon -> Sun) built with plain Tailwind grid/flexbox.
 * Appointments are grouped per day and stacked vertically inside their column.
 */
export function WeeklyCalendar({ weekAnchor, appointments, isLoading, onSelect }: WeeklyCalendarProps) {
  const days = useMemo(() => weekDays(weekAnchor), [weekAnchor]);

  const byDay = useMemo(() => {
    const map = new Map<string, AdvisorAppointment[]>();
    for (const day of days) map.set(toDateKey(day), []);
    for (const appointment of appointments) {
      const key = toDateKey(new Date(appointment.startTime));
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(appointment);
        bucket.sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    }
    return map;
  }, [appointments, days]);

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <div className="min-w-[820px]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#e5e7eb]">
          {days.map((day) => (
            <div
              key={toDateKey(day)}
              className={cn(
                'border-r border-[#e5e7eb] px-2 py-2.5 text-center last:border-r-0',
                isToday(day) && 'bg-orange-50/50',
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#98a2b3]">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p className={cn('mt-0.5 text-[13px] font-bold', isToday(day) ? 'text-[#F26F21]' : 'text-[#151c27]')}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Day bodies */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = toDateKey(day);
            const items = byDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={cn(
                  'min-h-[320px] border-r border-[#e5e7eb] p-2 last:border-r-0',
                  isToday(day) && 'bg-orange-50/30',
                )}
              >
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                ) : items.length === 0 ? (
                  <p className="pt-6 text-center text-[11px] font-medium text-[#c4cad4]">Free</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((appointment) => (
                      <button
                        key={appointment.id}
                        type="button"
                        onClick={() => onSelect(appointment)}
                        className={cn(
                          'rounded-lg border border-[#e5e7eb] border-l-[3px] p-2 text-left transition-shadow hover:shadow-sm',
                          STATUS_BG[appointment.status],
                          STATUS_BORDER[appointment.status],
                        )}
                      >
                        <p className="text-[12px] font-bold text-[#151c27]">
                          {formatIsoTime(appointment.startTime)}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] font-medium text-[#151c27]">
                          {appointment.studentName}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-[#555f6f]">{appointment.reason}</p>
                        <div className="mt-1.5">
                          <BookingStatusBadge status={appointment.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** "Oct 20 – Oct 26, 2026" label of the displayed week. */
export const weekLabel = (weekAnchor: Date): string => {
  const days = weekDays(weekAnchor);
  const first = days[0];
  const last = days[6];
  const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (first.getMonth() === last.getMonth()) {
    return `${first.toLocaleDateString('en-US', fmt)} – ${last.getDate()}, ${last.getFullYear()}`;
  }
  return `${first.toLocaleDateString('en-US', fmt)} – ${last.toLocaleDateString('en-US', { ...fmt, year: 'numeric' })}`;
};

/** Previous / next week anchors. */
export const shiftWeek = (weekAnchor: Date, weeks: number): Date => addDays(weekAnchor, weeks * 7);
