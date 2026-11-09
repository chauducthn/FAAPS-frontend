// The next appointment of the student on the dashboard.

import { Link } from 'react-router';
import { CalendarClock } from 'lucide-react';
import { BookingStatusBadge } from '../../appointment/components/AppointmentBits';
import type { BookedAppointment } from '../../appointment/types/appointment';

const OPEN_STATUSES = ['PENDING', 'ACCEPTED'];

/** The earliest appointment that is still waiting for the advisor, or accepted, and not over yet. */
export const nextAppointment = (items: BookedAppointment[], now = Date.now()): BookedAppointment | null =>
  items
    .filter((item) => OPEN_STATUSES.includes(item.status) && new Date(item.endTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] ?? null;

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export function UpcomingAppointmentCard({
  appointments,
  isLoading,
}: {
  appointments: BookedAppointment[] | undefined;
  isLoading: boolean;
}) {
  const next = appointments ? nextAppointment(appointments) : null;

  return (
    <section className="flex flex-col rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#151c27]">Upcoming Appointment</h2>
        <Link to="/student/appointments" className="text-[13px] font-semibold text-[#F26F21] hover:underline">
          Manage
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      ) : next ? (
        <div className="mt-4 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-[#F26F21]">
            <CalendarClock className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#151c27]">{formatDay(next.startTime)}</p>
            <p className="text-[13px] text-[#555f6f]">
              {formatTime(next.startTime)} – {formatTime(next.endTime)} · {next.advisorName}
            </p>
            {next.reason && <p className="mt-1 line-clamp-2 text-[13px] text-[#555f6f]">{next.reason}</p>}
          </div>
          <BookingStatusBadge status={next.status} />
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm font-semibold text-[#151c27]">No upcoming appointment</p>
          <Link
            to="/student/appointments"
            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-semibold text-[#555f6f] hover:bg-gray-50"
          >
            Book an appointment
          </Link>
        </div>
      )}
    </section>
  );
}
