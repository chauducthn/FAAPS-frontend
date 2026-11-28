// Maps the student course-detail response onto the shared course-detail shape used by the detail views.

import type { CourseDetail as StudentCourseDetail } from '../../../academic/services/studentAcademicService';
import type { CourseDetail as AdminCourseDetail } from '../../../academic/types/course';

export function adaptStudentCourseDetail(data: StudentCourseDetail | undefined): AdminCourseDetail | null {
  if (!data) return null;
  const { course, prerequisites } = data;
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    credits: course.credits,
    categoryId: course.category,
    categoryCode: course.category,
    categoryName: course.category,
    specialization: null,
    status: 'ACTIVE',
    prerequisiteCount: prerequisites.length,
    usedInCurriculumCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: course.description,
    objectives: course.objectives,
    learningOutcomes: course.learningOutcomes,
    materialLink: course.materialLink ?? null,
    knowledgeBlock: course.knowledgeBlock ?? null,
    gradingStructure: course.gradingStructure ?? null,
    workload: course.workload ?? null,
    relations: prerequisites.map((p) => ({
      relationId: p.id,
      kind: p.type === 'REPLACEMENT' ? 'REPLACEMENT' : 'PREREQUISITE',
      groupNo: p.groupNo,
      otherCourseId: p.courseCode,
      otherCourseCode: p.courseCode,
      otherCourseName: p.courseName,
      minimumScore: p.minimumScore,
    })),
    referencedBy: [],
  };
}

