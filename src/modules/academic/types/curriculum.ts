// src/types/curriculum.ts
// Mirrors the backend AdminCurriculumService records. In the backend a "cohort" and a "curriculum" are the
// same record (curriculum_versions: one major + one version such as K19), exposed under two URLs.

export type CurriculumStatus = 'ACTIVE' | 'INACTIVE';

export interface CurriculumItem {
  id: string;
  majorId: string;
  majorCode: string;
  majorName: string;
  version: string; // e.g. "K19"
  name: string;
  effectiveFromSemesterId: string;
  effectiveFromSemesterCode: string;
  effectiveFromDate: string | null;
  effectiveToSemesterId: string | null;
  effectiveToSemesterCode: string | null;
  effectiveToDate: string | null;
  description: string | null;
  isCurrent: boolean;
  status: CurriculumStatus;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumCourseItem {
  id: string; // curriculum_courses.id
  curriculumId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseStatus: string;
  semesterNumber: number;
  isMandatory: boolean;
  groupName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumPage {
  items: CurriculumItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CurriculumFilterParams {
  search?: string;
  majorId?: string;
  status?: CurriculumStatus;
  page?: number;
  size?: number;
}

export interface CurriculumInput {
  majorId: string;
  version: string;
  name: string;
  effectiveFromSemesterId: string;
  effectiveToSemesterId: string | null;
  description: string | null;
  isCurrent: boolean;
  status: CurriculumStatus;
}

export interface AddCurriculumCoursesInput {
  courseIds: string[];
  semesterNumber: number;
  isMandatory: boolean;
}

/** A semester the form can pick from the backend semester catalogue. */
export interface SemesterOption {
  id: string;
  code: string;
  startDate: string | null;
}
