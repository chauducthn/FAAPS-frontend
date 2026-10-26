export interface AdminPage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DashboardAccounts {
  students: number;
  advisors: number;
  cohorts: number;
}

export interface MonthlyCount {
  month: string; // yyyy-MM
  students: number;
}

export type AiReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface AiReportSummary {
  id: string;
  conversationId: string;
  studentId: string;
  studentName: string;
  studentCode: string | null;
  reason: string;
  status: AiReportStatus;
  flaggedCount: number;
  createdAt: string;
}

export interface AiReportHeader {
  id: string;
  conversationId: string;
  studentId: string;
  studentName: string;
  studentCode: string | null;
  reason: string;
  studentNote: string | null;
  status: AiReportStatus;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AiReportMessage {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
  reported: boolean;
  studentNote: string | null;
}

export interface AiReportSource {
  messageId: string;
  relevanceScore: number | null;
  quotedText: string | null;
  rankPosition: number | null;
  sectionTitle: string | null;
  documentTitle: string | null;
}

export interface AiReportDetail {
  report: AiReportHeader;
  messages: AiReportMessage[];
  sources: AiReportSource[];
}

export type AdminUserRole = 'STUDENT' | 'ADVISOR';
export type AdminUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface AdminUserSummary {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  majorId: string | null;
  majorName: string | null;
  curriculumVersionId: string | null;
  curriculumCode: string | null;
  enrollmentSemesterId: string | null;
  currentSemester: number | null;
  academicStatus: string | null;
}

export interface UserEditOption { id: string; code: string; name: string; majorId: string | null }
export interface UserEditOptions {
  majors: UserEditOption[];
  curricula: UserEditOption[];
  semesters: UserEditOption[];
}

export type UserSort = 'createdAt,desc' | 'createdAt,asc' | 'fullName,asc' | 'fullName,desc' | 'userId,asc' | 'userId,desc';

export interface AssignmentAdvisor {
  id: string;
  email: string;
  fullName: string;
  maxAdvisees: number | null;
  activeStudents: number;
}

export interface AssignmentCohort {
  cohort: string;
  students: number;
}

export interface AssignmentStudent {
  id: string;
  studentCode: string;
  fullName: string;
  cohortId: string;
  cohort: string;
  majorCode: string;
  advisorId: string | null;
  advisorName: string | null;
  assignedDate: string | null; // yyyy-MM-dd
}

export interface CohortLite {
  cohortId: string;
  cohort: string;
  majorCode: string;
  students: number;
}

export interface AdvisorAssignmentDetail {
  advisor: AssignmentAdvisor;
  email: string | null;
  status: string;
  students: AssignmentStudent[];
  /** Every cohort in the system. */
  cohorts: CohortLite[];
  /** Cohorts this advisor is configured for (counts are the cohort's total students). */
  configuredCohorts: CohortLite[];
}

export interface AssignmentHistoryRecord {
  id: string;
  advisorId: string;
  advisorEmail: string;
  advisorName: string;
  assignedDate: string; // yyyy-MM-dd
  assignedAt: string | null; // local date-time
  assignedByUserId: string | null;
  assignedByName: string | null;
  notes: string | null;
  endDate: string | null;
  status: string;
}

export interface AutoAssignPreview {
  cohort: string;
  unassignedStudents: number;
  allocation: Record<string, number>;
}

// ---- cohort-based advisor assignment workflow (cohort = major + cohort label, identified by cohortId)
export interface SummaryCohort {
  cohortId: string;
  cohort: string;
  majorCode: string;
  total: number;
  assigned: number;
  unassigned: number;
}

export interface AssignmentSummary {
  total: number;
  assigned: number;
  unassigned: number;
  missingAcademicProfile: number;
  pendingAdvisorRequests: number;
  cohorts: SummaryCohort[];
}

export interface UnassignedStudent {
  id: string;
  studentCode: string;
  fullName: string;
  cohortId: string;
  cohort: string;
  majorCode: string;
  hasPendingRequest: boolean;
}

/** One row per advisor and cohort; advisors with no cohort come back with cohortId = null. */
export interface AdvisorCohortRow {
  advisorId: string;
  email: string;
  fullName: string;
  maxAdvisees: number | null;
  status: string;
  cohortId: string | null;
  cohort: string | null;
  majorCode: string | null;
  inPool: boolean;
  studentCount: number;
}

export interface CohortPoolAdvisor {
  advisorId: string;
  email: string;
  fullName: string;
  maxAdvisees: number | null;
  cohortStudents: number;
}

export interface CohortAssignPreview {
  cohortId: string;
  advisorId: string;
  unassignedStudents: number;
  totalAfter: number;
  overLimitBy: number;
  warning: boolean;
}

export interface CohortAssignResult {
  assigned: number;
  advisorId: string;
  overLimitBy: number;
  warning: boolean;
}

export interface AutoAllocation {
  advisorId: string;
  assigned: number;
  totalBefore: number;
  totalAfter: number;
  overLimitBy: number;
  warning: boolean;
}

export interface CohortAutoAssignResponse {
  cohortId: string;
  assigned: number;
  allocation: AutoAllocation[];
  warning: boolean;
}

export interface AppointmentImpact {
  appointmentId: string;
  studentId: string;
  currentAdvisorId: string;
  scheduledAt: string;
}

export interface AssignPreview {
  scheduledAppointments: AppointmentImpact[];
  appointmentCount: number;
  warning: boolean;
}

export interface AssignResult {
  assigned: number;
  overLimitBy: number;
  warning: boolean;
}

export interface AdvisorLimitResult {
  advisorId: string;
  maxAdvisees: number;
  activeStudents: number;
  overLimitBy: number;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  relatedStudentId: string | null;
  studentCode: string | null;
  cohortId: string | null;
  resolvedAt: string | null;
  isRead: boolean;
  createdAt: string;
}

/** Event pushed to the current admin's notification queue when a student asks for an advisor. */
export interface AdvisorRequestEvent {
  type: 'ADVISOR_REQUEST';
  studentCode: string;
  cohortId: string;
  createdAt: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  scheduledAt: string | null;
  endedAt: string | null;
  location: string | null;
  agenda: string | null;
  status: AppointmentStatus;
}

export interface AppointmentSummary {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface AutoAssignResult {
  assigned: number;
  allocation: Record<string, number>;
}
