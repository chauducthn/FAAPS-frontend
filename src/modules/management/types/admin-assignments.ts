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

export interface AutoAssignResult {
  assigned: number;
  allocation: Record<string, number>;
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
