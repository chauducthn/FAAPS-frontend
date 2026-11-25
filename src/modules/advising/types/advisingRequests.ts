// Advising request and notification domain types and DTOs.

import type {
  AdvisingRequestDecision,
  AdvisingRequestStatus,
  AdvisingRequestType,
  NotificationType,
} from './advisingEntities';

/** Advising request with joined student and advisor names. */
export interface AdvisingRequest {
  id: string;
  studentId: string;
  studentName: string | null;
  studentCode: string | null;
  advisorId: string | null;
  advisorName: string | null;
  studyPlanId: string | null;
  requestType: AdvisingRequestType;
  title: string;
  description: string | null;
  status: AdvisingRequestStatus;
  resolvedAt: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
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

/** Body for PUT /advisor/advising-requests/{id}/status. */
export interface UpdateAdvisingRequestStatusDto {
  status: AdvisingRequestDecision;
  resolutionSummary?: string;
}
