// src/types/curriculum.ts
// DBML reference:
//   curriculum_versions (id, major_id, version, name, effective_from_semester_id,
//                        effective_to_semester_id, description, is_current, status)
//   curriculum_courses (curriculum_version_id, course_id, semester_number,
//                       is_mandatory, group_name)

export type CurriculumStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface CurriculumSummary {
  id: string;
  majorId: string;
  majorCode: string;
  majorName: string;
  version: string;          // e.g. "K18", "K19"
  name: string;             // e.g. "Software Engineering Curriculum 2024"
  effectiveFromSemesterId: string;
  effectiveFromSemesterCode: string; // e.g. "SP2026"
  effectiveToSemesterId: string | null;
  effectiveToSemesterCode: string | null;
  totalCourses: number;
  totalCredits: number;
  isCurrent: boolean;
  status: CurriculumStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumDetail extends CurriculumSummary {
  description: string | null;
  // Grouped by semester_number so FE can render an accordion per semester
  semesters: CurriculumSemester[];
}

export interface CurriculumSemester {
  semesterNumber: number;
  totalCredits: number;
  courses: CurriculumCourseItem[];
}

export interface CurriculumCourseItem {
  curriculumCourseId: string; // curriculum_courses.id
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  categoryCode: string;
  isMandatory: boolean;
  groupName: string | null;
}

export interface CurriculumFilterParams {
  search?: string;
  majorId?: string;
  status?: CurriculumStatus | 'ALL';
  isCurrent?: boolean | 'ALL';
  page?: number;
  size?: number;
  sort?: 'version,asc' | 'version,desc' | 'createdAt,desc' | 'createdAt,asc';
}

export interface CreateCurriculumDto {
  majorId: string;
  version: string;
  name: string;
  effectiveFromSemesterId: string;
  effectiveToSemesterId?: string | null;
  description?: string | null;
  isCurrent?: boolean;
}

export interface UpdateCurriculumDto extends Partial<CreateCurriculumDto> {
  status?: CurriculumStatus;
}

export interface AddCurriculumCourseDto {
  courseId: string;
  semesterNumber: number;
  isMandatory: boolean;
  groupName?: string;
}

export interface UpdateCurriculumCourseDto {
  semesterNumber?: number;
  isMandatory?: boolean;
  groupName?: string | null;
}

export type CurriculumBulkAction = 'PUBLISH' | 'ARCHIVE' | 'DELETE';
export interface CurriculumBulkRequest {
  curriculumIds: string[];
  action: CurriculumBulkAction;
}