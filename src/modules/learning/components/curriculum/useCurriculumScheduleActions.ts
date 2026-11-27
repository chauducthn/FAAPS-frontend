import { toast } from 'sonner';
import type { BlockPlacement, TranscriptRow } from '../../../academic/services/studentAcademicService';
import { studentAcademicService } from '../../../academic/services/studentAcademicService';
import {
  checkBlockEligibility,
  type EffectiveCurriculumCourse,
  type RegularBlockMeta,
} from './curriculumBlockRules';
import { classifyStatus } from './curriculumCourseHelpers';
import { DRAFT_SEM, evaluateDraftPlacement } from './curriculumDraftHelpers';
import { formatTermShort, validatePrerequisiteOrder, type PrereqCheckContext } from './curriculumPrereqRules';

type BatchPayload = Parameters<typeof studentAcademicService.batchBlockPlacements>[0];
type SavePayload = Parameters<typeof studentAcademicService.saveBlockPlacement>[0];

export interface ScheduleActionsArgs {
  placements: BlockPlacement[];
  effectiveCourses: EffectiveCurriculumCourse[];
  draftCourses: EffectiveCurriculumCourse[];
  regularBlocks: RegularBlockMeta[];
  mainBlock: RegularBlockMeta | undefined;
  coursesBySemAndBlock: Map<string, EffectiveCurriculumCourse[]>;
  transcriptByCode: Map<string, TranscriptRow>;
  prereqMap: Record<string, string[]> | undefined;
  passedCodes: Set<string>;
  prereqCtx: PrereqCheckContext;
  minPlannableSem: number | undefined;
  activeCurrentSem: number;
  nextSemCode: string;
  maxCoursesPerSem: number;
  maxCreditsPerSem: number;
  savePlacement: (p: SavePayload) => void;
  batchPlacements: (p: BatchPayload) => void;
  removePlacement: (code: string) => void;
}

export function createScheduleActions(a: ScheduleActionsArgs) {
  const validatePlacement = (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => {
    const currentInBlock = a.coursesBySemAndBlock.get(`${targetSem}-${targetBlock.code}`) ?? [];
    const status = classifyStatus(a.transcriptByCode.get(course.code.trim().toUpperCase()));
    const check = checkBlockEligibility(
      course, targetBlock, targetSem, currentInBlock,
      status === 'FAILED', status === 'PASSED', a.minPlannableSem,
    );
    if (!check.eligible) return check;

    const codeUpper = course.code.trim().toUpperCase();
    let ejectedSet = new Set<string>();
    if (targetSem === DRAFT_SEM) {
      const { error, ejectCodes } = evaluateDraftPlacement(
        course, targetBlock, a.draftCourses, a.effectiveCourses, a.prereqMap, a.passedCodes, a.regularBlocks,
      );
      if (error) return { eligible: false, reason: error, suggestedMode: 'DRAFT' as const };
      ejectedSet = new Set(ejectCodes);
    } else {
      const prereqErr = validatePrerequisiteOrder(course, targetSem, targetBlock, a.prereqCtx);
      if (prereqErr) return { eligible: false, reason: prereqErr, suggestedMode: check.suggestedMode };
    }

    const semCourses: EffectiveCurriculumCourse[] = [];
    for (const block of a.regularBlocks) {
      for (const c of a.coursesBySemAndBlock.get(`${targetSem}-${block.code}`) ?? []) {
        const u = c.code.trim().toUpperCase();
        if (u === codeUpper || ejectedSet.has(u)) continue;
        semCourses.push(c);
      }
    }
    if (a.maxCoursesPerSem > 0 && semCourses.length + 1 > a.maxCoursesPerSem) {
      return { eligible: false, reason: `Semester limit reached (max ${a.maxCoursesPerSem} courses per semester).`, suggestedMode: check.suggestedMode };
    }
    const usedSemCredits = semCourses.reduce((s, c) => s + c.credits, 0);
    if (a.maxCreditsPerSem > 0 && usedSemCredits + course.credits > a.maxCreditsPerSem) {
      return { eligible: false, reason: `Exceeds semester credit limit (${usedSemCredits + course.credits}/${a.maxCreditsPerSem} credits).`, suggestedMode: check.suggestedMode };
    }
    return check;
  };

  const scheduleCourse = (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => {
    const check = validatePlacement(course, targetSem, targetBlock);
    if (!check.eligible) {
      toast.error(check.reason ?? 'This course cannot be placed in the selected block.');
      return false;
    }
    if (targetSem === DRAFT_SEM) {
      const { ejectCodes } = evaluateDraftPlacement(
        course, targetBlock, a.draftCourses, a.effectiveCourses, a.prereqMap, a.passedCodes, a.regularBlocks,
      );
      const upserts: NonNullable<BatchPayload['upserts']> = [
        { courseCode: course.code, semesterNumber: DRAFT_SEM, blockCode: targetBlock.code, planMode: 'DRAFT' },
      ];
      const removeCodes: string[] = [];
      for (const depCode of ejectCodes) {
        const dep = a.effectiveCourses.find((c) => c.code.trim().toUpperCase() === depCode);
        if (dep && dep.defaultSemesterNumber === a.activeCurrentSem) {
          upserts.push({ courseCode: depCode, semesterNumber: DRAFT_SEM, blockCode: 'NONE', planMode: 'EXCLUDED' });
        } else removeCodes.push(depCode);
      }
      a.batchPlacements({ upserts, removeCodes });
      toast.success(
        ejectCodes.length > 0
          ? `Added ${course.code} → Draft · ${a.nextSemCode} (${targetBlock.shortName}). Removed ${ejectCodes.join(', ')} (requires ${course.code} first).`
          : `Added ${course.code} → Draft · ${a.nextSemCode} · ${targetBlock.shortName}`,
      );
      return true;
    }

    const rawPlacement = a.placements.find((p) => p.courseCode.trim().toUpperCase() === course.code.trim().toUpperCase());
    if (targetSem === course.defaultSemesterNumber && targetBlock.code === a.mainBlock?.code && !rawPlacement) return false;
    if (targetSem === course.defaultSemesterNumber && targetBlock.code === a.mainBlock?.code && rawPlacement) {
      a.removePlacement(course.code);
      return true;
    }
    a.savePlacement({ courseCode: course.code, semesterNumber: targetSem, blockCode: targetBlock.code, planMode: check.suggestedMode });
    const modeNote = check.suggestedMode === 'RETAKE' ? ' (Retake)' : check.suggestedMode === 'DEFERRED' ? ' (Deferred)' : check.suggestedMode === 'EARLY' ? ' (Early)' : '';
    toast.success(`Scheduled ${course.code} → ${formatTermShort(targetSem)} · ${targetBlock.shortName}${modeNote}`);
    return true;
  };

  const scheduleToTerm = (course: EffectiveCurriculumCourse, targetSem: number) => {
    for (const block of a.regularBlocks) {
      if (validatePlacement(course, targetSem, block).eligible) return scheduleCourse(course, targetSem, block);
    }
    return a.mainBlock ? scheduleCourse(course, targetSem, a.mainBlock) : false;
  };

  const removeFromDraft = (course: EffectiveCurriculumCourse) => {
    if (course.defaultSemesterNumber === a.activeCurrentSem) {
      a.savePlacement({ courseCode: course.code, semesterNumber: DRAFT_SEM, blockCode: 'NONE', planMode: 'EXCLUDED' });
    } else a.removePlacement(course.code);
    toast.info(`Removed ${course.code} from Draft · ${a.nextSemCode}.`);
  };

  const moveToPool = (course: EffectiveCurriculumCourse) => {
    const status = classifyStatus(a.transcriptByCode.get(course.code.trim().toUpperCase()));
    if (status === 'PASSED' || status === 'IN_PROGRESS') {
      toast.error(`${course.code} cannot be moved to Course Pool.`);
      return;
    }
    a.savePlacement({ courseCode: course.code, semesterNumber: DRAFT_SEM, blockCode: 'NONE', planMode: 'EXCLUDED' });
    toast.info(`Moved ${course.code} to Course Pool.`);
  };

  const clearDraft = () => {
    const upserts = a.effectiveCourses
      .filter((c) => c.defaultSemesterNumber === a.activeCurrentSem && classifyStatus(a.transcriptByCode.get(c.code.trim().toUpperCase())) === 'NOT_TAKEN')
      .map((c) => ({ courseCode: c.code, semesterNumber: DRAFT_SEM, blockCode: 'NONE', planMode: 'EXCLUDED' as const }));
    const removeCodes = a.placements.filter((p) => p.semesterNumber === DRAFT_SEM && p.planMode === 'DRAFT').map((p) => p.courseCode);
    a.batchPlacements({ upserts, removeCodes });
    toast.info(`Cleared Draft · ${a.nextSemCode} — ready for a retake-only or custom term.`);
  };

  const loadDefaultDraft = () => {
    const removeCodes = a.placements.filter((p) => p.semesterNumber === DRAFT_SEM).map((p) => p.courseCode);
    if (removeCodes.length > 0) a.batchPlacements({ removeCodes });
    toast.success(`Loaded default Sem ${a.activeCurrentSem} courses into Draft · ${a.nextSemCode}.`);
  };

  return { validatePlacement, scheduleCourse, scheduleToTerm, removeFromDraft, moveToPool, clearDraft, loadDefaultDraft };
}
