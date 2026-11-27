import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  studentAcademicService,
  type BlockPlacement,
  type CurriculumCourse,
  type TranscriptRow,
} from '../../../academic/services/studentAcademicService';
import type { AcademicBlockConfigView } from '../../../management/services/academic-block.service';
import {
  applyPlacementsToCourses,
  checkBlockEligibility,
  getActiveRegularBlocks,
  isCourseDraggable,
  type EffectiveCurriculumCourse,
  type RegularBlockMeta,
} from './curriculumBlockRules';
import { classifyStatus } from './curriculumCourseHelpers';
import { formatTermShort, validatePrerequisiteOrder, type PrereqCheckContext } from './curriculumPrereqRules';

const BLOCK_PLAN_KEY = ['student', 'curriculum-block-plan'] as const;

export function useCurriculumSchedule(
  rawCourses: CurriculumCourse[],
  blockConfig: AcademicBlockConfigView | undefined,
  transcriptByCode: Map<string, TranscriptRow>,
) {
  const queryClient = useQueryClient();
  const placementsQuery = useQuery({
    queryKey: BLOCK_PLAN_KEY,
    queryFn: studentAcademicService.blockPlacements,
    staleTime: 60_000,
    retry: false,
  });
  const prereqsQuery = useQuery({
    queryKey: ['student', 'curriculum-prereq-map'],
    queryFn: studentAcademicService.curriculumPrerequisites,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const regularBlocks = useMemo(() => getActiveRegularBlocks(blockConfig), [blockConfig]);
  const mainBlock = useMemo(() => regularBlocks.find((b) => b.blockType === 'MAIN') ?? regularBlocks[0], [regularBlocks]);
  const prepPartsPerSem = blockConfig?.limits.prepPartsPerSemester ?? 2;

  const { courses: effectiveCourses, prepCount } = useMemo(
    () => applyPlacementsToCourses(rawCourses, placementsQuery.data, prepPartsPerSem),
    [rawCourses, placementsQuery.data, prepPartsPerSem],
  );

  const passedCodes = useMemo(() => {
    const set = new Set<string>();
    for (const [code, row] of transcriptByCode.entries()) {
      if (classifyStatus(row) === 'PASSED') set.add(code.toUpperCase());
    }
    return set;
  }, [transcriptByCode]);

  const prereqCtx: PrereqCheckContext = useMemo(
    () => ({
      allCourses: effectiveCourses,
      dbPrereqMap: prereqsQuery.data,
      passedCodes,
      prepCount,
      regularBlocks,
    }),
    [effectiveCourses, prereqsQuery.data, passedCodes, prepCount, regularBlocks],
  );

  const coursesBySemAndBlock = useMemo(() => {
    const map = new Map<string, EffectiveCurriculumCourse[]>();
    for (const c of effectiveCourses) {
      if (!isCourseDraggable(c)) continue;
      const code = c.placement?.blockCode ?? mainBlock?.code ?? 'BLOCK_10W';
      const key = `${c.semesterNumber}-${code}`;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [effectiveCourses, mainBlock]);

  const saveMutation = useMutation({
    mutationFn: studentAcademicService.saveBlockPlacement,
    onSuccess: (next: BlockPlacement[]) => queryClient.setQueryData(BLOCK_PLAN_KEY, next),
    onError: () => toast.error('Could not save course placement. Please try again.'),
  });

  const removeMutation = useMutation({
    mutationFn: studentAcademicService.removeBlockPlacement,
    onSuccess: (next: BlockPlacement[]) => {
      queryClient.setQueryData(BLOCK_PLAN_KEY, next);
      toast.success('Reset course back to default curriculum schedule.');
    },
  });

  const resetAllMutation = useMutation({
    mutationFn: studentAcademicService.resetBlockPlacements,
    onSuccess: () => {
      queryClient.setQueryData(BLOCK_PLAN_KEY, []);
      toast.success('Restored all courses to default curriculum layout.');
    },
  });

  const validatePlacement = (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => {
    const key = `${targetSem}-${targetBlock.code}`;
    const currentInBlock = coursesBySemAndBlock.get(key) ?? [];
    const isFailed = classifyStatus(transcriptByCode.get(course.code.trim().toUpperCase())) === 'FAILED';
    const check = checkBlockEligibility(course, targetBlock, targetSem, currentInBlock, isFailed);
    if (!check.eligible) return check;
    const prereqErr = validatePrerequisiteOrder(course, targetSem, targetBlock, prereqCtx);
    if (prereqErr) return { eligible: false, reason: prereqErr, suggestedMode: check.suggestedMode };
    return check;
  };

  const scheduleCourse = (course: EffectiveCurriculumCourse, targetSem: number, targetBlock: RegularBlockMeta) => {
    const check = validatePlacement(course, targetSem, targetBlock);
    if (!check.eligible) {
      toast.error(check.reason ?? 'This course cannot be placed in the selected block.');
      return false;
    }
    if (targetSem === course.defaultSemesterNumber && targetBlock.code === mainBlock?.code && !course.placement) {
      return false;
    }
    if (targetSem === course.defaultSemesterNumber && targetBlock.code === mainBlock?.code && course.placement) {
      removeMutation.mutate(course.code);
      return true;
    }
    saveMutation.mutate({
      courseCode: course.code,
      semesterNumber: targetSem,
      blockCode: targetBlock.code,
      planMode: check.suggestedMode,
    });
    const modeNote = check.suggestedMode === 'RETAKE'
      ? ' (Retake)'
      : check.suggestedMode === 'DEFERRED'
        ? ' (Deferred)'
        : check.suggestedMode === 'EARLY'
          ? ' (Early)'
          : '';
    toast.success(`Scheduled ${course.code} → ${formatTermShort(targetSem)} · ${targetBlock.shortName}${modeNote}`);
    return true;
  };

  /** Picks the first eligible block in targetSem (preferring Main, falling back to Block 3W/5W if prereq requires sequential block). */
  const scheduleToTerm = (course: EffectiveCurriculumCourse, targetSem: number) => {
    for (const block of regularBlocks) {
      if (validatePlacement(course, targetSem, block).eligible) {
        return scheduleCourse(course, targetSem, block);
      }
    }
    // Trigger error toast with the most relevant reason (mainBlock)
    if (mainBlock) return scheduleCourse(course, targetSem, mainBlock);
    return false;
  };

  return {
    placements: placementsQuery.data ?? [],
    effectiveCourses,
    prepCount,
    regularBlocks,
    mainBlock,
    coursesBySemAndBlock,
    isSaving: saveMutation.isPending || removeMutation.isPending || resetAllMutation.isPending,
    validatePlacement,
    scheduleCourse,
    scheduleToTerm,
    resetCourse: (code: string) => removeMutation.mutate(code),
    resetAll: () => resetAllMutation.mutate(),
  };
}
