// Column definitions of the course-relations table.
//
// The table supports inline editing, so the columns own their editing state
// and the callbacks that commit or cancel an edit.

import { cn } from '@/shared/lib/utils';
import type { StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { CourseRelation } from '../../../academic/types/course';
import { courseRelationInputClass } from './CoursePicker';

export interface RelationEditState {
  editingId: string | null;
  removingId: string | null;
  group: string;
  score: string;
}

export interface RelationColumnHandlers {
  state: RelationEditState;
  onChangeGroup: (value: string) => void;
  onChangeScore: (value: string) => void;
  onStartEdit: (relation: CourseRelation) => void;
  onCancelEdit: () => void;
  /** Opens the confirmation state of a relation. */
  onRequestRemove: (relation: CourseRelation) => void;
  /** Deletes the relation for good. */
  onConfirmRemove: (relation: CourseRelation) => void;
  onCancelRemove: () => void;
  onSave: (relation: CourseRelation) => void;
  onNavigate?: (courseId: string) => void;
  isSubmitting?: boolean;
  /** True when the current group and score values are valid. */
  isEditValid: boolean;
}

export function createRelationColumns(
  handlers: RelationColumnHandlers,
): StaticColumn<CourseRelation>[] {
  const { state } = handlers;

  return [
    {
      key: 'kind',
      header: 'Type',
      render: (r) => {
        const replacement = r.kind === 'REPLACEMENT';
        return (
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1',
              replacement
                ? 'bg-blue-50 text-blue-700 ring-blue-200'
                : 'bg-orange-50 text-orange-700 ring-orange-200',
            )}
          >
            {replacement ? 'Replacement' : 'Prerequisite'}
          </span>
        );
      },
    },
    {
      key: 'course',
      header: 'Course',
      render: (r) =>
        handlers.onNavigate ? (
          <button
            type="button"
            onClick={() => handlers.onNavigate?.(r.otherCourseId)}
            title={`View detail of ${r.otherCourseCode}`}
            className="group text-left"
          >
            <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white transition-colors group-hover:bg-[var(--brand)]">
              {r.otherCourseCode}
            </span>{' '}
            <span className="font-semibold text-gray-700 group-hover:text-[var(--brand-ink)] group-hover:underline">
              - {r.otherCourseName}
            </span>
          </button>
        ) : (
          <span className="text-gray-700">
            <span className="font-mono font-bold text-gray-900">{r.otherCourseCode}</span>{' '}
            <span>- {r.otherCourseName}</span>
          </span>
        ),
    },
    {
      key: 'group',
      header: 'Group',
      align: 'center',
      render: (r) => {
        const editing = state.editingId === r.relationId;
        const replacement = r.kind === 'REPLACEMENT';
        if (editing && !replacement) {
          return (
            <input
              type="number"
              min={1}
              max={20}
              value={state.group}
              onChange={(e) => handlers.onChangeGroup(e.target.value)}
              aria-label="Edit group"
              className={cn(courseRelationInputClass, 'w-16 py-1.5 text-center')}
            />
          );
        }
        return <span className="font-bold text-gray-900">{r.groupNo}</span>;
      },
    },
    {
      key: 'score',
      header: 'Min score',
      align: 'center',
      render: (r) => {
        const editing = state.editingId === r.relationId;
        const replacement = r.kind === 'REPLACEMENT';
        if (editing && !replacement) {
          return (
            <input
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={state.score}
              onChange={(e) => handlers.onChangeScore(e.target.value)}
              aria-label="Edit minimum score"
              className={cn(courseRelationInputClass, 'w-20 py-1.5 text-center')}
            />
          );
        }
        return <span className="font-semibold text-gray-700">{r.minimumScore ?? '—'}</span>;
      },
    },
  ];
}
