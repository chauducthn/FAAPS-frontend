// Cohort-based advisor assignment workflow (cohort = major + cohort label, identified by cohortId).

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
  atRiskAssigned?: number;
  totalBefore: number;
  totalAfter: number;
  maxAdvisees?: number | null;
  utilizationPct?: number;
  overLimitBy: number;
  warning: boolean;
}

export interface CohortAutoAssignResponse {
  cohortId: string;
  assigned: number;
  unassignedRemaining?: number;
  atRiskAssigned?: number;
  totalTarget?: number;
  allowOverLimit?: boolean;
  allocation: AutoAllocation[];
  warning: boolean;
}

export interface SmartBatchAssignResult {
  cohortsProcessed: number;
  poolsConfigured: number;
  advisorsAddedToPools: number;
  assigned: number;
  atRiskAssigned: number;
  unassignedRemaining: number;
  skippedNoPool: number;
}

export interface UnassignAllResult {
  unassignedStudents: number;
  clearedPools: number;
  cancelledSessions: number;
}
