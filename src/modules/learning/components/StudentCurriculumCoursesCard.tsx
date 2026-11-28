import { useState, type ReactNode } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { CurriculumCardHeader } from './curriculum/CurriculumCardHeader';
import { CurriculumCourseDetailPanel } from './curriculum/CurriculumCourseDetailPanel';
import { CurriculumCoursePoolPanel } from './curriculum/CurriculumCoursePoolPanel';
import { CurriculumCourseTable } from './curriculum/CurriculumCourseTable';
import { CurriculumTermBar } from './curriculum/CurriculumTermBar';
import type { EffectiveCurriculumCourse } from './curriculum/curriculumBlockRules';
import { DRAFT_SEM, DRAFT_TAB_ID } from './curriculum/curriculumDraftHelpers';
import { useCurriculumWorkspaceData } from './curriculum/useCurriculumWorkspaceData';
import { useOpenProfile } from '@/shared/components/layout/portal/profileDrawerContext';

const PROFILE_BUTTON_CLASS =
  'inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-hover';

export function StudentCurriculumCoursesCard({
  topRightSlot,
  rightPanelMode = 'info',
  setupPanel,
  onSwitchRightPanel,
}: {
  topRightSlot?: ReactNode;
  rightPanelMode?: 'info' | 'pool' | 'setup';
  setupPanel?: ReactNode;
  onSwitchRightPanel?: (mode: 'info' | 'pool' | 'setup') => void;
} = {}) {
  const d = useCurriculumWorkspaceData(rightPanelMode);
  const openProfile = useOpenProfile();
  const [draggingCourse, setDraggingCourse] = useState<EffectiveCurriculumCourse | null>(null);
  const [dragOverSem, setDragOverSem] = useState<number | null>(null);

  const handleNavigateCourse = (code: string) => {
    const tabMatch = d.termTabs.find((t) => t.courses.some((c) => c.code.toUpperCase() === code.toUpperCase()));
    const match = d.allCourses.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (match && tabMatch) {
      d.setActiveTabId(tabMatch.id);
      d.setSearch('');
      d.setSelectedCode(match.code);
    } else toast.info(`${code} is not in your active curriculum list.`);
  };

  const handleDropToSemesterTab = (targetSem: number) => {
    setDragOverSem(null);
    if (!draggingCourse || targetSem === 0) return;
    if (d.schedule.scheduleToTerm(draggingCourse, targetSem)) {
      d.setActiveTabId(
        targetSem === DRAFT_SEM
          ? DRAFT_TAB_ID
          : d.viewMode === 'journey'
            ? `plan-sem-${targetSem}`
            : targetSem < 0
              ? `prep-${-targetSem}`
              : `sem-${targetSem}`,
      );
      d.setSelectedCode(draggingCourse.code);
    }
    setDraggingCourse(null);
  };

  const isLoading = d.curriculum.isLoading || d.coursesQuery.isLoading;
  const noCurriculum = !isLoading && (!d.curriculum.data || (d.coursesQuery.isError && d.allCourses.length === 0));
  const allowDrag = d.viewMode === 'journey' && (d.currentTab?.sem ?? 0) !== 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <CurriculumTermBar
        termTabs={d.termTabs}
        activeTabId={d.currentTab?.id}
        isSearching={d.isSearching}
        draggingCourse={d.viewMode === 'journey' ? draggingCourse : null}
        dragOverSem={d.viewMode === 'journey' ? dragOverSem : null}
        regularBlocks={d.schedule.regularBlocks}
        placementCount={d.viewMode === 'journey' ? d.schedule.placements.length : 0}
        isSaving={d.schedule.isSaving}
        topLeftSlot={
          !isLoading && !noCurriculum ? (
            <div className="inline-flex h-[42px] items-center rounded-xl border border-gray-200/80 bg-white p-1 text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  d.setViewMode('curriculum');
                  d.setActiveTabId(null);
                  if (rightPanelMode === 'pool') onSwitchRightPanel?.('info');
                }}
                className={`h-full rounded-lg px-3 transition-colors ${d.viewMode === 'curriculum' ? 'bg-gray-900 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                Curriculum
              </button>
              <button
                type="button"
                onClick={() => { d.setViewMode('journey'); d.setActiveTabId(null); }}
                className={`h-full rounded-lg px-3 transition-colors ${d.viewMode === 'journey' ? 'bg-gray-900 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                My Journey
              </button>
            </div>
          ) : undefined
        }
        topRightSlot={topRightSlot}
        validatePlacement={d.schedule.validatePlacement}
        onSelectTab={(id) => { d.setSearch(''); d.setActiveTabId(id); }}
        onSetDragOverSem={setDragOverSem}
        onDropToTerm={handleDropToSemesterTab}
        onResetAll={d.schedule.resetAll}
      />

      <div className="grid min-h-0 flex-1 w-full gap-4 lg:grid-cols-12">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs lg:col-span-8 lg:h-full lg:min-h-0">
          <CurriculumCardHeader
            curriculumName={d.curriculum.data?.name}
            currentGpa={d.currentGpa}
            totalCourses={d.allCourses.length}
            passedCredits={d.passedCredits}
            totalCredits={d.totalCredits}
            currentTabSem={d.currentTab?.sem}
            currentTabCoursesCount={d.currentTab?.courses.length ?? 0}
            currentTabCredits={d.currentTab?.credits ?? 0}
            overLimit={d.overLimit}
            maxCoursesLimit={d.maxCoursesLimit}
            maxCreditsLimit={d.maxCreditsLimit}
            currentSem={d.effectiveCurrentSem}
            draftCount={d.schedule.draftCourses.length}
            isSaving={d.schedule.isSaving}
            showControls={!isLoading && !noCurriculum}
            search={d.search}
            onSearchChange={d.setSearch}
            onLoadDefaultDraft={d.schedule.loadDefaultDraft}
            onClearDraft={d.schedule.clearDraft}
          />

          {isLoading ? (
            <div className="space-y-2 p-5" aria-label="Loading curriculum courses">
              {Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />)}
            </div>
          ) : noCurriculum ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21]"><GraduationCap className="size-5" /></span>
              <p className="text-sm font-bold text-gray-900">No curriculum assigned yet</p>
              <button type="button" onClick={openProfile} className={PROFILE_BUTTON_CLASS}>Go to My Profile</button>
            </div>
          ) : (
            <>
              {d.isSearching && (
                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-2 text-xs text-gray-600">
                  <span>Found <strong className="text-gray-900">{d.visibleCourses.length}</strong> {d.visibleCourses.length === 1 ? 'course' : 'courses'} matching "{d.search.trim()}"</span>
                  <button type="button" onClick={() => d.setSearch('')} className="font-semibold text-[#F26F21] hover:underline">Clear search</button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <CurriculumCourseTable
                  courses={d.visibleCourses} sections={d.blockSections} activeSem={d.currentTab?.sem ?? 1}
                  selectedKey={d.selectedCourse ? `${d.selectedCourse.semesterNumber}-${d.selectedCourse.code}-${d.selectedCourse.courseId}` : null}
                  transcriptByCode={d.transcriptByCode} attemptHistoryByCode={d.attemptHistoryByCode} showSemester={d.isSearching}
                  allowDrag={allowDrag} draggingCourse={draggingCourse} validatePlacement={d.schedule.validatePlacement}
                  onSelect={(c) => { d.setSelectedCode(c.code); onSwitchRightPanel?.('info'); }}
                  onDragStartCourse={setDraggingCourse} onDragEndCourse={() => { setDraggingCourse(null); setDragOverSem(null); }}
                  onDropToBlock={(course, block) => { if (allowDrag && d.currentTab && d.currentTab.sem !== 0) d.schedule.scheduleCourse(course, d.currentTab.sem, block); setDraggingCourse(null); }}
                  onRemoveFromDraft={d.currentTab?.sem === DRAFT_SEM ? d.schedule.removeFromDraft : undefined}
                />
              </div>
            </>
          )}
        </section>

        <div className="lg:col-span-4 lg:h-full lg:min-h-0">
          {rightPanelMode === 'setup' && setupPanel ? setupPanel : rightPanelMode === 'pool' ? (
            <CurriculumCoursePoolPanel
              allCourses={d.allCourses} poolCourseCodes={d.poolCourseCodes} transcriptByCode={d.transcriptByCode}
              currentSem={d.effectiveCurrentSem} draftLabel={d.schedule.draftTab.label} isSaving={d.schedule.isSaving}
              draggingCourse={draggingCourse}
              onSelectInspect={(c) => { d.setSelectedCode(c.code); onSwitchRightPanel?.('info'); }}
              onAddToDraft={(c) => { if (d.schedule.scheduleToTerm(c, DRAFT_SEM)) { d.setViewMode('journey'); d.setActiveTabId(DRAFT_TAB_ID); } }}
              onDropToPool={(c) => {
                d.schedule.moveToPool(c);
                setDraggingCourse(null);
                setDragOverSem(null);
              }}
              onDragStartCourse={setDraggingCourse} onDragEndCourse={() => { setDraggingCourse(null); setDragOverSem(null); }}
            />
          ) : (
            <CurriculumCourseDetailPanel
              selected={d.selectedCourse} termLabel={d.selectedTermLabel} detail={d.adaptedDetail}
              curriculumCodes={d.curriculumCodes}
              transcriptRow={d.selectedCourse ? d.transcriptByCode.get(d.selectedCourse.code.trim().toUpperCase()) : undefined}
              attemptHistory={d.selectedCourse ? d.attemptHistoryByCode.get(d.selectedCourse.code.trim().toUpperCase()) : undefined}
              isLoading={d.detailQuery.isLoading || d.detailQuery.isFetching} onNavigate={handleNavigateCourse}
            />
          )}
        </div>
      </div>
    </div>
  );
}
