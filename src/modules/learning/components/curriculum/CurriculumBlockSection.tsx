import type { ReactNode } from 'react';
import { BookOpen, Plus } from '@phosphor-icons/react';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { BlockSection, PlannedCourseRow } from './curriculumBlockPlanner';
import type { EffectiveCurriculumCourse, EligibilityResult, RegularBlockMeta } from './curriculumBlockRules';
import { classifyStatus } from './curriculumCourseHelpers';

interface Props {
  sec: BlockSection;
  visible: PlannedCourseRow[];
  statusFilter: string;
  isExpandedEmpty: boolean;
  isOver: boolean;
  draggingCourse: EffectiveCurriculumCourse | null;
  eligibility: EligibilityResult | null;
  transcriptByCode: Map<string, TranscriptRow>;
  renderCard: (item: PlannedCourseRow) => ReactNode;
  onToggleEmpty: (id: string) => void;
  onSetDragOver: (id: string | null) => void;
  onDropToBlock: (course: EffectiveCurriculumCourse, block: RegularBlockMeta) => void;
}

export function CurriculumBlockSection({
  sec,
  visible,
  statusFilter,
  isExpandedEmpty,
  isOver,
  draggingCourse,
  eligibility,
  transcriptByCode,
  renderCard,
  onToggleEmpty,
  onSetDragOver,
  onDropToBlock,
}: Props) {
  const canDrop = !!eligibility?.eligible;

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggingCourse || !sec.droppable || !sec.blockMeta) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
    if (!isOver) onSetDragOver(sec.id);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (isOver) onSetDragOver(null);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onSetDragOver(null);
    if (draggingCourse && sec.blockMeta) onDropToBlock(draggingCourse, sec.blockMeta);
  };

  const isDraggingSameBlock = draggingCourse
    ? sec.rows.some((r) => r.course.code.trim().toUpperCase() === draggingCourse.code.trim().toUpperCase())
    : false;
  const showExpandedForDrag = isOver && canDrop;

  if (visible.length === 0) {
    if (statusFilter !== 'ALL' || !sec.emptyHint) return null;
    if (!isExpandedEmpty && !showExpandedForDrag) {
      return (
        <button
          type="button"
          onClick={() => onToggleEmpty(sec.id)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border border-dashed px-4 py-2.5 text-left text-xs font-semibold transition-all duration-200 ease-out ${
            canDrop
              ? 'border-orange-300 bg-orange-50/30 py-3.5 text-[#C2410C]'
              : draggingCourse && eligibility && !eligibility.eligible
                ? 'border-gray-200 bg-gray-50/30 text-gray-400 opacity-60'
                : 'border-gray-200 bg-gray-50/40 text-gray-500 hover:border-orange-300 hover:bg-orange-50/30 hover:text-[#C2410C]'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="size-3.5" />
            {canDrop ? `Drag here to expand · ${sec.title}` : `Show ${sec.title}`}
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            {draggingCourse && eligibility && !eligibility.eligible ? eligibility.reason : sec.subtitle}
          </span>
        </button>
      );
    }
  }

  const passed = visible.filter(
    (r) => classifyStatus(transcriptByCode.get(r.course.code.trim().toUpperCase())) === 'PASSED',
  ).length;
  const pct = visible.length > 0 ? Math.round((passed / visible.length) * 100) : 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl border transition-all duration-200 ease-out ${
        isOver && canDrop
          ? 'scale-[1.015] border-[#F26F21] bg-orange-50/50 p-5 shadow-md ring-2 ring-[#F26F21]/35'
          : canDrop
            ? 'border-dashed border-orange-300 bg-orange-50/20 p-4'
            : 'border-gray-200/80 bg-gray-50/40 p-4'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-[#F26F21]" />
          <span className="text-xs font-bold text-gray-900">{sec.title}</span>
          <span className="text-[11px] font-medium text-gray-500">· {sec.subtitle}</span>
        </div>
        {draggingCourse && eligibility && !eligibility.eligible ? (
          <span className="text-[11px] font-medium text-amber-700">{eligibility.reason}</span>
        ) : visible.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono text-[11px] font-semibold text-gray-600">{passed}/{visible.length} passed</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onToggleEmpty(sec.id)}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-700"
          >
            Hide
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visible.map(renderCard)}
          {isOver && canDrop && !isDraggingSameBlock && draggingCourse && (
            <div className="flex min-h-[108px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#F26F21] bg-orange-50/70 px-4 text-center transition-all duration-200">
              <span className="font-mono text-xs font-bold text-[#C2410C]">Drop {draggingCourse.code} here</span>
              <span className="mt-0.5 text-[11px] font-medium text-[#C2410C]/80">
                {sec.blockMeta?.shortName} · {sec.blockMeta?.durationWeeks}w
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {isOver && canDrop && draggingCourse ? (
            <div className="flex h-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#F26F21] bg-orange-50/80 px-4 text-center sm:col-span-2">
              <span className="font-mono text-xs font-bold text-[#C2410C]">
                Drop {draggingCourse.code} into {sec.blockMeta?.shortName}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-[#C2410C]/80">{sec.emptyHint}</span>
            </div>
          ) : (
            Array.from({ length: Math.min(2, sec.maxSlots) }).map((_, i) => (
              <div
                key={i}
                className="flex h-20 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 text-center text-xs text-gray-400"
              >
                Slot {i + 1} · {sec.emptyHint}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
