// Advising request and notification domain types and DTOs.

import type {
  AdvisingRequestDecision,
  AdvisingRequestStatus,
  AdvisingRequestType,
  NotificationType,
} from './advisingEntities';

/** Advising ticket with joined student and advisor names. */
export interface AdvisingRequest {
  id: string;
  studentId: string;
  studentName: string | null;
  studentCode: string | null;
  /** The advisor holding the ticket (null while PENDING), not the student's assigned advisor. */
  advisorId: string | null;
  advisorName: string | null;
  studentMajorCode?: string | null;
  studentMajorName?: string | null;
  studentMajorGroupId?: string | null;
  /** major_groups.code of the student, e.g. "BIT". */
  studentMajorGroupCode?: string | null;
  studentMajorGroupName?: string | null;
  /** Whether the student shares the signed-in advisor's major group. */
  sameMajorGroup?: boolean;
  /** Whether the signed-in advisor holds the ticket or has replied in it. */
  participatedByMe?: boolean;
  studyPlanId: string | null;
  /** advising_sessions.id of the appointment booked from this ticket, if any. */
  linkedAppointmentId?: string | null;
  requestType: AdvisingRequestType;
  title: string;
  description: string | null;
  status: AdvisingRequestStatus;
  resolvedAt: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

/** One message in a ticket thread (advising_messages). */
export interface AdvisingMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  /** Advisor-only internal note, hidden from the student. */
  internal: boolean;
  createdAt: string;
}

/** A ticket with its full message thread. */
export interface AdvisingRequestDetail {
  request: AdvisingRequest;
  messages: AdvisingMessage[];
}

/** Notification item for the current user. */
export interface StudentNotification {
  id: string;
  recipientUserId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  relatedStudentId: string | null;
  resolvedAt: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/** Body for POST /student/advising-requests. */
export interface CreateAdvisingRequestDto {
  requestType: AdvisingRequestType;
  title: string;
  description?: string;
  studyPlanId?: string;
}

/** Body for PATCH /advisor/advising-requests/{id}/status. */
export interface UpdateAdvisingRequestStatusDto {
  status: AdvisingRequestDecision;
  /** Required for RESOLVED and REJECTED; never sent when claiming (IN_PROGRESS). */
  resolutionSummary?: string;
}
