import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import type { EffectiveCurriculumCourse, EligibilityResult, RegularBlockMeta } from './curriculumBlockRules';
import type { TermTab } from './curriculumCourseHelpers';

interface Props {
  termTabs: TermTab[];
  termToSemCode?: Map<number, string>;
  activeTabId?: string;
  isSearching: boolean;
  draggingCourse: EffectiveCurriculumCourse | null;
  dragOverSem: number | null;
  regularBlocks: RegularBlockMeta[];
  placementCount: number;
  isSaving: boolean;
  topLeftSlot?: ReactNode;
  topRightSlot?: ReactNode;
  validatePlacement: (course: EffectiveCurriculumCourse, targetSem: number, block: RegularBlockMeta) => EligibilityResult;
  onSelectTab: (tabId: string) => void;
  onSetDragOverSem: (sem: number | null) => void;
  onDropToTerm: (targetSem: number) => void;
  onResetAll: () => void;
}

export function CurriculumTermBar({
  termTabs,
  termToSemCode,
  activeTabId,
  isSearching,
  draggingCourse,
  dragOverSem,
  regularBlocks,
  placementCount,
  isSaving,
  topLeftSlot,
  topRightSlot,
  validatePlacement,
  onSelectTab,
  onSetDragOverSem,
  onDropToTerm,
  onResetAll,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const syncOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollWidth > el.clientWidth + 2);
  }, []);

  useEffect(() => {
    syncOverflow();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(syncOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncOverflow, termTabs]);

  return (
    <div className="flex shrink-0 flex-col gap-2 md:flex-row md:items-center md:justify-between">
      {topLeftSlot && <div className="shrink-0">{topLeftSlot}</div>}

      <div className="flex min-w-0 flex-1 items-center rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs">
        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Semesters"
          onWheel={(e) => {
            if (e.currentTarget.scrollWidth <= e.currentTarget.clientWidth) return;
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className={`flex w-full items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isOverflowing ? 'justify-start' : 'justify-between'
          }`}
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
                title={termToSemCode?.get(t.sem) ? `${t.label} · ${termToSemCode.get(t.sem)}` : t.label}
                onClick={(e) => {
                  onSelectTab(t.id);
                  e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
                }}
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
                className={`inline-flex h-8.5 shrink-0 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                  dragOverSem === t.sem && tabCanAccept
                    ? 'scale-105 bg-orange-100 text-[#C2410C] ring-2 ring-[#F26F21]'
                    : draggingCourse && !tabCanAccept && !isActive
                      ? 'text-gray-400 opacity-45'
                      : isActive
                        ? 'bg-[#F26F21] text-white shadow-2xs'
                        : t.sem === 99
                          ? 'border border-dashed border-orange-300 bg-orange-50/70 text-[#C2410C] hover:bg-orange-100/80'
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
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {placementCount > 0 && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onResetAll}
            title="Restore default curriculum blocks & semesters"
            className="inline-flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white px-3 text-xs font-semibold text-gray-700 shadow-2xs transition-colors hover:border-orange-300 hover:text-[#C2410C] disabled:opacity-50"
          >
            <ArrowCounterClockwise className="size-3.5" /> Reset ({placementCount})
          </button>
        )}
        {topRightSlot}
      </div>
    </div>
  );
}
