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
