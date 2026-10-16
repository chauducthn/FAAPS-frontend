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
