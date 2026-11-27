import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { EffectiveCurriculumCourse } from './curriculumBlockRules';
import { classifyStatus, type TermTab } from './curriculumCourseHelpers';

const SEASON_RANK: Record<string, number> = { SP: 0, SU: 1, FA: 2 };

function semCodeRank(code: string): number {
  const m = /^(SP|SU|FA)(\d{4})$/i.exec(code.trim());
  if (!m) return 0;
  return Number(m[2]) * 3 + (SEASON_RANK[m[1].toUpperCase()] ?? 0);
}

function makeTab(
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
  return {
    id,
    label,
    sem,
    prepIndex,
    courses,
    credits,
    passed,
    allPassed: courses.length > 0 && passed === courses.length,
  };
}

/**
 * Builds chronological real-life journey tabs:
 * 1. Actual calendar semesters from transcript (FA2022, SP2023, ..., SU2026 · OJT, FA2026).
 * 2. Upcoming plan tabs (Plan Sem 7, Plan Sem 8, Plan Sem 9) for remaining NOT_TAKEN courses.
 */
export function buildJourneyTabs(
  allCourses: EffectiveCurriculumCourse[],
  transcriptByCode: Map<string, TranscriptRow>,
  draftTab?: TermTab,
  poolCourseCodes?: Set<string>,
  currentSem = 1,
): TermTab[] {
  const byRealSem = new Map<string, EffectiveCurriculumCourse[]>();
  const upcomingBySem = new Map<number, EffectiveCurriculumCourse[]>();
  const inDraftCodes = new Set((draftTab?.courses ?? []).map((c) => c.code.trim().toUpperCase()));

  // Always keep upcoming curriculum semester tabs strictly after Draft (e.g. Plan Sem 8..9) even when emptied
  const minPlanSem = Math.max(1, currentSem) + 1;
  const maxCurriculumSem = allCourses.reduce(
    (m, c) => Math.max(m, c.defaultSemesterNumber, c.semesterNumber > 0 && c.semesterNumber < 99 ? c.semesterNumber : 0),
    0,
  );
  for (let sem = minPlanSem; sem <= maxCurriculumSem; sem++) {
    upcomingBySem.set(sem, []);
  }

  for (const c of allCourses) {
    const upper = c.code.trim().toUpperCase();
    if (inDraftCodes.has(upper) || poolCourseCodes?.has(upper)) continue;
    const row = transcriptByCode.get(upper);
    const semCode = row?.semesterCode?.trim().toUpperCase();
    if (semCode && semCodeRank(semCode) > 0) {
      const list = byRealSem.get(semCode) ?? [];
      list.push(c);
      byRealSem.set(semCode, list);
      continue;
    }
    const target = c.semesterNumber > 0 ? c.semesterNumber : 1;
    if (target < minPlanSem) continue;
    const list = upcomingBySem.get(target) ?? [];
    list.push(c);
    upcomingBySem.set(target, list);
  }

  const tabs: TermTab[] = [];
  const orderedReal = Array.from(byRealSem.keys()).sort((a, b) => semCodeRank(a) - semCodeRank(b));
  for (const sc of orderedReal) {
    const list = byRealSem.get(sc) ?? [];
    const hasOjt = list.some((c) => /^OJT/i.test(c.code.trim()));
    const label = hasOjt ? `${sc} · OJT` : sc;
    tabs.push(makeTab(`real-${sc}`, label, 0, list, transcriptByCode));
  }

  if (draftTab) tabs.push(draftTab);

  const orderedUpcoming = Array.from(upcomingBySem.keys()).sort((a, b) => a - b);
  for (const sem of orderedUpcoming) {
    const list = upcomingBySem.get(sem) ?? [];
    tabs.push(makeTab(`plan-sem-${sem}`, `Plan Sem ${sem}`, sem, list, transcriptByCode));
  }

  return tabs;
}
