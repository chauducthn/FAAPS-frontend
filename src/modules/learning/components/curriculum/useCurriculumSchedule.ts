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
  getActiveRegularBlocks,
  isCourseDraggable,
  type EffectiveCurriculumCourse,
} from './curriculumBlockRules';
import { classifyStatus } from './curriculumCourseHelpers';
import {
  buildDraftCourses,
  buildDraftTab,
  buildPoolCourseCodes,
  computeNextCalendarSemCode,
  DRAFT_SEM,
} from './curriculumDraftHelpers';
import type { PrereqCheckContext } from './curriculumPrereqRules';
import { createScheduleActions } from './useCurriculumScheduleActions';

const BLOCK_PLAN_KEY = ['student', 'curriculum-block-plan'] as const;

export function useCurriculumSchedule(
  rawCourses: CurriculumCourse[],
  blockConfig: AcademicBlockConfigView | undefined,
  transcriptByCode: Map<string, TranscriptRow>,
  currentSemester?: number | null,
) {
  const queryClient = useQueryClient();
  const minPlannableSem = currentSemester != null && currentSemester >= 1 ? currentSemester : undefined;
  const activeCurrentSem = currentSemester != null && currentSemester >= 1 ? currentSemester : 1;

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
    () => applyPlacementsToCourses(rawCourses, placementsQuery.data, prepPartsPerSem, transcriptByCode),
    [rawCourses, placementsQuery.data, prepPartsPerSem, transcriptByCode],
  );

  const { passedCodes, inProgressCodes } = useMemo(() => {
    const passed = new Set<string>();
    const studying = new Set<string>();
    for (const [code, row] of transcriptByCode.entries()) {
      const kind = classifyStatus(row);
      if (kind === 'PASSED') passed.add(code.toUpperCase());
      else if (kind === 'IN_PROGRESS') studying.add(code.toUpperCase());
    }
    return { passedCodes: passed, inProgressCodes: studying };
  }, [transcriptByCode]);

  const nextSemCode = useMemo(() => computeNextCalendarSemCode(transcriptByCode), [transcriptByCode]);
  const draftCourses = useMemo(
    () => buildDraftCourses(effectiveCourses, placementsQuery.data, transcriptByCode, activeCurrentSem, prereqsQuery.data, passedCodes),
    [effectiveCourses, placementsQuery.data, transcriptByCode, activeCurrentSem, prereqsQuery.data, passedCodes],
  );
  const draftTab = useMemo(() => buildDraftTab(draftCourses, nextSemCode), [draftCourses, nextSemCode]);

  const prereqCtx: PrereqCheckContext = useMemo(() => {
    const draftBlockByCode = new Map<string, string>();
    const draftCodeSet = new Set<string>();
    const defaultMain = mainBlock?.code ?? 'BLOCK_10W';
    for (const c of draftCourses) {
      const upper = c.code.trim().toUpperCase();
      draftCodeSet.add(upper);
      draftBlockByCode.set(upper, c.placement?.blockCode ?? defaultMain);
    }
    const poolCodes = buildPoolCourseCodes(effectiveCourses, transcriptByCode, activeCurrentSem, draftCodeSet, placementsQuery.data);
    return {
      allCourses: effectiveCourses, dbPrereqMap: prereqsQuery.data, passedCodes, inProgressCodes,
      draftBlockByCode, poolCodes, currentSem: activeCurrentSem, prepCount, regularBlocks,
    };
  }, [effectiveCourses, prereqsQuery.data, passedCodes, inProgressCodes, draftCourses, mainBlock, transcriptByCode, activeCurrentSem, placementsQuery.data, prepCount, regularBlocks]);

  const coursesBySemAndBlock = useMemo(() => {
    const map = new Map<string, EffectiveCurriculumCourse[]>();
    const draftCodes = new Set(draftCourses.map((c) => c.code.trim().toUpperCase()));
    const excludedCodes = new Set(
      (placementsQuery.data ?? [])
        .filter((p) => p.semesterNumber === DRAFT_SEM && p.planMode === 'EXCLUDED')
        .map((p) => p.courseCode.trim().toUpperCase()),
    );
    const add = (sem: number, c: EffectiveCurriculumCourse) => {
      if (!isCourseDraggable(c)) return;
      const key = `${sem}-${c.placement?.blockCode ?? mainBlock?.code ?? 'BLOCK_10W'}`;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    };
    for (const c of effectiveCourses) {
      const upper = c.code.trim().toUpperCase();
      if (draftCodes.has(upper) || excludedCodes.has(upper)) continue;
      const status = classifyStatus(transcriptByCode.get(upper));
      if (status === 'PASSED' || status === 'IN_PROGRESS') continue;
      add(c.semesterNumber, c);
    }
    for (const c of draftCourses) add(DRAFT_SEM, c);
    return map;
  }, [effectiveCourses, draftCourses, placementsQuery.data, transcriptByCode, mainBlock]);

  const onUpdated = (next: BlockPlacement[]) => queryClient.setQueryData(BLOCK_PLAN_KEY, next);
  const onError = () => toast.error('Could not save course placement. Please try again.');
  const saveMutation = useMutation({ mutationFn: studentAcademicService.saveBlockPlacement, onSuccess: onUpdated, onError });
  const batchMutation = useMutation({ mutationFn: studentAcademicService.batchBlockPlacements, onSuccess: onUpdated, onError });
  const removeMutation = useMutation({
    mutationFn: studentAcademicService.removeBlockPlacement,
    onSuccess: (next: BlockPlacement[]) => { onUpdated(next); toast.success('Reset course back to default curriculum schedule.'); },
  });
  const resetAllMutation = useMutation({
    mutationFn: studentAcademicService.resetBlockPlacements,
    onSuccess: () => { onUpdated([]); toast.success('Restored all courses to default curriculum layout.'); },
  });

  const actions = createScheduleActions({
    placements: placementsQuery.data ?? [],
    effectiveCourses, draftCourses, regularBlocks, mainBlock, coursesBySemAndBlock,
    transcriptByCode, prereqMap: prereqsQuery.data, passedCodes, prereqCtx,
    minPlannableSem, activeCurrentSem, nextSemCode,
    maxCoursesPerSem: blockConfig?.limits.maxCoursesPerSemester ?? 7,
    maxCreditsPerSem: blockConfig?.limits.maxCreditsPerSemester ?? 21,
    savePlacement: (p) => saveMutation.mutate(p),
    batchPlacements: (p) => batchMutation.mutate(p),
    removePlacement: (code) => removeMutation.mutate(code),
  });

  return {
    placements: placementsQuery.data ?? [],
    effectiveCourses, draftCourses, draftTab, nextSemCode, prepCount, regularBlocks, mainBlock, coursesBySemAndBlock,
    isSaving: saveMutation.isPending || batchMutation.isPending || removeMutation.isPending || resetAllMutation.isPending,
    ...actions,
    resetCourse: (code: string) => removeMutation.mutate(code),
    resetAll: () => resetAllMutation.mutate(),
  };
}
