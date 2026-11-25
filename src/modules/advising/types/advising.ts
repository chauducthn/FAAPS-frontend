// Re-export all advising domain types for backward compatibility.

export type {
  AcademicStatus,
  AdviseeStudent,
  AdvisingRequestDecision,
  AdvisingRequestStatus,
  AdvisingRequestType,
  AdvisorInfo,
  AdvisorStatus,
  NotificationType,
  StudentProfile,
} from './advisingEntities';

export type {
  AdvisingRequest,
  CreateAdvisingRequestDto,
  StudentNotification,
  UpdateAdvisingRequestStatusDto,
} from './advisingRequests';
