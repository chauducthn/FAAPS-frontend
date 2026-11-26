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
  /** The API may omit a name; renderers must fall back to a placeholder. */
  studentName: string | null;
  advisorId: string;
  advisorName: string | null;
  scheduledAt: string | null;
  endedAt: string | null;
  location: string | null;
  agenda: string | null;
  decisionNote?: string | null;
  consultationSummary?: string | null;
  status: AppointmentStatus;
}

/** A metric compared to the same metric a week earlier. */
export interface MetricDelta {
  /** Percentage change against the previous week. */
  percent: number;
  /** True when the change is good news for this metric. */
  positive: boolean;
}

export interface AppointmentSummary {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  /**
   * Week-over-week comparison per metric. Absent when the API cannot provide
   * one, in which case the KPI card renders no delta chip.
   */
  deltas?: Partial<Record<'total' | AppointmentStatus, MetricDelta>>;
}
