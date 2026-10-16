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

export type AdminUserRole = 'STUDENT' | 'ADVISOR' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface AdminUserSummary {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  majorId: string | null;
  majorName: string | null;
  curriculumVersionId: string | null;
  curriculumCode: string | null;
  currentSemester: number | null;
  academicStatus: string | null;
  advisorCode: string | null;
}

export type UserSort = 'createdAt,desc' | 'createdAt,asc' | 'fullName,asc' | 'fullName,desc' | 'userId,asc' | 'userId,desc';

export interface AssignmentAdvisor {
  id: string;
  advisorCode: string;
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
  cohort: string;
  advisorId: string | null;
  advisorName: string | null;
}

export interface AdvisorAssignmentDetail {
  advisor: AssignmentAdvisor;
  students: AssignmentStudent[];
}

export interface AssignmentHistoryRecord {
  id: string;
  advisorId: string;
  advisorName: string;
  assignedDate: string; // yyyy-MM-dd
  endDate: string | null;
  status: string;
}

export interface AutoAssignPreview {
  cohort: string;
  unassignedStudents: number;
  allocation: Record<string, number>;
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
