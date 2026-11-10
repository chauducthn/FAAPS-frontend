import {
  studentAcademicService,
  type CurriculumCourse,
  type Semester,
  type TranscriptRow,
} from '../../academic/services/studentAcademicService';

/** A course on the student's planning board. Semester 0 = Course Pool (not placed yet). */
export interface PlanItem {
  courseId: string;
  code: string;
  name: string;
  credits: number;
  semesterNumber: number;
  prerequisites: { code: string; groupNo: number }[];
}

export interface BoardData {
  curriculumId: string;
  curriculumName: string;
  majorCode: string;
  courses: PlanItem[];
  transcript: TranscriptRow[];
  semesters: Semester[];
  passedCodes: Set<string>;
}

export interface BoardIssue {
  courseId: string;
  code: string;
  message: string;
}

const POOL = 0;
export const BOARD_POOL = POOL;
export const BOARD_SEMESTERS = 9;

const PASSED = new Set(['PASSED', 'EXEMPTED', 'COMPLETED']);

function isPassed(row: TranscriptRow): boolean {
  return PASSED.has(row.status) || row.creditsEarned > 0;
}

/** Real API first: curriculum courses, transcript, semesters, then per-course prerequisites. */
export async function fetchBoardData(): Promise<BoardData> {
  const [curriculum, courses, transcript, semesters] = await Promise.all([
    studentAcademicService.curriculum(),
    studentAcademicService.curriculumCourses(),
    studentAcademicService.transcript(),
    studentAcademicService.semesters(),
  ]);

  const passedCodes = new Set(
    transcript.filter(isPassed).map((r) => r.courseCode.toUpperCase()),
  );

  const items: PlanItem[] = await Promise.all(
    courses.map(async (c: CurriculumCourse) => {
      let prerequisites: PlanItem['prerequisites'] = [];
      try {
        const detail = await studentAcademicService.course(c.courseId);
        prerequisites = detail.prerequisites
          .filter((p) => p.type === 'PREREQUISITE')
          .map((p) => ({ code: p.courseCode, groupNo: p.groupNo ?? 1 }));
      } catch {
        prerequisites = [];
      }
      return {
        courseId: c.courseId,
        code: c.code,
        name: c.name,
        credits: c.credits,
        semesterNumber: c.semesterNumber > 0 ? c.semesterNumber : POOL,
        prerequisites,
      };
    }),
  );

  return {
    curriculumId: curriculum.id,
    curriculumName: curriculum.name,
    majorCode: curriculum.majorCode,
    courses: items,
    transcript,
    semesters,
    passedCodes,
  };
}

/**
 * Prerequisite-order validation over the whole board.
 * Mirrors the backend rule (every prerequisite group needs one satisfied course)
 * and adds ordering: a prerequisite counts when passed already or planned in an
 * EARLIER semester. Same-semester or later placement is a blocking error.
 */
export function validateBoard(items: PlanItem[], passedCodes: Set<string>): BoardIssue[] {
  const placed = new Map<string, number>();
  for (const item of items) {
    if (item.semesterNumber > 0) placed.set(item.code.toUpperCase(), item.semesterNumber);
  }

  const issues: BoardIssue[] = [];
  for (const item of items) {
    if (item.semesterNumber <= 0 || item.prerequisites.length === 0) continue;
    const groups = new Map<number, string[]>();
    for (const p of item.prerequisites) {
      const list = groups.get(p.groupNo) ?? [];
      list.push(p.code);
      groups.set(p.groupNo, list);
    }
    for (const codes of groups.values()) {
      const satisfied = codes.some((code) => {
        const key = code.toUpperCase();
        if (passedCodes.has(key)) return true;
        const sem = placed.get(key);
        return sem != null && sem < item.semesterNumber;
      });
      if (!satisfied) {
        const missing = codes.filter((c) => !passedCodes.has(c.toUpperCase()));
        issues.push({
          courseId: item.courseId,
          code: item.code,
          message: `${item.code} requires ${missing.length > 0 ? missing.join(' or ') : codes.join(' or ')} in an earlier semester — Semester ${item.semesterNumber} is too early.`,
        });
        break;
      }
    }
  }
  return issues;
}

/* ---------- Draft persistence (drag state survives reload) ---------- */

const draftKey = (curriculumId: string) => `faaps:study-plan-draft:${curriculumId}`;

export function loadDraft(curriculumId: string): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(draftKey(curriculumId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { placements?: Record<string, number> };
    return parsed.placements ?? null;
  } catch {
    return null;
  }
}

export function saveDraft(curriculumId: string, placements: Record<string, number>) {
  try {
    localStorage.setItem(draftKey(curriculumId), JSON.stringify({ placements, savedAt: Date.now() }));
  } catch {
    /* storage full or blocked — the board still works in memory */
  }
}

/* ---------- Real study-plan API (save / validate / submit one semester) ---------- */

export function saveSemesterPlan(semesterId: string, courseIds: string[]) {
  return studentAcademicService.saveStudyPlan({ semesterId, planType: 'REGULAR', courseIds });
}

export function validateSavedPlan(id: string) {
  return studentAcademicService.validateStudyPlan(id);
}

export function submitSavedPlan(id: string) {
  return studentAcademicService.submitStudyPlan(id);
}
