// Types for Student Portal and Advisor Portal profiles and assignments.

/** advising_requests.request_type */
export type AdvisingRequestType =
  | 'PLAN_REVIEW'
  | 'COURSE_SELECTION'
  | 'ACADEMIC_GUIDANCE'
  | 'GRADUATION_CHECK'
  | 'OTHER';

/** advising_requests.status */
export type AdvisingRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/** Advisor decision statuses for advising requests. */
export type AdvisingRequestDecision = 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/** students.academic_status */
export type AcademicStatus =
  | 'ACTIVE'
  | 'PROBATION'
  | 'SUSPENDED'
  | 'GRADUATED'
  | 'WITHDRAWN'
  | 'LEAVE_OF_ABSENCE';

/** advisors.status */
export type AdvisorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

/** notifications.notification_type */
export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'REMINDER'
  | 'PLAN_STATUS'
  | 'MESSAGE'
  | 'ADVISOR_REQUEST';

/**
 * The academic profile of a student: everything the students table adds on top of the shared identity
 * (see the shared /api/profile endpoint for the name, email, phone and date of birth).
 */
export interface StudentProfile {
  id: string;
  studentCode: string;
  majorId: string | null;
  majorCode: string | null;
  majorName: string | null;
  curriculumVersionId: string | null;
  /** The curriculum version label, e.g. "K19". */
  cohort: string | null;
  currentSemester: number;
  currentGpa: number | null;
  totalCreditsEarned: number;
  academicStatus: AcademicStatus;
}

/** Primary advisor assigned to the current student. */
export interface AdvisorInfo {
  id: string;
  advisorCode: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  maxAdvisees: number;
  status: AdvisorStatus;
  assignmentStartDate: string | null;
  assignedDate: string | null;
  groupName: string | null;
  isPrimary: boolean;
}

/** Student assigned to the current advisor. */
export interface AdviseeStudent {
  id: string;
  studentCode: string;
  fullName: string | null;
  email: string;
  majorCode: string;
  majorName: string;
  curriculumVersion: string;
  currentSemester: number;
  currentGpa: number | null;
  totalCreditsEarned: number;
  academicStatus: AcademicStatus;
  enrollmentSemesterCode: string | null;
  assignedDate: string | null;
  groupName: string | null;
  isPrimary: boolean;
}
