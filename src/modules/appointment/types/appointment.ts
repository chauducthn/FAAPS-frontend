// src/types/appointment.ts
// Endpoints covered:
//   POST /advisor/availability
//   GET  /appointments/available-slots
//   POST /student/appointments
//   PUT  /advisor/appointments/{id}/status

/** Status of a booking request from the student point of view. */
export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

/** States an advisor can move an appointment into. */
export type AppointmentDecision = 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

/** ISO weekday index used by the availability configuration: 1 = Monday ... 7 = Sunday. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** A bookable window. Times are ISO-8601 date-times. Duration comes from the backend (startTime/endTime). */
export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

/** One availability window of the advisor's weekly template. */
export interface AvailabilitySlot {
  dayOfWeek: IsoWeekday;
  /** "HH:mm" */
  startTime: string;
  /** "HH:mm" */
  endTime: string;
}

/** Body of POST /advisor/availability. */
export interface ConfigureAvailabilityDto {
  slots: AvailabilitySlot[];
}

/** Body of POST /student/appointments. */
export interface BookAppointmentDto {
  /** Optional: when omitted the backend uses the student's assigned advisor. */
  advisorId?: string;
  /** ISO-8601 start of the chosen slot. */
  startTime: string;
  reason: string;
}

/** Body of PUT /advisor/appointments/{id}/status. */
export interface UpdateAppointmentStatusDto {
  status: AppointmentDecision;
  /** Mandatory when rejecting/cancelling. */
  reason?: string;
  /** Consultation summary — mandatory when completing, editable afterwards. */
  consultationSummary?: string;
}

/** One appointment as seen by the advisor, in the weekly calendar. */
export interface AdvisorAppointment {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string | null;
  /** ISO-8601 start of the session. */
  startTime: string;
  /** ISO-8601 end of the session. */
  endTime: string;
  reason: string;
  status: BookingStatus;
  /** Populated when the advisor rejected the request. */
  decisionNote: string | null;
  /** Consultation summary written after a completed session. */
  consultationSummary: string | null;
  createdAt: string;
}

/** An appointment as seen by the advisor (and by the student, mirrored). */
export interface BookedAppointment {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string | null;
  advisorId: string;
  advisorName: string;
  /** ISO-8601 start of the session. */
  startTime: string;
  /** ISO-8601 end of the session. */
  endTime: string;
  reason: string;
  status: BookingStatus;
  /** Populated when the advisor rejected the request. */
  decisionNote: string | null;
  /** Consultation summary written after a completed session. */
  consultationSummary: string | null;
  createdAt: string;
}
