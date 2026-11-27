import type { BlockPlacement, CurriculumCourse } from '../../../academic/services/studentAcademicService';
import type { AcademicBlockConfigView, AcademicBlockItem } from '../../../management/services/academic-block.service';

export type BlockTone = 'prep' | 'main' | 'ojt' | 'cap' | 'orient' | 'fast';

export interface RegularBlockMeta {
  code: string;
  name: string;
  shortName: string;
  blockType: string;
  durationWeeks: number;
  maxCourses: number;
  maxCredits: number;
  tone: BlockTone;
  description?: string | null;
}

export interface EffectiveCurriculumCourse extends CurriculumCourse {
  defaultSemesterNumber: number;
  placement?: BlockPlacement;
}

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  suggestedMode: BlockPlacement['planMode'];
}

const ENGLISH_PREP_RE = /^(PEN|TRS|LUK)\d+/i;
const OJT_RE = /^OJT/i;
const ORIENT_RE = /^OTP/i;
const CAPSTONE_RE = /490|_GRA_/i;
const PREP_ELIGIBLE_RE = /^(VOV|COV|TMI)\d+|^PHE_|^TMI_/i;

export function isPrepEligibleCourse(course: CurriculumCourse): boolean {
  const g = (course.groupName ?? '').toLowerCase();
  return g === 'physical education' || g === 'musical instrument' || PREP_ELIGIBLE_RE.test(course.code.trim());
}

export function shortBlockName(b: Pick<AcademicBlockItem, 'code' | 'name' | 'durationWeeks'>): string {
  if (/^BLOCK_(\d+)W$/i.test(b.code)) return `Block ${b.durationWeeks}W`;
  return b.name.split('(')[0].trim() || b.name;
}

export function toneForBlockType(type: string): BlockTone {
  const t = type.toUpperCase();
  if (t === 'PREP') return 'prep';
  if (t === 'INTENSIVE' || t === 'FAST') return 'fast';
  return 'main';
}

export function getActiveRegularBlocks(config: AcademicBlockConfigView | undefined): RegularBlockMeta[] {
  const active = (config?.blocks ?? []).filter((b) => b.active && b.blockType !== 'PREP');
  if (active.length > 0) {
    return active.map((b) => ({
      code: b.code,
      name: b.name,
      shortName: shortBlockName(b),
      blockType: b.blockType,
      durationWeeks: b.durationWeeks,
      maxCourses: Math.max(1, b.maxCourses),
      maxCredits: Math.max(0, b.maxCredits),
      tone: toneForBlockType(b.blockType),
      description: b.description,
    }));
  }
  return [
    { code: 'BLOCK_10W', name: 'Block 10W (Main Term)', shortName: 'Block 10W', blockType: 'MAIN', durationWeeks: 10, maxCourses: 6, maxCredits: 18, tone: 'main' },
    { code: 'BLOCK_5W', name: 'Block 5W (Half-Term)', shortName: 'Block 5W', blockType: 'FAST', durationWeeks: 5, maxCourses: 3, maxCredits: 9, tone: 'fast' },
    { code: 'BLOCK_3W', name: 'Block 3W (Intensive / Retake)', shortName: 'Block 3W', blockType: 'INTENSIVE', durationWeeks: 3, maxCourses: 2, maxCredits: 6, tone: 'fast' },
  ];
}

export function applyPlacementsToCourses(
  rawCourses: CurriculumCourse[],
  placements: BlockPlacement[] | undefined,
  prepPartsPerSemester = 2,
): { courses: EffectiveCurriculumCourse[]; prepCount: number } {
  const perPrep = Math.max(1, prepPartsPerSemester);
  const byCode = new Map<string, BlockPlacement>();
  for (const p of placements ?? []) byCode.set(p.courseCode.trim().toUpperCase(), p);

  const isPe = (c: CurriculumCourse) =>
    (c.groupName ?? '').toLowerCase() === 'physical education' || /^(VOV|COV)\d+|^PHE_/i.test(c.code.trim());

  const sem0NonPe = rawCourses.filter((c) => {
    const p = byCode.get(c.code.trim().toUpperCase());
    return !p && !isPe(c) && c.semesterNumber === 0;
  });
  const english = sem0NonPe
    .filter((c) => ENGLISH_PREP_RE.test(c.code.trim()))
    .sort((a, b) => a.code.localeCompare(b.code));
  const foundation = sem0NonPe.filter((c) => !ENGLISH_PREP_RE.test(c.code.trim()));
  const autoPe = rawCourses
    .filter((c) => !byCode.has(c.code.trim().toUpperCase()) && isPe(c))
    .sort((a, b) => a.semesterNumber - b.semesterNumber || a.code.localeCompare(b.code));

  const maxPlacedPrep = Array.from(byCode.values()).reduce((m, p) => (p.semesterNumber < 0 ? Math.max(m, -p.semesterNumber) : m), 0);
  const prepCount = Math.max(
    english.length > 0 ? Math.ceil(english.length / perPrep) : 0,
    foundation.length > 0 || autoPe.some((c) => c.semesterNumber === 0) ? 1 : 0,
    maxPlacedPrep,
  );

  // Assign deterministic effective semester numbers (-1 = Prep 1, -2 = Prep 2, 1..9 = Sem 1..9)
  const autoSemByCode = new Map<string, number>();
  english.forEach((c, idx) => autoSemByCode.set(c.code.trim().toUpperCase(), -(Math.floor(idx / perPrep) + 1)));
  foundation.forEach((c) => autoSemByCode.set(c.code.trim().toUpperCase(), -1));
  autoPe.forEach((c, idx) => {
    const target = idx < prepCount ? -(idx + 1) : Math.max(1, idx - prepCount + 1);
    autoSemByCode.set(c.code.trim().toUpperCase(), target);
  });

  const courses: EffectiveCurriculumCourse[] = rawCourses.map((c) => {
    const upper = c.code.trim().toUpperCase();
    const p = byCode.get(upper);
    const defaultEffSem = autoSemByCode.get(upper) ?? c.semesterNumber;
    return {
      ...c,
      defaultSemesterNumber: defaultEffSem,
      semesterNumber: p ? p.semesterNumber : defaultEffSem,
      placement: p,
    };
  });
  return { courses, prepCount };
}

export function checkBlockEligibility(
  course: EffectiveCurriculumCourse,
  targetBlock: RegularBlockMeta,
  targetSem: number,
  currentCoursesInBlock: CurriculumCourse[],
  isFailed: boolean,
): EligibilityResult {
  const code = course.code.trim().toUpperCase();
  const suggestedMode: BlockPlacement['planMode'] = isFailed && (targetBlock.blockType === 'INTENSIVE' || targetSem !== course.defaultSemesterNumber)
    ? 'RETAKE'
    : targetSem > course.defaultSemesterNumber
      ? 'DEFERRED'
      : targetSem < course.defaultSemesterNumber
        ? 'EARLY'
        : 'CUSTOM';

  if (OJT_RE.test(code)) {
    return { eligible: false, reason: `${course.code} is a 15-week OJT internship and cannot be placed in ${targetBlock.shortName}.`, suggestedMode };
  }
  if (ENGLISH_PREP_RE.test(code)) {
    return { eligible: false, reason: `${course.code} is an English Prep level and belongs to Sem 0 Prep Term (7w).`, suggestedMode };
  }
  if (ORIENT_RE.test(code)) {
    return { eligible: false, reason: `${course.code} is fixed in Sem 0 Orientation (2w).`, suggestedMode };
  }
  if (targetSem <= 0 && !isPrepEligibleCourse(course)) {
    return { eligible: false, reason: 'Major courses can only be scheduled from Sem 1 onward.', suggestedMode };
  }
  if (CAPSTONE_RE.test(code) && targetBlock.blockType !== 'MAIN') {
    return { eligible: false, reason: `${course.code} (Capstone/Graduation) requires a full Main block (Block 10W).`, suggestedMode };
  }

  const others = currentCoursesInBlock.filter((c) => c.code.trim().toUpperCase() !== code);
  if (others.length >= targetBlock.maxCourses) {
    return { eligible: false, reason: `${targetBlock.shortName} is full (max ${targetBlock.maxCourses} courses).`, suggestedMode };
  }
  const usedCredits = others.reduce((s, c) => s + c.credits, 0);
  if (targetBlock.maxCredits > 0 && usedCredits + course.credits > targetBlock.maxCredits) {
    return {
      eligible: false,
      reason: `Exceeds ${targetBlock.shortName} credit limit (${usedCredits + course.credits}/${targetBlock.maxCredits} cr).`,
      suggestedMode,
    };
  }

  return { eligible: true, suggestedMode };
}

export function isCourseDraggable(course: CurriculumCourse): boolean {
  const code = course.code.trim().toUpperCase();
  return !OJT_RE.test(code) && !ENGLISH_PREP_RE.test(code) && !ORIENT_RE.test(code);
}
