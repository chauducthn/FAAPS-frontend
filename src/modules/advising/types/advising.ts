// Re-export all advising domain types for backward compatibility.

export type {
  AcademicStatus,
  AdviseeStudent,
  AdvisingRequestDecision,
  AdvisingRequestScope,
  AdvisingRequestStatus,
  AdvisingRequestType,
  AdvisorInfo,
  AdvisorStatus,
  NotificationType,
  StudentProfile,
} from './advisingEntities';

export type {
  AdvisingMessage,
  AdvisingRequest,
  AdvisingRequestDetail,
  CreateAdvisingRequestDto,
  StudentNotification,
  UpdateAdvisingRequestStatusDto,
} from './advisingRequests';
