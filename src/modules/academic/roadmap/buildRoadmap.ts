// src/modules/academic/roadmap/buildRoadmap.ts
// Turns the flat curriculum-course list from the API into the Academic Roadmap board shape:
// one column per semester, one card per course, credits summed per column.
import type { CurriculumCourseItem } from '../types/curriculum';
import type {
  RoadmapCourse,
  RoadmapCourseSource,
  RoadmapMilestone,
  RoadmapPrerequisite,
  RoadmapSemester,
} from '../types/roadmap';

/** The board always shows this many columns, even when a curriculum is shorter. */
export const MIN_SEMESTERS = 9;

/** Semester columns are wide enough for a course card to breathe without truncation. */
export const SEMESTER_COLUMN_WIDTH = 280;

const isPrerequisite = (value: RoadmapPrerequisite | undefined): value is RoadmapPrerequisite =>
  !!value && value.code.trim().length > 0;

/**
 * Groups curriculum courses into semester columns.
 * Semesters with no courses still get a column so the board keeps its shape.
 */
export function buildRoadmap(
  courses: (CurriculumCourseItem | RoadmapCourseSource)[],
  options: { minSemesters?: number } = {},
): RoadmapSemester[] {
  const minSemesters = options.minSemesters ?? MIN_SEMESTERS;
  const source = courses as RoadmapCourseSource[];

  const lastSemester = source.reduce((max, course) => Math.max(max, course.semesterNumber), 0);
  const columnCount = Math.max(minSemesters, lastSemester);

  return Array.from({ length: columnCount }, (_, index) => {
    const number = index + 1;
    const inSemester = source.filter((course) => course.semesterNumber === number);

    const cards: RoadmapCourse[] = inSemester.map((course) => ({
      id: course.id,
      courseId: course.courseId,
      code: course.courseCode,
      name: course.courseName,
      credits: course.credits,
      semesterNumber: course.semesterNumber,
      kind: course.isMandatory ? 'MANDATORY' : 'ELECTIVE',
      categoryLabel: course.categoryLabel ?? course.groupName ?? null,
      groupName: course.groupName,
      prerequisites: (course.prerequisites ?? []).filter(isPrerequisite),
      milestone: course.milestone ?? null,
    }));

    return {
      number,
      credits: cards.reduce((sum, card) => sum + card.credits, 0),
      courses: cards,
    };
  });
}

/**
 * Reads the "Prereq >= 70 Credits" style requirement out of a milestone definition.
 * Kept separate so the page can build milestones from an API payload without duplicating parsing.
 */
export function milestoneFrom(
  badge: string,
  description?: string | null,
  requirement?: string | null,
): RoadmapMilestone {
  return { badge, description: description ?? null, requirement: requirement ?? null };
}
