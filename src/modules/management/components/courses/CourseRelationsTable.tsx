import { useEffect, useState } from 'react';
import { StaticTable } from '@/shared/components/common/table/StaticTable';
import type { CourseDetail, CourseRelation } from '../../../academic/types/course';
import { createRelationActionsColumn } from './CourseRelationActions';
import { createRelationColumns, type RelationEditState } from './CourseRelationColumns';

interface Props {
  course: CourseDetail;
  isSubmitting?: boolean;
 onNavigate?: (courseId: string) => void;
  onUpdate: (relationId: string, body: { groupNo: number; minimumScore: number | null }) => Promise<unknown>;
  onRemove: (relationId: string) => Promise<unknown>;
  readOnly?: boolean;
}

export function CourseRelationsTable({
  course,
  isSubmitting,
  onNavigate,
 onUpdate,
  onRemove,
  readOnly = false,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [group, setGroup] = useState('1');
  const [score, setScore] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

 useEffect(() => {
    setEditingId(null);
    setRemovingId(null);
  }, [course.id]);

  const startEdit = (r: CourseRelation) => {
    setEditingId(r.relationId);
    setGroup(String(r.groupNo));
    setScore(r.minimumScore === null ? '' : String(r.minimumScore));
  };
  const save = async (r: CourseRelation) => {
    const groupNo = r.kind === 'REPLACEMENT' ? 1 : Number(group);
    const minimumScore = r.kind === 'REPLACEMENT' || score === '' ? null : Number(score);
    try {
      await onUpdate(r.relationId, { groupNo, minimumScore });
      setEditingId(null);
    } catch {
      return;
    }
  };
  const groupOk = Number.isInteger(Number(group)) && Number(group) >= 1 && Number(group) <= 20;
  const scoreOk = score === '' || (Number(score) >= 0 && Number(score) <= 10);

  const state: RelationEditState = { editingId, removingId, group, score };

  const confirmRemove = async (relation: CourseRelation) => {
    try {
      await onRemove(relation.relationId);
    } finally {
      setRemovingId(null);
    }
  };

  const handlers = {
    state,
    onChangeGroup: setGroup,
    onChangeScore: setScore,
    onStartEdit: startEdit,
    onCancelEdit: () => setEditingId(null),
    onRequestRemove: (relation: CourseRelation) => setRemovingId(relation.relationId),
    onConfirmRemove: confirmRemove,
    onCancelRemove: () => setRemovingId(null),
    onSave: save,
    onNavigate,
    isSubmitting,
    isEditValid: groupOk && scoreOk,
  };

  const columns = readOnly
    ? createRelationColumns(handlers)
    : [...createRelationColumns(handlers), createRelationActionsColumn(handlers)];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <StaticTable
        columns={columns}
        rows={course.relations}
        rowKey={(r) => r.relationId}
        emptyTitle={
          readOnly
            ? 'No prerequisite or replacement courses for this course.'
            : 'No prerequisite or replacement courses yet'
        }
        emptyDescription={
          readOnly ? undefined : 'Add the first one above to link it to this course.'
        }
      />
    </div>
  );
}
