import { useMemo, useState } from 'react';
import { CheckCircle, MagnifyingGlass, Stack, X } from '@phosphor-icons/react';
import type { TranscriptRow } from '../../../academic/services/studentAcademicService';
import type { EffectiveCurriculumCourse } from './curriculumBlockRules';
import { classifyStatus } from './curriculumCourseHelpers';
import { PoolCourseCard } from './CurriculumPoolCard';

interface Props {
  allCourses: EffectiveCurriculumCourse[];
  poolCourseCodes: Set<string>;
  transcriptByCode: Map<string, TranscriptRow>;
  currentSem: number;
  draftLabel: string;
  isSaving: boolean;
  draggingCourse?: EffectiveCurriculumCourse | null;
  onSelectInspect: (course: EffectiveCurriculumCourse) => void;
  onAddToDraft: (course: EffectiveCurriculumCourse) => void;
  onDropToPool?: (course: EffectiveCurriculumCourse) => void;
  onDragStartCourse: (course: EffectiveCurriculumCourse) => void;
  onDragEndCourse: () => void;
}

type PoolFilter = 'DEBT' | 'ALL';

export function CurriculumCoursePoolPanel({
  allCourses, poolCourseCodes, transcriptByCode, currentSem, draftLabel, isSaving,
  draggingCourse, onSelectInspect, onAddToDraft, onDropToPool, onDragStartCourse, onDragEndCourse,
}: Props) {
  const [filter, setFilter] = useState<PoolFilter>('ALL');
  const [query, setQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const pooled = useMemo(() => {
    const items = allCourses
      .filter((c) => poolCourseCodes.has(c.code.trim().toUpperCase()))
      .map((course) => {
        const status = classifyStatus(transcriptByCode.get(course.code.trim().toUpperCase()));
        const isFailed = status === 'FAILED';
        const isOverdue = status === 'NOT_TAKEN' && course.defaultSemesterNumber > 0 && course.defaultSemesterNumber < currentSem;
        return { course, isFailed, isOverdue };
      });
    return items.sort((a, b) => {
      const rank = (x: typeof a) => (x.isFailed ? 0 : x.isOverdue ? 1 : 2);
      return rank(a) - rank(b) || a.course.defaultSemesterNumber - b.course.defaultSemesterNumber || a.course.code.localeCompare(b.course.code);
    });
  }, [allCourses, poolCourseCodes, transcriptByCode, currentSem]);

  const debtCount = useMemo(() => pooled.filter((x) => x.isFailed || x.isOverdue).length, [pooled]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pooled.filter((x) => {
      if (filter === 'DEBT' && !x.isFailed && !x.isOverdue) return false;
      return !q || x.course.code.toLowerCase().includes(q) || x.course.name.toLowerCase().includes(q);
    });
  }, [pooled, filter, query]);

  const chips: { key: PoolFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Pool', count: pooled.length },
    { key: 'DEBT', label: 'Failed & Due', count: debtCount },
  ];

  const canDrop = !!draggingCourse && !!onDropToPool && !poolCourseCodes.has(draggingCourse.code.trim().toUpperCase());

  return (
    <aside
      onDragOver={(e) => {
        if (!canDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isDragOver) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!canDrop || !draggingCourse) return;
        e.preventDefault();
        setIsDragOver(false);
        onDropToPool?.(draggingCourse);
      }}
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xs transition-colors lg:h-full ${
        isDragOver ? 'border-[#F26F21] ring-2 ring-[#F26F21]/20' : 'border-gray-200/80'
      }`}
    >
      <div className="shrink-0 space-y-2.5 border-b border-gray-100 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-orange-50 text-[#F26F21]">
              <Stack className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Course Pool</h3>
              <p className="text-[11px] text-gray-500">Drag into {draftLabel} or drop here to unschedule</p>
            </div>
          </div>
          <span className="rounded-full bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#C2410C]">
            {pooled.length} left
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors ${
                filter === c.key ? 'bg-[#F26F21] text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
              }`}
            >
              <span>{c.label}</span>
              <span className="opacity-80">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter pool courses..."
            className="h-8 w-full rounded-lg border border-gray-200 bg-white pr-7 pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#F26F21] focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear pool filter" className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle className="size-8 text-emerald-500" weight="fill" />
            <p className="mt-2 text-xs font-semibold text-gray-700">No courses match this filter</p>
          </div>
        ) : (
          visible.map(({ course, isFailed, isOverdue }) => (
            <PoolCourseCard
              key={`${course.courseId}-${course.code}`}
              course={course}
              isFailed={isFailed}
              isOverdue={isOverdue}
              inDraft={false}
              draftLabel={draftLabel}
              isSaving={isSaving}
              onSelectInspect={onSelectInspect}
              onAddToDraft={onAddToDraft}
              onDragStartCourse={onDragStartCourse}
              onDragEndCourse={onDragEndCourse}
            />
          ))
        )}
      </div>
    </aside>
  );
}
