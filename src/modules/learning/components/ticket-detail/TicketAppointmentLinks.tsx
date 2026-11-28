// Ticket to appointment link: a "booked" card once an appointment exists, otherwise a booking shortcut.

import { Link } from 'react-router';
import { CalendarCheck, CalendarPlus } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { STUDENT_APPOINTMENTS_PATH } from '../../../advising/utils/appointmentLink';

interface TicketAppointmentLinksProps {
  hasLinkedAppointment: boolean;
  /** Booking URL carrying the ticket id; null when booking is not offered. */
  bookingLink: string | null;
}

export function TicketAppointmentLinks({ hasLinkedAppointment, bookingLink }: TicketAppointmentLinksProps) {
  if (hasLinkedAppointment) {
    return (
      <section role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <CalendarCheck className="size-4 shrink-0" aria-hidden />
          Appointment booked
        </p>
        <p className="mt-1 text-[13px] text-emerald-800">
          A session for this request is scheduled. You can view or reschedule it on the Appointments page.
        </p>
        <Link
          to={STUDENT_APPOINTMENTS_PATH}
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-800 underline hover:text-emerald-900"
        >
          Go to Appointments
        </Link>
      </section>
    );
  }
  if (!bookingLink) return null;
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3.5 ring-1 ring-inset ring-[#f1f5f9]">
      <p className="text-sm font-semibold text-[#151c27]">Need a face-to-face session?</p>
      <p className="mt-1 text-[13px] text-[#555f6f]">
        Book an appointment for this request — it will be linked to the ticket so your advisor sees the same context.
      </p>
      <Link
        to={bookingLink}
        className={cn(
          'mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#F26F21] px-3.5 py-2 text-[13px] font-bold text-white',
          'transition-colors hover:bg-[#e05f14]',
        )}
      >
        <CalendarPlus className="size-4" aria-hidden />
        Book Appointment
      </Link>
    </section>
  );
}
