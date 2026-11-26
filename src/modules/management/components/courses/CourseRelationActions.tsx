// The actions column of the course-relations table.
//
// The cell has three states: idle (edit and remove), editing (save and
// cancel) and removing (confirm or keep).

import { Check, PencilSimple as Pencil, Trash as Trash2, X } from '@phosphor-icons/react';
import type { StaticColumn } from '@/shared/components/common/table/StaticTable';
import type { CourseRelation } from '../../../academic/types/course';
import type { RelationColumnHandlers } from './CourseRelationColumns';

export function createRelationActionsColumn(
  handlers: RelationColumnHandlers,
): StaticColumn<CourseRelation> {
  const { state } = handlers;

  return {
    key: 'actions',
    header: 'Actions',
    align: 'center',
    render: (r) => {
      const editing = state.editingId === r.relationId;
      const replacement = r.kind === 'REPLACEMENT';

      if (state.removingId === r.relationId) {
        return (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={handlers.isSubmitting}
              onClick={() => handlers.onConfirmRemove(r)}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={handlers.onCancelRemove}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50"
            >
              Keep
            </button>
          </span>
        );
      }

      if (editing) {
        return (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={handlers.isSubmitting || (!replacement && !handlers.isEditValid)}
              onClick={() => handlers.onSave(r)}
              aria-label="Save relation"
              className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-40"
            >
              <Check className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handlers.onCancelEdit}
              aria-label="Cancel edit"
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <X className="size-3.5" />
            </button>
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1">
          {!replacement && (
            <button
              type="button"
              onClick={() => handlers.onStartEdit(r)}
              aria-label={`Edit ${r.otherCourseCode}`}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handlers.onRequestRemove(r)}
            aria-label={`Remove ${r.otherCourseCode}`}
            className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </span>
      );
    },
  };
}
