import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAcademicService } from '../../../academic/services/studentAcademicService';
import { ACADEMIC_BLOCK_QUERY_KEY, academicBlockService } from '../../../management/services/academic-block.service';
import { useMyCurriculum, useMyCurriculumCourses, useMyProfile, useMyProgress, useMyTranscript } from '../../hooks/queries/useStudentQueries';
import { computeEffectiveCurrentSem } from '../journey/studyJourneyHelpers';
import { planSemesterBlocks } from './curriculumBlockPlanner';
import { buildAttemptHistoryMap, buildCurriculumCourseDetail, buildTermTabs, buildTranscriptMap, classifyStatus } from './curriculumCourseHelpers';
import { buildPoolCourseCodes, DRAFT_TAB_ID } from './curriculumDraftHelpers';
import { buildJourneyTabs } from './curriculumJourneyBuilder';
import { useCurriculumSchedule } from './useCurriculumSchedule';

export function useCurriculumWorkspaceData(rightPanelMode: 'info' | 'pool' | 'setup') {
  const profile = useMyProfile();
  const progress = useMyProgress();
  const curriculum = useMyCurriculum();
  const coursesQuery = useMyCurriculumCourses();
  const transcriptQuery = useMyTranscript();
  const blockConfigQuery = useQuery({
    queryKey: [...ACADEMIC_BLOCK_QUERY_KEY, 'student'],
    queryFn: academicBlockService.getStudentConfig,
    staleTime: 5 * 60_000,
  });
  const equivalentsQuery = useQuery({
    queryKey: ['student', 'curriculum-equivalents'],
    queryFn: studentAcademicService.curriculumEquivalents,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const [viewMode, setViewMode] = useState<'curriculum' | 'journey'>('curriculum');
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const rawCourses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const transcriptByCode = useMemo(() => buildTranscriptMap(transcriptQuery.data, equivalentsQuery.data), [transcriptQuery.data, equivalentsQuery.data]);
  const attemptHistoryByCode = useMemo(() => buildAttemptHistoryMap(transcriptQuery.data, equivalentsQuery.data), [transcriptQuery.data, equivalentsQuery.data]);
  const effectiveCurrentSem = useMemo(
    () => computeEffectiveCurrentSem(rawCourses, transcriptByCode, profile.data?.currentSemester),
    [rawCourses, transcriptByCode, profile.data?.currentSemester],
  );
  const schedule = useCurriculumSchedule(rawCourses, blockConfigQuery.data, transcriptByCode, effectiveCurrentSem);
  const allCourses = schedule.effectiveCourses;
  const curriculumCodes = useMemo(() => new Set(allCourses.map((c) => c.code.trim().toUpperCase())), [allCourses]);
  const draftCourseCodes = useMemo(() => new Set(schedule.draftCourses.map((c) => c.code.trim().toUpperCase())), [schedule.draftCourses]);
  const poolCourseCodes = useMemo(
    () => buildPoolCourseCodes(allCourses, transcriptByCode, effectiveCurrentSem, draftCourseCodes, schedule.placements),
    [allCourses, transcriptByCode, effectiveCurrentSem, draftCourseCodes, schedule.placements],
  );
  const curriculumTabs = useMemo(() => buildTermTabs(allCourses, transcriptByCode, schedule.prepCount), [allCourses, transcriptByCode, schedule.prepCount]);
  const termTabs = useMemo(
    () => (viewMode === 'journey' ? buildJourneyTabs(allCourses, transcriptByCode, schedule.draftTab, poolCourseCodes, effectiveCurrentSem) : curriculumTabs),
    [viewMode, allCourses, transcriptByCode, schedule.draftTab, poolCourseCodes, effectiveCurrentSem, curriculumTabs],
  );

  useEffect(() => {
    if (rightPanelMode === 'pool' && viewMode !== 'journey') {
      setViewMode('journey');
      setActiveTabId(DRAFT_TAB_ID);
    }
  }, [rightPanelMode, viewMode]);

  useEffect(() => {
    if (termTabs.length === 0 || (activeTabId !== null && termTabs.some((t) => t.id === activeTabId))) return;
    const draft = termTabs.find((t) => t.id === DRAFT_TAB_ID);
    const preferred = profile.data?.currentSemester;
    const prefTab = preferred != null && preferred > 0 ? termTabs.find((t) => t.sem === preferred) : null;
    setActiveTabId(draft?.id ?? prefTab?.id ?? termTabs.find((t) => t.sem === 1)?.id ?? termTabs[0].id);
  }, [termTabs, activeTabId, profile.data?.currentSemester]);

  const currentTab = useMemo(() => termTabs.find((t) => t.id === activeTabId) ?? termTabs[0] ?? null, [termTabs, activeTabId]);
  const totalCredits = useMemo(() => allCourses.reduce((s, c) => s + c.credits, 0), [allCourses]);
  const passedCredits = useMemo(
    () => allCourses.reduce((s, c) => (classifyStatus(transcriptByCode.get(c.code.trim().toUpperCase())) === 'PASSED' ? s + c.credits : s), 0),
    [allCourses, transcriptByCode],
  );
  const currentGpa = progress.data?.currentGpa ?? profile.data?.currentGpa ?? null;
  const isSearching = search.trim().length > 0;
  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentTab?.courses ?? [];
    return allCourses.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.groupName ?? '').toLowerCase().includes(q));
  }, [allCourses, currentTab, search]);

  const selectedCourse = useMemo(
    () => (selectedCode ? visibleCourses.find((c) => c.code === selectedCode) ?? allCourses.find((c) => c.code === selectedCode) ?? null : null) ?? visibleCourses[0] ?? null,
    [allCourses, selectedCode, visibleCourses],
  );
  const selectedTermLabel = useMemo(
    () => (selectedCourse ? termTabs.find((t) => t.courses.some((c) => c.code === selectedCourse.code))?.label : undefined),
    [selectedCourse, termTabs],
  );
  const detailQuery = useQuery({
    queryKey: ['student', 'curriculum-course-detail', selectedCourse?.courseId],
    queryFn: () => studentAcademicService.course(selectedCourse!.courseId),
    enabled: !!selectedCourse?.courseId,
    retry: false,
  });
  const blockSections = useMemo(
    () => (currentTab && !isSearching ? planSemesterBlocks(visibleCourses, currentTab.sem, profile.data?.cohort, blockConfigQuery.data, currentTab.prepIndex) : undefined),
    [currentTab, isSearching, visibleCourses, profile.data?.cohort, blockConfigQuery.data],
  );
  const maxCoursesLimit = blockConfigQuery.data?.limits.maxCoursesPerSemester ?? 7;
  const maxCreditsLimit = blockConfigQuery.data?.limits.maxCreditsPerSemester ?? 21;
  const overLimit = !!currentTab && currentTab.sem > 0 && (currentTab.courses.length > maxCoursesLimit || currentTab.credits > maxCreditsLimit);
  const adaptedDetail = useMemo(() => buildCurriculumCourseDetail(detailQuery.data, detailQuery.isError, selectedCourse), [detailQuery.data, detailQuery.isError, selectedCourse]);

  return {
    curriculum, coursesQuery, schedule, viewMode, setViewMode, activeTabId, setActiveTabId,
    search, setSearch, selectedCode, setSelectedCode, transcriptByCode, attemptHistoryByCode,
    effectiveCurrentSem, allCourses, curriculumCodes, poolCourseCodes, termTabs, currentTab,
    totalCredits, passedCredits, currentGpa, isSearching, visibleCourses, selectedCourse,
    selectedTermLabel, detailQuery, blockSections, maxCoursesLimit, maxCreditsLimit, overLimit, adaptedDetail,
  };
}
