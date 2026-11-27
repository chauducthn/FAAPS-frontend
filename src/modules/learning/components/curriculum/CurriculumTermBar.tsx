import type { ReactNode } from 'react';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import type { EffectiveCurriculumCourse, EligibilityResult, RegularBlockMeta } from './curriculumBlockRules';
import type { TermTab } from './curriculumCourseHelpers';

interface Props {
  termTabs: TermTab[];
  activeTabId?: string;
  isSearching: boolean;
  draggingCourse: EffectiveCurriculumCourse | null;
  dragOverSem: number | null;
  regularBlocks: RegularBlockMeta[];
  placementCount: number;
  isSaving: boolean;
  topRightSlot?: ReactNode;
  validatePlacement: (course: EffectiveCurriculumCourse, targetSem: number, block: RegularBlockMeta) => EligibilityResult;
  onSelectTab: (tabId: string) => void;
  onSetDragOverSem: (sem: number | null) => void;
  onDropToTerm: (targetSem: number) => void;
  onResetAll: () => void;
}

export function CurriculumTermBar({
  termTabs,
  activeTabId,
  isSearching,
  draggingCourse,
  dragOverSem,
  regularBlocks,
  placementCount,
  isSaving,
  topRightSlot,
  validatePlacement,
  onSelectTab,
  onSetDragOverSem,
  onDropToTerm,
  onResetAll,
}: Props) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
      <div
        role="tablist"
        aria-label="Semesters"
        className="flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs"
      >
        {termTabs.map((t) => {
          const isActive = t.id === activeTabId && !isSearching;
          const tabCanAccept = draggingCourse
            ? regularBlocks.some((b) => validatePlacement(draggingCourse, t.sem, b).eligible)
            : false;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(t.id)}
              onDragOver={(e) => {
                if (!draggingCourse || t.sem === 0) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = tabCanAccept ? 'move' : 'none';
                if (dragOverSem !== t.sem) onSetDragOverSem(t.sem);
              }}
              onDragLeave={() => { if (dragOverSem === t.sem) onSetDragOverSem(null); }}
              onDrop={(e) => {
                e.preventDefault();
                onDropToTerm(t.sem);
              }}
              className={`inline-flex h-8.5 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
                dragOverSem === t.sem && tabCanAccept
                  ? 'scale-105 bg-orange-100 text-[#C2410C] ring-2 ring-[#F26F21]'
                  : draggingCourse && !tabCanAccept && !isActive
                    ? 'text-gray-400 opacity-45'
                    : isActive
                      ? 'bg-[#F26F21] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{t.label}</span>
              {t.allPassed && (
                <span
                  className={`size-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500'}`}
                  title="All courses passed"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {placementCount > 0 && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onResetAll}
            title="Restore default curriculum blocks & semesters"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-orange-300 hover:text-[#C2410C] disabled:opacity-50"
          >
            <ArrowCounterClockwise className="size-3.5" /> Reset ({placementCount})
          </button>
        )}
        {topRightSlot}
      </div>
    </div>
  );
}
