import { useEffect, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CourseDetail, CourseRelation } from '../../../academic/types/course';
import { courseRelationInputClass } from './CoursePicker';

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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500">
            <th className="p-2.5">Type</th>
            <th className="p-2.5">Course</th>
            <th className="p-2.5 text-center">Group</th>
            <th className="p-2.5 text-center">Min score</th>
            {!readOnly && <th className="w-24 p-2.5 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {course.relations.length === 0 && (
            <tr>
              <td colSpan={readOnly ? 4 : 5} className="p-6 text-center text-xs text-gray-400">
                {readOnly
                  ? 'No prerequisite or replacement courses for this course.'
                  : 'No prerequisite or replacement courses yet — add the first one above.'}
              </td>
            </tr>
          )}
          {course.relations.map((r) => {
            const editing = editingId === r.relationId;
            const replacement = r.kind === 'REPLACEMENT';
            return (
              <tr key={r.relationId} data-testid="relation-row" className="transition-colors hover:bg-orange-50/40">
                <td className="p-2.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1',
                      replacement ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-orange-50 text-orange-700 ring-orange-200',
                    )}
                  >
                    {replacement ? 'Replacement' : 'Prerequisite'}
                  </span>
                </td>
                <td className="p-2.5">
                  {onNavigate ? (
                    <button type="button" onClick={() => onNavigate(r.otherCourseId)} title={`View detail of ${r.otherCourseCode}`} className="group text-left">
                      <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white transition-colors group-hover:bg-[#F26F21]">
                        {r.otherCourseCode}
                      </span>{' '}
                      <span className="font-semibold text-gray-700 group-hover:text-[#C2410C] group-hover:underline">- {r.otherCourseName}</span>
                    </button>
                  ) : (
                    <span className="text-gray-700">
                      <span className="font-mono font-bold text-gray-900">{r.otherCourseCode}</span> <span>- {r.otherCourseName}</span>
                    </span>
                  )}
                </td>
                <td className="p-2.5 text-center tabular-nums">
                  {editing && !replacement ? (
                    <input type="number" min={1} max={20} value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Edit group" className={cn(courseRelationInputClass, 'w-16 py-1.5 text-center')} />
                  ) : (
                    <span className="font-bold text-gray-900">{r.groupNo}</span>
                  )}
                </td>
                <td className="p-2.5 text-center tabular-nums">
                  {editing && !replacement ? (
                    <input type="number" step="0.1" min={0} max={10} value={score} onChange={(e) => setScore(e.target.value)} aria-label="Edit minimum score" className={cn(courseRelationInputClass, 'w-20 py-1.5 text-center')} />
                  ) : (
                    <span className="font-semibold text-gray-700">{r.minimumScore ?? '—'}</span>
                  )}
                </td>
                {!readOnly && (
                  <td className="p-2.5 text-center">
                    {removingId === r.relationId ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={async () => {
                            try {
                              await onRemove(r.relationId);
                            } finally {
                              setRemovingId(null);
                            }
                          }}
                          className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                        <button type="button" onClick={() => setRemovingId(null)} className="rounded-lg border border-gray-200 px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50">
                          Keep
                        </button>
                      </span>
                    ) : editing ? (
                      <span className="inline-flex items-center gap-1">
                        <button type="button" disabled={isSubmitting || (!replacement && (!groupOk || !scoreOk))} onClick={() => save(r)} aria-label="Save relation" className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-40">
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel edit" className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100">
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        {!replacement && (
                          <button type="button" onClick={() => startEdit(r)} aria-label={`Edit ${r.otherCourseCode}`} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
                            <Pencil className="size-3.5" />
                          </button>
                        )}
                        <button type="button" onClick={() => setRemovingId(r.relationId)} aria-label={`Remove ${r.otherCourseCode}`} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50">
                          <Trash2 className="size-3.5" />
                        </button>
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
