// Orange gradient hero header for the advisor appointment action modal.

import { CalendarDays, Clock } from 'lucide-react';
import { formatIsoDay, formatIsoTime } from '../../../../shared/lib/appointmentDate';
import type { AdvisorAppointment } from '../../types/appointment';
import { BookingStatusBadge } from '../AppointmentBits';
import { initialsOf } from './types';

interface AppointmentModalHeroProps {
  appointment: AdvisorAppointment;
}

export function AppointmentModalHero({ appointment }: AppointmentModalHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#F26F21] to-[#ff8f3f] px-6 pb-5 pt-6 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 right-24 size-32 rounded-full bg-white/10" />
      <div className="relative flex flex-wrap items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white/95 text-lg font-bold text-[#F26F21] shadow">
          {initialsOf(appointment.studentName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Appointment · {appointment.studentCode ?? '—'}
          </p>
          <h2 className="mt-0.5 truncate text-xl font-bold">{appointment.studentName}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-white/90">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatIsoDay(appointment.startTime)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {formatIsoTime(appointment.startTime)} – {formatIsoTime(appointment.endTime)}
            </span>
          </p>
        </div>
        <BookingStatusBadge status={appointment.status} />
      </div>
    </div>
  );
}
