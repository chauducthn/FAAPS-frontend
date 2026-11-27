import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, GraduationCap, MagnifyingGlass, WarningCircle, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { studentAcademicService } from '../../academic/services/studentAcademicService';
import { ACADEMIC_BLOCK_QUERY_KEY, academicBlockService } from '../../management/services/academic-block.service';
import { useMyCurriculum, useMyCurriculumCourses, useMyProfile, useMyTranscript } from '../hooks/queries/useStudentQueries';
import { CurriculumCourseDetailPanel } from './curriculum/CurriculumCourseDetailPanel';
import { CurriculumCourseTable } from './curriculum/CurriculumCourseTable';
import { CurriculumTermBar } from './curriculum/CurriculumTermBar';
import { planSemesterBlocks } from './curriculum/curriculumBlockPlanner';
import type { EffectiveCurriculumCourse } from './curriculum/curriculumBlockRules';
import { buildAttemptHistoryMap, buildCurriculumCourseDetail, buildTermTabs, buildTranscriptMap } from './curriculum/curriculumCourseHelpers';
import { useCurriculumSchedule } from './curriculum/useCurriculumSchedule';

export function StudentCurriculumCoursesCard({ topRightSlot }: { topRightSlot?: ReactNode } = {}) {
  const profile = useMyProfile();
  const curriculum = useMyCurriculum();
  const coursesQuery = useMyCurriculumCourses();
  const transcriptQuery = useMyTranscript();
  const blockConfigQuery = useQuery({
    queryKey: [...ACADEMIC_BLOCK_QUERY_KEY, 'student'],
    queryFn: academicBlockService.getStudentConfig,
    staleTime: 5 * 60_000,
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [draggingCourse, setDraggingCourse] = useState<EffectiveCurriculumCourse | null>(null);
  const [dragOverSem, setDragOverSem] = useState<number | null>(null);
  const rawCourses = useMemo(() => coursesQuery.data ?? [], [coursesQuery.data]);
  const transcriptByCode = useMemo(() => buildTranscriptMap(transcriptQuery.data), [transcriptQuery.data]);
  const attemptHistoryByCode = useMemo(() => buildAttemptHistoryMap(transcriptQuery.data), [transcriptQuery.data]);
  const schedule = useCurriculumSchedule(rawCourses, blockConfigQuery.data, transcriptByCode);
  const allCourses = schedule.effectiveCourses;
  const termTabs = useMemo(() => buildTermTabs(allCourses, transcriptByCode, schedule.prepCount), [allCourses, transcriptByCode, schedule.prepCount]);
  const availableTerms = useMemo(() => termTabs.map((t) => ({ sem: t.sem, label: t.label })), [termTabs]);

  useEffect(() => {
    if (termTabs.length === 0 || (activeTabId !== null && termTabs.some((t) => t.id === activeTabId))) return;
    const preferred = profile.data?.currentSemester;
    const prefTab = preferred != null && preferred > 0 ? termTabs.find((t) => t.sem === preferred) : null;
    setActiveTabId(prefTab?.id ?? termTabs.find((t) => t.sem === 1)?.id ?? termTabs[0].id);
  }, [termTabs, activeTabId, profile.data?.currentSemester]);

  const currentTab = useMemo(() => termTabs.find((t) => t.id === activeTabId) ?? termTabs[0] ?? null, [termTabs, activeTabId]);
  const totalCredits = useMemo(() => allCourses.reduce((s, c) => s + c.credits, 0), [allCourses]);
  const isSearching = search.trim().length > 0;
  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentTab?.courses ?? [];
    return allCourses.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.groupName ?? '').toLowerCase().includes(q));
  }, [allCourses, currentTab, search]);

  const selectedCourse = useMemo(
    () => (selectedCode ? allCourses.find((c) => c.code === selectedCode) ?? null : null) ?? visibleCourses[0] ?? null,
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

  const handleNavigateCourse = (code: string) => {
    const tabMatch = termTabs.find((t) => t.courses.some((c) => c.code.toUpperCase() === code.toUpperCase()));
    const match = allCourses.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (match && tabMatch) {
      setActiveTabId(tabMatch.id);
      setSearch('');
      setSelectedCode(match.code);
    } else toast.info(`${code} is not in your active curriculum list.`);
  };

  const handleDropToSemesterTab = (targetSem: number) => {
    setDragOverSem(null);
    if (!draggingCourse || targetSem === 0) return;
    if (schedule.scheduleToTerm(draggingCourse, targetSem)) {
      setActiveTabId(targetSem < 0 ? `prep-${-targetSem}` : `sem-${targetSem}`);
      setSelectedCode(draggingCourse.code);
    }
    setDraggingCourse(null);
  };

  const isLoading = curriculum.isLoading || coursesQuery.isLoading;
  const noCurriculum = !isLoading && (!curriculum.data || (coursesQuery.isError && allCourses.length === 0));

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <CurriculumTermBar
        termTabs={termTabs}
        activeTabId={currentTab?.id}
        isSearching={isSearching}
        draggingCourse={draggingCourse}
        dragOverSem={dragOverSem}
        regularBlocks={schedule.regularBlocks}
        placementCount={schedule.placements.length}
        isSaving={schedule.isSaving}
        topRightSlot={topRightSlot}
        validatePlacement={schedule.validatePlacement}
        onSelectTab={(id) => { setSearch(''); setActiveTabId(id); }}
        onSetDragOverSem={setDragOverSem}
        onDropToTerm={handleDropToSemesterTab}
        onResetAll={schedule.resetAll}
      />

      <div className="grid min-h-0 flex-1 w-full gap-4 lg:grid-cols-12">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs lg:col-span-8 lg:h-full lg:min-h-0">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]"><BookOpen className="size-4.5" /></span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {curriculum.data && <span className="text-sm font-bold text-gray-900">{curriculum.data.name}</span>}
                  {curriculum.data && <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#C2410C]">{curriculum.data.majorCode} · {curriculum.data.version}</span>}
                  {currentTab && overLimit && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      <WarningCircle className="size-3.5" weight="fill" /> {currentTab.courses.length}/{maxCoursesLimit} · {currentTab.credits}/{maxCreditsLimit} cr
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-gray-500">{allCourses.length} courses · {totalCredits} credits</p>
              </div>
            </div>
            {!isLoading && !noCurriculum && (
              <div className="relative w-48 sm:w-56">
                <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all courses..." className="h-8 w-full rounded-lg border border-gray-200 bg-white pr-7 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none" />
                {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="size-3.5" /></button>}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2 p-5" aria-label="Loading curriculum courses">
              {Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />)}
            </div>
          ) : noCurriculum ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]"><GraduationCap className="size-5" /></span>
              <p className="text-sm font-bold text-gray-900">No curriculum assigned yet</p>
              <Link to="/student/profile" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F26F21] px-4 text-xs font-bold text-white hover:bg-[#e05f14]">Go to My Profile</Link>
            </div>
          ) : (
            <>
              {isSearching && (
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-2 text-xs text-gray-600">
                  <span>Found <strong className="text-gray-900">{visibleCourses.length}</strong> {visibleCourses.length === 1 ? 'course' : 'courses'} matching "{search.trim()}"</span>
                  <button type="button" onClick={() => setSearch('')} className="font-semibold text-[#F26F21] hover:underline">Clear search</button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <CurriculumCourseTable
                  courses={visibleCourses} sections={blockSections} activeSem={currentTab?.sem ?? 1}
                  selectedKey={selectedCourse ? `${selectedCourse.semesterNumber}-${selectedCourse.code}-${selectedCourse.courseId}` : null}
                  transcriptByCode={transcriptByCode} attemptHistoryByCode={attemptHistoryByCode} showSemester={isSearching}
                  draggingCourse={draggingCourse} validatePlacement={schedule.validatePlacement} onSelect={(c) => setSelectedCode(c.code)}
                  onDragStartCourse={setDraggingCourse} onDragEndCourse={() => { setDraggingCourse(null); setDragOverSem(null); }}
                  onDropToBlock={(course, block) => { if (currentTab && currentTab.sem !== 0) schedule.scheduleCourse(course, currentTab.sem, block); setDraggingCourse(null); }}
                />
              </div>
            </>
          )}
        </section>

        <div className="lg:col-span-4 lg:h-full lg:min-h-0">
          <CurriculumCourseDetailPanel
            selected={selectedCourse} termLabel={selectedTermLabel} activeSem={currentTab?.sem} detail={adaptedDetail}
            transcriptRow={selectedCourse ? transcriptByCode.get(selectedCourse.code.trim().toUpperCase()) : undefined}
            attemptHistory={selectedCourse ? attemptHistoryByCode.get(selectedCourse.code.trim().toUpperCase()) : undefined}
            regularBlocks={schedule.regularBlocks} availableTerms={availableTerms}
            isLoading={detailQuery.isLoading || detailQuery.isFetching} isSavingSchedule={schedule.isSaving}
            validatePlacement={schedule.validatePlacement} onNavigate={handleNavigateCourse}
            onSchedule={(c, sem, block) => { if (schedule.scheduleCourse(c, sem, block)) setActiveTabId(sem < 0 ? `prep-${-sem}` : `sem-${sem}`); }}
            onScheduleToTerm={(c, sem) => { if (schedule.scheduleToTerm(c, sem)) setActiveTabId(sem < 0 ? `prep-${-sem}` : `sem-${sem}`); }}
            onResetCourse={schedule.resetCourse}
          />
        </div>
      </div>
    </div>
  );
}
