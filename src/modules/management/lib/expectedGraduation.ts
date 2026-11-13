// The expected graduation semester is calculated, never typed: an admin who picks it by hand can enter a
// date that is impossible for the student (a first-semester student graduating next summer).

export interface GraduationSemester {
  id: string;
  code: string;
  startDate: string | null;
}

export interface GraduationEstimate {
  /** Semester code such as "FA2029", also when the semester catalogue does not contain it yet. */
  code: string;
  /** The catalogue semester, when it already exists. Only then can it be saved. */
  semesterId: string | null;
  /** How many semesters the student is behind the normal pace (added to the plan). */
  delaySemesters: number;
}

const ORDER = ['SP', 'SU', 'FA'] as const;

const parseCode = (code: string): { season: (typeof ORDER)[number]; year: number } | null => {
  const match = /^(SP|SU|FA)(\d{4})$/i.exec(code.trim());
  return match ? { season: match[1].toUpperCase() as (typeof ORDER)[number], year: Number(match[2]) } : null;
};

/** The semester `steps` terms after `code` (SP -> SU -> FA -> SP of the next year). */
export function addSemesters(code: string, steps: number): string | null {
  const start = parseCode(code);
  if (!start) return null;
  const index = start.year * 3 + ORDER.indexOf(start.season) + steps;
  return `${ORDER[((index % 3) + 3) % 3]}${Math.floor(index / 3)}`;
}

/** Number of semesters from `from` to `to`, counting `from` as 0. */
const distance = (from: string, to: string): number | null => {
  const a = parseCode(from);
  const b = parseCode(to);
  if (!a || !b) return null;
  return b.year * 3 + ORDER.indexOf(b.season) - (a.year * 3 + ORDER.indexOf(a.season));
};

/**
 * Estimates the graduation semester.
 *
 * - The curriculum has `curriculumSemesters` terms; a student who starts in `enrollmentCode` and keeps the normal
 *   pace finishes `curriculumSemesters - 1` terms later.
 * - A student whose `currentSemester` is behind the number of terms that have already passed since enrollment is
 *   late by the difference, and the graduation moves back by the same amount.
 *
 * Returns null while the inputs are not known.
 */
export function estimateGraduation(input: {
  enrollmentCode: string | undefined;
  currentCode: string | undefined;
  currentSemester: number;
  curriculumSemesters: number;
  semesters: GraduationSemester[];
}): GraduationEstimate | null {
  const { enrollmentCode, currentCode, currentSemester, curriculumSemesters, semesters } = input;
  if (!enrollmentCode || !Number.isInteger(currentSemester) || currentSemester < 1) return null;
  if (!Number.isInteger(curriculumSemesters) || curriculumSemesters < 1) return null;

  const passed = currentCode ? distance(enrollmentCode, currentCode) : null;
  const termsSinceEnrollment = passed === null ? currentSemester : Math.max(passed + 1, 1);
  const delaySemesters = Math.max(0, termsSinceEnrollment - currentSemester);

  const code = addSemesters(enrollmentCode, curriculumSemesters - 1 + delaySemesters);
  if (!code) return null;
  const known = semesters.find((semester) => semester.code.toUpperCase() === code);
  return { code, semesterId: known?.id ?? null, delaySemesters };
}

/** The catalogue semester that contains today (the last one that has already started). */
export function currentSemesterCode(semesters: GraduationSemester[], today = new Date()): string | undefined {
  const started = semesters
    .filter((semester) => semester.startDate && new Date(semester.startDate) <= today)
    .sort((a, b) => (a.startDate ?? '').localeCompare(b.startDate ?? ''));
  return started.at(-1)?.code;
}
