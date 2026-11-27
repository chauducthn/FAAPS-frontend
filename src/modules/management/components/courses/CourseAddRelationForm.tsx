import { useEffect, useState } from 'react';
import { CaretDown as ChevronDown, Plus, SpinnerGap as Loader2 } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { CourseDetail, RelationKind } from '../../../academic/types/course';
import { CoursePicker, courseRelationInputClass, courseRelationLabelClass } from './CoursePicker';

export interface NewCourseRelation {
  kind: RelationKind;
  groupNo: number;
  otherCourseId: string;
  minimumScore: number | null;
}

export function CourseAddRelationForm({
  course,
  isSubmitting,
  onAdd,
}: {
  course: CourseDetail;
  isSubmitting?: boolean;
  onAdd: (rel: NewCourseRelation) => Promise<unknown>;
}) {
  const [kind, setKind] = useState<RelationKind>('PREREQUISITE');
  const [groupNo, setGroupNo] = useState('1');
  const [minScore, setMinScore] = useState('');
  const [other, setOther] = useState<{ id: string; code: string; name: string } | null>(null);
  const replacement = kind === 'REPLACEMENT';
  const excluded = [course.id, ...(replacement ? [] : course.referencedBy.map((r) => r.courseId))];

  useEffect(() => {
    setOther(null);
    setGroupNo('1');
    setMinScore('');
  }, [course.id]);

  const group = Number(groupNo);
  const score = minScore === '' ? null : Number(minScore);
  const groupInvalid = !replacement && (!Number.isInteger(group) || group < 1 || group > 20);
  const scoreInvalid = !replacement && score !== null && (Number.isNaN(score) || score < 0 || score > 10);
  const duplicate = other ? course.relations.some((r) => r.otherCourseId === other.id && r.kind === kind) : false;
  const canAdd = !!other && !groupInvalid && !scoreInvalid && !duplicate && !isSubmitting;
  const validationError = duplicate
    ? 'This course is already related with the same type.'
    : groupInvalid
      ? 'Group must be a whole number from 1 to 20.'
      : scoreInvalid
        ? 'Minimum score must be between 0 and 10.'
        : '';

  const submit = async () => {
    if (!other || !canAdd) return;
    try {
      await onAdd({ kind, groupNo: replacement ? 1 : group, otherCourseId: other.id, minimumScore: replacement ? null : score });
      setOther(null);
      setMinScore('');
    } catch {
      return;
    }
  };

  return (
    <div className="rounded-lg border border-line bg-surface-page/60 p-3">
      <div className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
        <div className="w-[132px] shrink-0">
          <label className={courseRelationLabelClass}>Type</label>
          <div className="relative">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as RelationKind)}
              aria-label="Relation type"
              className={cn(courseRelationInputClass, 'appearance-none pr-7')}
            >
              <option value="PREREQUISITE">Prerequisite</option>
              <option value="REPLACEMENT">Replacement</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
          </div>
        </div>

        <div className="min-w-[180px] flex-1">
          <label className={courseRelationLabelClass}>Course</label>
          <CoursePicker excludeIds={excluded} value={other} onChange={setOther} />
        </div>

        <div className="w-16 shrink-0">
          <label className={courseRelationLabelClass}>Group</label>
          <input
            type="number"
            min={1}
            max={20}
            value={replacement ? '1' : groupNo}
            onChange={(e) => setGroupNo(e.target.value)}
            disabled={replacement}
            aria-label="Group"
            className={cn(courseRelationInputClass, 'px-2.5 tabular-nums', groupInvalid && 'border-red-400 ring-1 ring-red-200')}
          />
        </div>

        <div className="w-20 shrink-0">
          <label className={courseRelationLabelClass}>Min score</label>
          <input
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={replacement ? '' : minScore}
            onChange={(e) => setMinScore(e.target.value)}
            disabled={replacement}
            placeholder="0-10"
            aria-label="Minimum score"
            className={cn(courseRelationInputClass, 'px-2.5 tabular-nums', scoreInvalid && 'border-red-400 ring-1 ring-red-200')}
          />
        </div>

        <button
          type="button"
          disabled={!canAdd}
          onClick={submit}
          aria-label="Add relation"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Add
        </button>
      </div>

      {validationError && (
        <p className="mt-2 text-[11px] font-medium text-red-600" role="status">
          {validationError}
        </p>
      )}
    </div>
  );
}
