import { useMemo, useState } from 'react';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { BlockSection, PlannedCourseRow } from './curriculumBlockPlanner';
import type { EffectiveCurriculumCourse, EligibilityResult, RegularBlockMeta } from './curriculumBlockRules';
import { CurriculumBlockSection } from './CurriculumBlockSection';
import { CurriculumCourseCard } from './CurriculumCourseCard';
import { classifyStatus, type AttemptSummary, type CourseStatusKind } from './curriculumCourseHelpers';

interface CurriculumCourseTableProps {
  courses: EffectiveCurriculumCourse[];
  sections?: BlockSection[];
  activeSem: number;
  selectedKey?: string | null;
  transcriptByCode: Map<string, TranscriptRow>;
  attemptHistoryByCode: Map<string, AttemptSummary>;
  showSemester: boolean;
  allowDrag?: boolean;
  draggingCourse: EffectiveCurriculumCourse | null;
  validatePlacement: (course: EffectiveCurriculumCourse, targetSem: number, block: RegularBlockMeta) => EligibilityResult;
  onSelect: (course: EffectiveCurriculumCourse) => void;
  onDragStartCourse: (course: EffectiveCurriculumCourse) => void;
  onDragEndCourse: () => void;
  onDropToBlock: (course: EffectiveCurriculumCourse, block: RegularBlockMeta) => void;
  onRemoveFromDraft?: (course: EffectiveCurriculumCourse) => void;
}

export function CurriculumCourseTable({
  courses,
  sections,
  activeSem,
  selectedKey,
  transcriptByCode,
  attemptHistoryByCode,
  showSemester,
  allowDrag = true,
  draggingCourse,
  validatePlacement,
  onSelect,
  onDragStartCourse,
  onDragEndCourse,
  onDropToBlock,
  onRemoveFromDraft,
}: CurriculumCourseTableProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | CourseStatusKind>('ALL');
  const [expandedEmpty, setExpandedEmpty] = useState<Set<string>>(new Set());
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const toggleEmptyBlock = (id: string) => {
    setExpandedEmpty((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = useMemo(() => {
    const c = { ALL: courses.length, PASSED: 0, IN_PROGRESS: 0, FAILED: 0, NOT_TAKEN: 0 };
    for (const course of courses) c[classifyStatus(transcriptByCode.get(course.code.trim().toUpperCase()))] += 1;
    return c;
  }, [courses, transcriptByCode]);

  const matchesFilter = (course: EffectiveCurriculumCourse) =>
    statusFilter === 'ALL' || classifyStatus(transcriptByCode.get(course.code.trim().toUpperCase())) === statusFilter;
  if (courses.length === 0 && (!sections || sections.length === 0)) {
    return <div className="py-12 text-center text-sm text-gray-500">No courses found.</div>;
  }

  const renderCard = (item: PlannedCourseRow) => {
    const upper = item.course.code.trim().toUpperCase();
    const cardKey = `${item.course.semesterNumber}-${item.course.code}-${item.course.courseId}`;
    return (
      <CurriculumCourseCard
        key={cardKey}
        item={item}
        row={transcriptByCode.get(upper)}
        history={attemptHistoryByCode.get(upper)}
        isSelected={selectedKey === cardKey}
        isDragging={draggingCourse?.code === item.course.code}
        showSemester={showSemester}
        allowDrag={allowDrag}
        onSelect={onSelect}
        onDragStart={onDragStartCourse}
        onDragEnd={() => {
          setDragOverId(null);
          onDragEndCourse();
        }}
        onRemoveFromDraft={onRemoveFromDraft}
      />
    );
  };

  const useGrouped = !showSemester && sections && sections.length > 0;
  const flatRows: PlannedCourseRow[] = courses.filter(matchesFilter).map((c) => {
    const isPrep = c.semesterNumber <= 0 && /^(PEN|TRS|LUK)\d+/i.test(c.code);
    return {
      course: c,
      blockCode: c.placement?.blockCode ?? (isPrep ? 'PREP_PART' : 'BLOCK_10W'),
      blockLabel: isPrep ? 'Prep Part' : 'Block 10W',
      durationLabel: isPrep ? '7w' : '10w',
      blockTone: isPrep ? 'prep' : 'main',
    };
  });

  const allChips: { key: 'ALL' | CourseStatusKind; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: counts.ALL },
    { key: 'PASSED', label: 'Passed', count: counts.PASSED },
    { key: 'IN_PROGRESS', label: 'Studying', count: counts.IN_PROGRESS },
    { key: 'FAILED', label: 'Failed', count: counts.FAILED },
    { key: 'NOT_TAKEN', label: 'Remaining', count: counts.NOT_TAKEN },
  ];
  const filterChips = allChips.filter((f) => f.key === 'ALL' || f.count > 0);

  return (
    <div className="space-y-4">
      {filterChips.length > 2 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filterChips.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors ${
                statusFilter === f.key
                  ? 'bg-[#F26F21] text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
              }`}
            >
              <span>{f.label}</span>
              <span className="opacity-80">{f.count}</span>
            </button>
          ))}
        </div>
      )}

      {useGrouped ? (
        <div className="space-y-4">
          {sections.map((sec) => {
            const visible = sec.rows.filter((r) => matchesFilter(r.course));
            const eligibility = draggingCourse && sec.droppable && sec.blockMeta
              ? validatePlacement(draggingCourse, activeSem, sec.blockMeta)
              : null;
            return (
              <CurriculumBlockSection
                key={sec.id}
                sec={sec}
                visible={visible}
                statusFilter={statusFilter}
                isExpandedEmpty={expandedEmpty.has(sec.id)}
                isOver={dragOverId === sec.id}
                allowDrag={allowDrag}
                draggingCourse={allowDrag ? draggingCourse : null}
                eligibility={eligibility}
                transcriptByCode={transcriptByCode}
                renderCard={renderCard}
                onToggleEmpty={toggleEmptyBlock}
                onSetDragOver={setDragOverId}
                onDropToBlock={onDropToBlock}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{flatRows.map(renderCard)}</div>
      )}
    </div>
  );
}
