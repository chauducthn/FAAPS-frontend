// src/types/course.ts
// DBML reference:
//   courses (id, code, name, credits, category_id, description, objectives,
//            learning_outcomes, status)
//   course_prerequisites (course_id, prerequisite_course_id, group_no, type, minimum_score)
//   course_categories (id, code, name)

export type CourseStatus = 'ACTIVE' | 'INACTIVE';
export type PrerequisiteType = 'PREREQUISITE' | 'CO_REQUISITE';
export type RelationKind = 'PREREQUISITE' | 'CO_REQUISITE' | 'REPLACEMENT';

export interface CourseCategory {
  id: string;
  code: string;
  name: string;
}

export interface CourseSummary {
  id: string;
  code: string;
  name: string;
  credits: number;
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  status: CourseStatus;
  prerequisiteCount: number;
  usedInCurriculumCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetail extends CourseSummary {
  description: string | null;
  objectives: string | null;
  learningOutcomes: string | null;
  // Flat list of relations this course has to other courses
  relations: CourseRelation[];
  // Courses that list THIS course as a prerequisite
  referencedBy: { courseId: string; courseCode: string; courseName: string }[];
}

export interface CourseRelation {
  relationId: string;            // course_prerequisites.id
  kind: RelationKind;
  groupNo: number;               // rows with the same group_no are alternatives (OR)
  otherCourseId: string;
  otherCourseCode: string;
  otherCourseName: string;
  minimumScore: number | null;
}

export interface CourseFilterParams {
  search?: string;
  categoryId?: string;
  status?: CourseStatus | 'ALL';
  page?: number;
  size?: number;
  sort?: 'code,asc' | 'code,desc' | 'credits,asc' | 'credits,desc' | 'createdAt,desc';
}

export interface CreateCourseDto {
  code: string;
  name: string;
  credits: number;
  categoryId: string;
  description?: string | null;
  objectives?: string | null;
  learningOutcomes?: string | null;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  status?: CourseStatus;
}

export interface AddCourseRelationDto {
  kind: RelationKind;
  groupNo: number;
  otherCourseId: string;
  minimumScore?: number | null;
}

export interface UpdateCourseRelationDto {
  groupNo?: number;
  minimumScore?: number | null;
}