import type {
  CourseDetail as StudentCourseDetail,
  CurriculumCourse,
  TranscriptRow,
} from '../../../academic/services/studentAcademicService';
import type { CourseDetail as AdminCourseDetail } from '../../../academic/types/course';
import { adaptStudentCourseDetail } from '../courses/studentCourseDetailAdapter';
import type { EffectiveCurriculumCourse } from './curriculumBlockRules';

export type CourseStatusKind = 'PASSED' | 'IN_PROGRESS' | 'FAILED' | 'NOT_TAKEN';

export interface AttemptSummary {
  attempts: TranscriptRow[];
  failCount: number;
  passCount: number;
  inProgressCount: number;
  latest?: TranscriptRow;
}

export interface TermTab {
  id: string;
  label: string;
  sem: number;
  prepIndex?: number;
  courses: EffectiveCurriculumCourse[];
  credits: number;
  passed: number;
  allPassed: boolean;
}

const PREP_LEVEL_RE = /^(?:PEN|TRS|LUK)([1-6])\d*$/i;

function englishAliasesFor(code: string): string[] {
  const upper = code.trim().toUpperCase();
  const m = PREP_LEVEL_RE.exec(upper);
  if (!m) return [upper];
  const lvl = m[1];
  return Array.from(new Set([upper, `PEN${lvl}01`, `LUK${lvl}`, `TRS${lvl}01`]));
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

function allKeysFor(code: string, equivalents?: Record<string, string[]>): string[] {
  const keys = new Set(englishAliasesFor(code));
  const upper = code.trim().toUpperCase();
  for (const eq of equivalents?.[upper] ?? []) keys.add(eq.toUpperCase());
  return [...keys];
}

export function buildTranscriptMap(
  rows: TranscriptRow[] | undefined,
  equivalents?: Record<string, string[]>,
): Map<string, TranscriptRow> {
  const map = new Map<string, TranscriptRow>();
  for (const row of rows ?? []) {
    for (const key of allKeysFor(row.courseCode, equivalents)) {
      const prev = map.get(key);
      if (
        !prev ||
        statusRank(row.status) > statusRank(prev.status) ||
        (statusRank(row.status) === statusRank(prev.status) && row.attemptNumber > prev.attemptNumber)
      ) {
        map.set(key, row);
      }
    }
  }
  return map;
}

export function buildAttemptHistoryMap(
  rows: TranscriptRow[] | undefined,
  equivalents?: Record<string, string[]>,
): Map<string, AttemptSummary> {
  const grouped = new Map<string, TranscriptRow[]>();
  for (const row of rows ?? []) {
    for (const key of allKeysFor(row.courseCode, equivalents)) {
      const list = grouped.get(key) ?? [];
      list.push(row);
      grouped.set(key, list);
    }
  }
  const map = new Map<string, AttemptSummary>();
  for (const [key, list] of grouped.entries()) {
    const sorted = [...list].sort((a, b) => a.attemptNumber - b.attemptNumber);
    let failCount = 0;
    let passCount = 0;
    let inProgressCount = 0;
    for (const r of sorted) {
      const kind = classifyStatus(r);
      if (kind === 'FAILED') failCount += 1;
      else if (kind === 'PASSED') passCount += 1;
      else if (kind === 'IN_PROGRESS') inProgressCount += 1;
    }
    map.set(key, { attempts: sorted, failCount, passCount, inProgressCount, latest: sorted[sorted.length - 1] });
  }
  return map;
}

function makeTermTab(
  id: string,
  label: string,
  sem: number,
  courses: EffectiveCurriculumCourse[],
  transcriptByCode: Map<string, TranscriptRow>,
  prepIndex?: number,
): TermTab {
  const credits = courses.reduce((s, c) => s + c.credits, 0);
  const passed = courses.filter(
    (c) => classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'PASSED',
  ).length;
  return { id, label, sem, prepIndex, courses, credits, passed, allPassed: courses.length > 0 && passed === courses.length };
}

export function buildTermTabs(
  courses: EffectiveCurriculumCourse[],
  transcriptByCode: Map<string, TranscriptRow>,
  prepCount = 0,
  excludeCodes?: Set<string>,
): TermTab[] {
  const bySem = new Map<number, EffectiveCurriculumCourse[]>();
  let maxPrep = prepCount;
  for (const c of courses) {
    if (c.semesterNumber < 0) maxPrep = Math.max(maxPrep, -c.semesterNumber);
    const list = bySem.get(c.semesterNumber) ?? [];
    if (!excludeCodes || !excludeCodes.has(c.code.trim().toUpperCase())) {
      list.push(c);
    }
    bySem.set(c.semesterNumber, list);
  }

  const tabs: TermTab[] = [];
  for (let i = 1; i <= maxPrep; i++) {
    const list = bySem.get(-i) ?? [];
    tabs.push(makeTermTab(`prep-${i}`, `Prep ${i}`, -i, list, transcriptByCode, i));
  }
  const regularSems = Array.from(bySem.keys())
    .filter((s) => s > 0)
    .sort((a, b) => a - b);
  for (const sem of regularSems) {
    tabs.push(makeTermTab(`sem-${sem}`, `Sem ${sem}`, sem, bySem.get(sem) ?? [], transcriptByCode));
  }
  return tabs;
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
      const isEnglishAlias = englishAliasesFor(base.code).includes(selected.code.trim().toUpperCase());
      if (isEnglishAlias) {
        return {
          ...base, code: selected.code, name: selected.name, credits: selected.credits,
          categoryName: selected.groupName ?? base.categoryName, workload: base.workload ?? selected.workload ?? null,
        };
      }
      return {
        ...base, code: selected.code, name: selected.name, credits: selected.credits,
        categoryName: selected.groupName ?? base.categoryName, materialLink: null, description: null,
        objectives: null, learningOutcomes: null, workload: selected.workload ?? null, relations: [], referencedBy: [],
      };
    }
    return { ...base, workload: base.workload ?? selected.workload ?? null };
  }
  if (!isError) return null;
  return {
    id: selected.courseId, code: selected.code, name: selected.name, credits: selected.credits,
    categoryId: selected.groupName ?? '', categoryCode: selected.groupName ?? '',
    categoryName: selected.groupName ?? (selected.mandatory ? 'Mandatory' : 'Elective'),
    specialization: selected.groupName, status: 'ACTIVE', prerequisiteCount: 0, usedInCurriculumCount: 1,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    description: null, objectives: null, learningOutcomes: null,
    workload: selected.workload ?? null, relations: [], referencedBy: [],
  };
}
