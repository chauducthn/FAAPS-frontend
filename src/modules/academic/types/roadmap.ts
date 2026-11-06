// src/modules/academic/types/roadmap.ts
// View model of the Academic Roadmap board (curriculum detail).
// The API answers with a flat list of curriculum courses; the board renders that list as
// one column per semester, one card per course.
import type { CurriculumCourseItem } from './curriculum';

/** A mandatory course is counted toward graduation; an elective one can be swapped for its group.
 * FPT UI no longer shows this distinction — kept only for backend compatibility.
 * The visible grouping is `specialization` (Chuyên ngành hẹp, from semester 5, deep-dived in sem 7-9). */
export type RoadmapCourseKind = 'MANDATORY' | 'ELECTIVE';

/** One course-level prerequisite, mirrored from course_prerequisites. */
export interface RoadmapPrerequisite {
  /** Prerequisite course code, e.g. "PRF192". */
  code: string;
  /** Minimum score on the 10-point scale, when the relation carries one. */
  minimumScore: number | null;
  /** Catalogue id of the prerequisite course, when known (for cross-navigation). */
  courseId?: string | null;
}

/** Extra content of a milestone card (internship, capstone) inside the roadmap. */
export interface RoadmapMilestone {
  /** Chip text, e.g. "Internship". */
  badge: string;
  /** Sentence explaining the milestone. */
  description?: string | null;
  /** Highlighted requirement, e.g. "Prereq >= 70 Credits". */
  requirement?: string | null;
}

/** A course as the roadmap board renders it. */
export interface RoadmapCourse {
  id: string;
  courseId: string;
  code: string;
  name: string;
  credits: number;
  semesterNumber: number;
  kind: RoadmapCourseKind;
  /** Secondary line under the title, e.g. "C | Syntax". */
  categoryLabel?: string | null;
  /** FPT narrow specialization (Chuyên ngành hẹp) resolved from the catalogue, e.g. "Node.js". */
  specialization?: string | null;
  /** Elective group this course belongs to. */
  groupName?: string | null;
  prerequisites: RoadmapPrerequisite[];
  milestone?: RoadmapMilestone | null;
}

/** One column of the board. */
export interface RoadmapSemester {
  number: number;
  credits: number;
  courses: RoadmapCourse[];
}

/**
 * A curriculum course row enriched with the lookups the board needs.
 * `CurriculumCourseItem` alone carries no category and no prerequisite, so the page fills
 * those in from the course catalogue and the relation endpoint before mapping.
 */
export interface RoadmapCourseSource extends CurriculumCourseItem {
  /** Category line, e.g. "C | Syntax". */
  categoryLabel?: string | null;
  /** FPT narrow specialization (Chuyên ngành hẹp), resolved from the catalogue. */
  specialization?: string | null;
  /** Prerequisites of this course. */
  prerequisites?: RoadmapPrerequisite[];
  /** Milestone content, when the course is one. */
  milestone?: RoadmapMilestone | null;
}
