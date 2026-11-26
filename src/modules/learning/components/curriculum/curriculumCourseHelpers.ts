import type {
  CourseDetail as StudentCourseDetail,
  CurriculumCourse,
  TranscriptRow,
} from '../../../academic/services/studentAcademicService';
import type { CourseDetail as AdminCourseDetail } from '../../../academic/types/course';
import { adaptStudentCourseDetail } from '../courses/studentCourseColumns';

export type CourseStatusKind = 'PASSED' | 'IN_PROGRESS' | 'FAILED' | 'NOT_TAKEN';

export interface SemesterGroup {
  sem: number;
  courses: CurriculumCourse[];
  credits: number;
  passed: number;
  allPassed: boolean;
}

export function statusRank(status: string): number {
  const s = status.toUpperCase();
  if (s === 'PASSED' || s === 'EXEMPTED') return 4;
  if (s === 'IN_PROGRESS' || s === 'STUDYING') return 3;
  if (s === 'FAILED' || s === 'NOT_PASSED') return 2;
  return 1;
}

export function classifyStatus(row?: TranscriptRow): CourseStatusKind {
  if (!row) return 'NOT_TAKEN';
  const s = row.status.toUpperCase();
  if (s === 'PASSED' || s === 'EXEMPTED') return 'PASSED';
  if (s === 'IN_PROGRESS' || s === 'STUDYING') return 'IN_PROGRESS';
  if (s === 'FAILED' || s === 'NOT_PASSED') return 'FAILED';
  return 'NOT_TAKEN';
}

export function buildTranscriptMap(rows: TranscriptRow[] | undefined): Map<string, TranscriptRow> {
  const map = new Map<string, TranscriptRow>();
  for (const row of rows ?? []) {
    const key = row.courseCode.trim().toUpperCase();
    const prev = map.get(key);
    if (
      !prev ||
      statusRank(row.status) > statusRank(prev.status) ||
      (statusRank(row.status) === statusRank(prev.status) && row.attemptNumber > prev.attemptNumber)
    ) {
      map.set(key, row);
    }
  }
  return map;
}

export function groupCoursesBySemester(
  courses: CurriculumCourse[],
  transcriptByCode: Map<string, TranscriptRow>,
): SemesterGroup[] {
  const map = new Map<number, CurriculumCourse[]>();
  for (const c of courses) {
    const list = map.get(c.semesterNumber) ?? [];
    list.push(c);
    map.set(c.semesterNumber, list);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([sem, list]) => {
      const credits = list.reduce((s, c) => s + c.credits, 0);
      const passed = list.filter(
        (c) => classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'PASSED',
      ).length;
      return { sem, courses: list, credits, passed, allPassed: list.length > 0 && passed === list.length };
    });
}

export function buildCurriculumCourseDetail(
  detailData: StudentCourseDetail | undefined,
  isError: boolean,
  selected: CurriculumCourse | null,
): AdminCourseDetail | null {
  const base = adaptStudentCourseDetail(detailData);
  if (!selected) return base;
  if (base) {
    if (base.code.toUpperCase() !== selected.code.toUpperCase()) {
      return {
        ...base,
        code: selected.code,
        name: selected.name,
        credits: selected.credits,
        categoryName: selected.groupName ?? base.categoryName,
      };
    }
    return base;
  }
  if (!isError) return null;
  return {
    id: selected.courseId,
    code: selected.code,
    name: selected.name,
    credits: selected.credits,
    categoryId: selected.groupName ?? '',
    categoryCode: selected.groupName ?? '',
    categoryName: selected.groupName ?? (selected.mandatory ? 'Mandatory' : 'Elective'),
    specialization: selected.groupName,
    status: 'ACTIVE',
    prerequisiteCount: 0,
    usedInCurriculumCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: null,
    objectives: null,
    learningOutcomes: null,
    relations: [],
    referencedBy: [],
  };
}
