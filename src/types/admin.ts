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
