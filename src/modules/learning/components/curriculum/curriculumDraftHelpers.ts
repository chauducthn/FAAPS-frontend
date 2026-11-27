import type { BlockPlacement, TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { EffectiveCurriculumCourse, RegularBlockMeta } from './curriculumBlockRules';
import { classifyStatus, type TermTab } from './curriculumCourseHelpers';
import { buildEffectivePrereqMap } from './curriculumPrereqRules';

export const DRAFT_SEM = 99;
export const DRAFT_TAB_ID = 'draft-current';

const SEASON_ORDER = ['SP', 'SU', 'FA'] as const;
const SEASON_RANK: Record<string, number> = { SP: 0, SU: 1, FA: 2 };

function semCodeRank(code: string): number {
  const m = /^(SP|SU|FA)(\d{4})$/i.exec(code.trim());
  if (!m) return 0;
  return Number(m[2]) * 3 + (SEASON_RANK[m[1].toUpperCase()] ?? 0);
}

/** Computes the next real calendar semester code after the latest transcript term (e.g. FA2026 -> SP2027). */
export function computeNextCalendarSemCode(transcriptByCode: Map<string, TranscriptRow>): string {
  let maxRank = 0;
  let latestCode = '';
  for (const row of transcriptByCode.values()) {
    const code = row.semesterCode?.trim().toUpperCase() ?? '';
    const r = semCodeRank(code);
    if (r > maxRank) {
      maxRank = r;
      latestCode = code;
    }
  }
  const m = /^(SP|SU|FA)(\d{4})$/.exec(latestCode);
  if (!m) return 'Next Term';
  const idx = SEASON_ORDER.indexOf(m[1] as (typeof SEASON_ORDER)[number]);
  const year = Number(m[2]);
  return idx === 2 ? `SP${year + 1}` : `${SEASON_ORDER[idx + 1]}${year}`;
}

function blockPhase(blockType: string | undefined): number {
  return (blockType ?? 'MAIN').toUpperCase() === 'INTENSIVE' ? 2 : 1;
}

/**
 * Builds the list of courses in the current Draft Term (e.g. Draft · SP2027):
 * - Includes explicit DRAFT placements (not PASSED/IN_PROGRESS).
 * - Auto-includes NOT_TAKEN courses of `currentSem` ONLY if all their curriculum
 *   prerequisites are already PASSED (courses with unpassed prerequisites are automatically excluded).
 */
export function buildDraftCourses(
  allCourses: EffectiveCurriculumCourse[],
  placements: BlockPlacement[] | undefined,
  transcriptByCode: Map<string, TranscriptRow>,
  currentSem: number,
  dbPrereqMap?: Record<string, string[]>,
  passedCodes?: Set<string>,
): EffectiveCurriculumCourse[] {
  const byCode = new Map<string, BlockPlacement>();
  for (const p of placements ?? []) {
    if (p.semesterNumber === DRAFT_SEM) byCode.set(p.courseCode.trim().toUpperCase(), p);
  }
  const prereqGraph = buildEffectivePrereqMap(allCourses, dbPrereqMap);
  const hasUnpassedPrereq = (upper: string) => {
    const prereqs = prereqGraph.get(upper);
    if (!prereqs || prereqs.size === 0 || !passedCodes) return false;
    for (const pCode of prereqs) {
      if (!passedCodes.has(pCode)) return true;
    }
    return false;
  };

  const result: EffectiveCurriculumCourse[] = [];
  for (const c of allCourses) {
    const upper = c.code.trim().toUpperCase();
    const status = classifyStatus(transcriptByCode.get(upper));
    if (status === 'PASSED' || status === 'IN_PROGRESS') continue;
    const p = byCode.get(upper);
    if (p?.planMode === 'EXCLUDED') continue;
    if (p && p.semesterNumber === DRAFT_SEM) {
      result.push({ ...c, semesterNumber: DRAFT_SEM, placement: p });
    } else if (c.defaultSemesterNumber === currentSem && status === 'NOT_TAKEN' && !hasUnpassedPrereq(upper)) {
      result.push({ ...c, semesterNumber: DRAFT_SEM });
    }
  }
  return result;
}

export function buildDraftTab(draftCourses: EffectiveCurriculumCourse[], nextSemCode: string): TermTab {
  const credits = draftCourses.reduce((s, c) => s + c.credits, 0);
  return { id: DRAFT_TAB_ID, label: `Draft · ${nextSemCode}`, sem: DRAFT_SEM, courses: draftCourses, credits, passed: 0, allPassed: false };
}

/** Course Pool membership: unpassed courses not in Draft and not scheduled in a future Plan Sem. */
export function buildPoolCourseCodes(
  allCourses: EffectiveCurriculumCourse[],
  transcriptByCode: Map<string, TranscriptRow>,
  currentSem: number,
  draftCourseCodes: Set<string>,
  placements?: BlockPlacement[],
): Set<string> {
  const excludedCodes = new Set(
    (placements ?? [])
      .filter((p) => p.semesterNumber === DRAFT_SEM && p.planMode === 'EXCLUDED')
      .map((p) => p.courseCode.trim().toUpperCase()),
  );
  const pool = new Set<string>();
  for (const c of allCourses) {
    const upper = c.code.trim().toUpperCase();
    const status = classifyStatus(transcriptByCode.get(upper));
    if (status === 'PASSED' || status === 'IN_PROGRESS' || draftCourseCodes.has(upper)) continue;
    if (excludedCodes.has(upper)) { pool.add(upper); continue; }
    const placedInFutureSem = c.placement && c.placement.semesterNumber >= currentSem && c.placement.semesterNumber !== DRAFT_SEM;
    if (placedInFutureSem) continue;
    if (status === 'FAILED' || c.defaultSemesterNumber <= currentSem) pool.add(upper);
  }
  return pool;
}

/**
 * Validates dropping `course` into Draft Term at `targetBlock`.
 * - Blocks only if `course` itself has an unpassed prerequisite NOT placed earlier in Draft.
 * - Does NOT block if a course `A` already in Draft depends on `course`; instead returns `ejectCodes`
 *   so the caller automatically kicks `A` out of Draft!
 */
export function evaluateDraftPlacement(
  course: EffectiveCurriculumCourse,
  targetBlock: RegularBlockMeta,
  draftCourses: EffectiveCurriculumCourse[],
  allCourses: EffectiveCurriculumCourse[],
  dbPrereqMap: Record<string, string[]> | undefined,
  passedCodes: Set<string>,
  regularBlocks: RegularBlockMeta[],
): { error: string | null; ejectCodes: string[] } {
  const code = course.code.trim().toUpperCase();
  const prereqGraph = buildEffectivePrereqMap(allCourses, dbPrereqMap);
  const blockTypeByCode = new Map(regularBlocks.map((b) => [b.code.toUpperCase(), b.blockType]));
  const defaultMain = (regularBlocks.find((b) => b.blockType === 'MAIN') ?? regularBlocks[0])?.code ?? 'BLOCK_10W';
  const getPhase = (c: EffectiveCurriculumCourse) =>
    blockPhase(blockTypeByCode.get((c.placement?.blockCode ?? defaultMain).toUpperCase()));
  const getType = (c: EffectiveCurriculumCourse) =>
    (blockTypeByCode.get((c.placement?.blockCode ?? defaultMain).toUpperCase()) ?? 'MAIN').toUpperCase();

  const targetPhase = blockPhase(targetBlock.blockType);
  const targetIsFast = targetBlock.blockType.toUpperCase() === 'FAST';
  const draftByCode = new Map(draftCourses.map((c) => [c.code.trim().toUpperCase(), c]));

  // 1. Forward check: all prerequisites of `course` must be PASSED or in an earlier block of Draft
  for (const pCode of prereqGraph.get(code) ?? []) {
    if (passedCodes.has(pCode)) continue;
    const inDraft = draftByCode.get(pCode);
    if (!inDraft) {
      return { error: `${course.code} requires passing ${pCode} first (add ${pCode} to Draft or pass it first).`, ejectCodes: [] };
    }
    const pPhase = getPhase(inDraft);
    const validSameDraft = targetPhase > pPhase || (targetIsFast && getType(inDraft) === 'FAST');
    if (!validSameDraft) {
      return {
        error: `${course.code} cannot run in parallel with prerequisite ${pCode} in ${targetBlock.shortName} — place it in Block 3W.`,
        ejectCodes: [],
      };
    }
  }

  // 2. Reverse check: any course currently in Draft that depends on `course` (and isn't in a later block) gets auto-ejected!
  const ejectSet = new Set<string>();
  const queue = [code];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const [depCode, prereqs] of prereqGraph.entries()) {
      if (!prereqs.has(cur) || ejectSet.has(depCode)) continue;
      const depInDraft = draftByCode.get(depCode);
      if (!depInDraft) continue;
      if (cur === code) {
        const depPhase = getPhase(depInDraft);
        const validSameDraft = depPhase > targetPhase || (targetIsFast && getType(depInDraft) === 'FAST');
        if (validSameDraft) continue;
      }
      ejectSet.add(depCode);
      queue.push(depCode);
    }
  }

  return { error: null, ejectCodes: Array.from(ejectSet) };
}
