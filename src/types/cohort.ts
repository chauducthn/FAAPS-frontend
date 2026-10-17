// src/types/cohort.ts
// DBML: cohorts are represented by `students.enrollment_semester_id` (semesters table)
// and `student_advisor_assignments.group_name` (e.g. "K18 - SE"). The Cohort concept
// on the FE is the admin-friendly view: a "Kxx" generation + associated majors.

export type CohortStatus = 'ACTIVE' | 'INACTIVE';
export type AdmissionStatus = 'PLANNED' | 'INTAKE_OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface Cohort {
  id: string;                       // semester id used as cohort id
  code: string;                     // e.g. "K18", "K19"
  name: string;                     // e.g. "K18 - Fall 2023"
  startDate: string;                // ISO date
  endDate: string;                  // ISO date
  isCurrent: boolean;
  status: CohortStatus;
  // Aggregated counts returned by BE (never computed on FE)
  totalStudents: number;
  activeStudents: number;
  totalAdvisors: number;
  totalMajors: number;
  createdAt: string;
  updatedAt: string;
}

export interface CohortMajorLink {
  cohortId: string;
  majorId: string;
  majorCode: string;
  majorName: string;
  students: number;
}

export interface CohortFilterParams {
  search?: string;
  status?: CohortStatus | 'ALL';
  admissionStatus?: AdmissionStatus | 'ALL';
  page?: number;
  size?: number;
  sort?: 'code,asc' | 'code,desc' | 'startDate,asc' | 'startDate,desc';
}

export interface CreateCohortDto {
  code: string;                     // K18
  name: string;
  startDate: string;                // ISO date
  endDate: string;
  majorIds: string[];               // majors attached at creation
  isCurrent?: boolean;
}

export interface UpdateCohortDto extends Partial<CreateCohortDto> {
  status?: CohortStatus;
  admissionStatus?: AdmissionStatus;
}