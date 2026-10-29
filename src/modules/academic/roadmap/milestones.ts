// src/modules/academic/roadmap/milestones.ts
// A milestone card (internship, capstone) is a course in the curriculum that also carries a
// rule of its own. The rule is stored as a free-form JSON condition, so this module reads the
// two things the card needs out of it: the credit threshold and the sentence to show.
import type { AcademicRule } from '../types/academic-rule';
import type { RoadmapCourseSource, RoadmapMilestone } from '../types/roadmap';

/** Course codes that mark an on-the-job training slot rather than a taught course. */
const INTERNSHIP_CODE_PREFIX = 'OJT';

/** Keys the condition JSON may use for "these credits must already be earned". */
const CREDIT_KEYS = ['min_credits', 'minCredits', 'required_credits', 'requiredCredits', 'credits'];

/** Keys the condition JSON may use for "and this is the course the rule is about". */
const COURSE_KEYS = ['course_code', 'courseCode', 'course', 'courseId', 'targetCourse'];

/** How the milestone is labelled on the card. */
export function milestoneBadge(course: { courseCode: string; groupName?: string | null }): string | null {
  if (course.courseCode.toUpperCase().startsWith(INTERNSHIP_CODE_PREFIX)) return 'Internship';
  if (course.groupName?.toLowerCase().includes('internship')) return 'Internship';
  if (course.groupName?.toLowerCase().includes('capstone')) return 'Capstone';
  return null;
}

/** Reads a whole number out of the condition JSON, trying each known key. */
function readNumber(condition: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = condition[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

/** Reads the course code the condition is about, if it names one. */
function readCourseCode(condition: Record<string, unknown>): string | null {
  for (const key of COURSE_KEYS) {
    const value = condition[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim().toUpperCase();
  }
  return null;
}

/**
 * Picks the rule that governs a course.
 * A rule that names the course wins; otherwise the rule with the highest credit threshold wins,
 * because that is the one that gates the milestone.
 */
function ruleFor(course: { courseCode: string; courseId: string }, rules: AcademicRule[]): AcademicRule | null {
  const named = rules.filter((rule) => {
    const target = readCourseCode(rule.condition);
    return target === course.courseCode.toUpperCase() || target === course.courseId.toUpperCase();
  });
  if (named.length > 0) return named[0];

  const withCredits = rules.filter((rule) => readNumber(rule.condition, CREDIT_KEYS) !== null);
  if (withCredits.length === 0) return null;

  return withCredits.reduce((best, rule) => {
    const bestValue = readNumber(best.condition, CREDIT_KEYS) ?? -1;
    const value = readNumber(rule.condition, CREDIT_KEYS) ?? -1;
    return value > bestValue ? rule : best;
  });
}

/**
 * Builds the milestone content of a course card, or null when the course is an ordinary one.
 * The threshold line ("Prereq >= 70 Credits") is written from the rule's own credit value,
 * so it always states the number the backend actually enforces.
 */
export function resolveMilestone(
  course: RoadmapCourseSource,
  rules: AcademicRule[],
): RoadmapMilestone | null {
  const badge = milestoneBadge(course);
  if (!badge) return null;

  const rule = ruleFor(course, rules);
  if (!rule) {
    return { badge, description: course.milestone?.description ?? null, requirement: null };
  }

  const credits = readNumber(rule.condition, CREDIT_KEYS);
  const description = rule.description ?? rule.displayMessage ?? course.milestone?.description ?? null;

  return {
    badge,
    description,
    requirement:
      credits !== null
        ? `Prereq >= ${credits} Credits`
        : (course.milestone?.requirement ?? null),
  };
}
