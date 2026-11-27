// src/modules/advising/utils/appointmentLink.ts
// Helpers that tie an advising TICKET to an APPOINTMENT.
//
// The backend stores `advising_sessions.advising_request_id`, so an appointment
// booked from a ticket can be traced back to it, and a ticket can expose the
// appointment created from it via `linkedAppointmentId`.
//
// Two directions are used by the UI:
//   • Student  : ticket → "Book Appointment" → /student/appointments?advisingRequestId=<id>
//   • Advisor  : ticket → "Schedule Appointment" → advisor booking form (?advisingRequestId=<id>)

/** Where the student books an appointment. */
export const STUDENT_APPOINTMENTS_PATH = '/student/appointments';

/** Where the advisor manages their appointments. */
export const ADVISOR_APPOINTMENTS_PATH = '/advisor/appointments';

/** Name of the query parameter that carries the ticket id. */
export const ADVISING_REQUEST_PARAM = 'advisingRequestId';

/**
 * Build the student booking URL for a ticket.
 * Returns null when the ticket id is missing (nothing to link).
 */
export function studentBookingLink(advisingRequestId: string | null | undefined): string | null {
  if (!advisingRequestId) return null;
  return `${STUDENT_APPOINTMENTS_PATH}?${ADVISING_REQUEST_PARAM}=${encodeURIComponent(advisingRequestId)}`;
}

/**
 * Build the advisor scheduling URL for a ticket.
 * Returns null when the ticket id is missing (nothing to link).
 */
export function advisorSchedulingLink(advisingRequestId: string | null | undefined): string | null {
  if (!advisingRequestId) return null;
  return `${ADVISOR_APPOINTMENTS_PATH}?${ADVISING_REQUEST_PARAM}=${encodeURIComponent(advisingRequestId)}`;
}

/**
 * Read the ticket id out of a `?advisingRequestId=` search param.
 * Returns null when absent or blank.
 */
export function advisingRequestIdFromParams(params: URLSearchParams): string | null {
  const raw = params.get(ADVISING_REQUEST_PARAM);
  const value = raw?.trim();
  return value ? value : null;
}
