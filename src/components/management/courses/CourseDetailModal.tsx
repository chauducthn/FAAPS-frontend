// src/components/management/courses/CourseDetailModal.tsx
// Course detail plus prerequisite / replacement relations (add, edit, remove)
import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { useCoursesQuery } from '../../../hooks/queries/useCoursesQuery';
import { useDebounce } from '../../../hooks/useDebounce';
import type { CourseDetail, CourseRelation, RelationKind } from '../../../types/course';

interface NewRelation {
  kind: RelationKind;
  groupNo: number;
  otherCourseId: string;
  minimumScore: number | null;
}

interface Props {
  open: boolean;
  course: CourseDetail | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onAddRelation: (rel: NewRelation) => Promise<unknown>;
  onUpdateRelation: (relationId: string, body: { groupNo: number; minimumScore: number | null }) => Promise<unknown>;
  onRemoveRelation: (relationId: string) => Promise<unknown>;
}

const input = 'w-full rounded-md border border-gray-200 px-2 py-1.5 focus:border-[#F26F21] focus:outline-none';
const label = 'mb-1 block text-[10px] font-bold uppercase text-gray-600';

export default function CourseDetailModal({
  open,
  course,
  isSubmitting,
  onClose,
  onAddRelation,
  onUpdateRelation,
  onRemoveRelation,
}: Props) {
  if (!course) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Course detail: ${course.code}`} className="max-w-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-gray-900">
            {course.code} - {course.name}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {course.categoryCode} - {course.categoryName} · {course.credits} credits
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-5 overflow-y-auto p-6 text-xs">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Status" value={course.status} />
          <Stat label="Credits" value={String(course.credits)} />
          <Stat label="Relations" value={String(course.relations.length)} />
          <Stat label="In curriculums" value={String(course.usedInCurriculumCount)} />
        </section>

        {course.description && <Text title="Description" text={course.description} />}
        {course.objectives && <Text title="Objectives" text={course.objectives} />}
        {course.learningOutcomes && <Text title="Learning outcomes" text={course.learningOutcomes} />}

        <section>
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Prerequisite and replacement courses
          </h4>
          <AddRelationForm course={course} isSubmitting={isSubmitting} onAdd={onAddRelation} />
          <RelationsTable course={course} isSubmitting={isSubmitting} onUpdate={onUpdateRelation} onRemove={onRemoveRelation} />
          <p className="mt-2 text-[11px] italic text-gray-500">
            Prerequisites in the same group are alternatives (any one is enough); different groups must all be satisfied.
            A replacement is a course that can stand in for this one.
          </p>
        </section>

        {course.referencedBy.length > 0 && (
          <section>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Required by</h4>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              {course.referencedBy.map((r) => (
                <li key={r.courseId}>
                  <span className="font-bold">{r.courseCode}</span> - {r.courseName}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}

/** Search-as-you-type course picker backed by the course list API (the catalogue is too big to preload). */
function CoursePicker({
  excludeIds,
  value,
  onChange,
}: {
  excludeIds: string[];
  value: { id: string; code: string; name: string } | null;
  onChange: (course: { id: string; code: string; name: string } | null) => void;
}) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(text, 250);
  const { data, isFetching } = useCoursesQuery({ search: debounced || undefined, size: 8, status: 'ACTIVE' });
  const results = (data?.items ?? []).filter((c) => !excludeIds.includes(c.id));

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5">
        <span className="truncate">
          <span className="font-bold text-gray-900">{value.code}</span> <span className="text-gray-600">- {value.name}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Clear course" className="text-gray-400 hover:text-gray-700">
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search by code or name..."
        aria-label="Search course"
        className={`${input} pl-7`}
      />
      {focused && (
        <ul role="listbox" className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {results.length === 0 && (
            <li className="px-3 py-2 text-gray-500">{isFetching ? 'Searching...' : 'No matching course'}</li>
          )}
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange({ id: c.id, code: c.code, name: c.name });
                  setText('');
                }}
                className="block w-full px-3 py-1.5 text-left hover:bg-gray-50"
              >
                <span className="font-bold text-gray-900">{c.code}</span> <span className="text-gray-600">- {c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddRelationForm({
  course,
  isSubmitting,
  onAdd,
}: {
  course: CourseDetail;
  isSubmitting?: boolean;
  onAdd: (rel: NewRelation) => Promise<unknown>;
}) {
  const [kind, setKind] = useState<RelationKind>('PREREQUISITE');
  const [groupNo, setGroupNo] = useState('1');
  const [minScore, setMinScore] = useState('');
  const [other, setOther] = useState<{ id: string; code: string; name: string } | null>(null);
  const replacement = kind === 'REPLACEMENT';
  // A course that already requires this one cannot also be its prerequisite (that would be a loop).
  const excluded = [course.id, ...(replacement ? [] : course.referencedBy.map((r) => r.courseId))];

  const group = Number(groupNo);
  const score = minScore === '' ? null : Number(minScore);
  const groupInvalid = !replacement && (!Number.isInteger(group) || group < 1 || group > 20);
  const scoreInvalid = !replacement && score !== null && (Number.isNaN(score) || score < 0 || score > 10);
  const duplicate = other
    ? course.relations.some((r) => r.otherCourseId === other.id && r.kind === kind)
    : false;
  const canAdd = !!other && !groupInvalid && !scoreInvalid && !duplicate && !isSubmitting;

  const submit = async () => {
    if (!other || !canAdd) return;
    try {
      await onAdd({ kind, groupNo: replacement ? 1 : group, otherCourseId: other.id, minimumScore: replacement ? null : score });
      setOther(null);
      setMinScore('');
    } catch {
      // The error toast is shown by the mutation; keep the form so the user can correct it.
    }
  };

  return (
    <div className="mb-3 grid grid-cols-2 items-end gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:grid-cols-12">
      <div className="sm:col-span-3">
        <label className={label}>Type</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as RelationKind)}
          aria-label="Relation type"
          className={input}
        >
          <option value="PREREQUISITE">Prerequisite</option>
          <option value="REPLACEMENT">Replacement</option>
        </select>
      </div>
      <div className="col-span-2 sm:col-span-5">
        <label className={label}>Course</label>
        <CoursePicker excludeIds={excluded} value={other} onChange={setOther} />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Group</label>
        <input
          type="number"
          min={1}
          max={20}
          value={replacement ? '1' : groupNo}
          onChange={(e) => setGroupNo(e.target.value)}
          disabled={replacement}
          aria-label="Group"
          className={`${input} disabled:bg-gray-100 ${groupInvalid ? 'border-red-400' : ''}`}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Min score</label>
        <input
          type="number"
          step="0.01"
          min={0}
          max={10}
          value={replacement ? '' : minScore}
          onChange={(e) => setMinScore(e.target.value)}
          disabled={replacement}
          placeholder="0-10"
          aria-label="Minimum score"
          className={`${input} disabled:bg-gray-100 ${scoreInvalid ? 'border-red-400' : ''}`}
        />
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-12">
        <p className="text-[11px] text-red-600" role="status">
          {duplicate
            ? 'This course is already related to it with the same type.'
            : groupInvalid
              ? 'Group must be a whole number from 1 to 20.'
              : scoreInvalid
                ? 'Minimum score must be between 0 and 10.'
                : ''}
        </p>
        <button
          type="button"
          disabled={!canAdd}
          onClick={submit}
          className="inline-flex items-center gap-1 rounded-md bg-[#F26F21] px-3 py-1.5 font-bold text-white hover:bg-[#e05f14] disabled:opacity-50"
        >
          <Plus className="size-3.5" /> Add relation
        </button>
      </div>
    </div>
  );
}

function RelationsTable({
  course,
  isSubmitting,
  onUpdate,
  onRemove,
}: {
  course: CourseDetail;
  isSubmitting?: boolean;
  onUpdate: Props['onUpdateRelation'];
  onRemove: Props['onRemoveRelation'];
}) {
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
      // toast already shown; stay in edit mode
    }
  };

  const groupOk = Number.isInteger(Number(group)) && Number(group) >= 1 && Number(group) <= 20;
  const scoreOk = score === '' || (Number(score) >= 0 && Number(score) <= 10);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
            <th className="p-2">Type</th>
            <th className="p-2">Course</th>
            <th className="p-2 text-center">Group</th>
            <th className="p-2 text-center">Min score</th>
            <th className="w-24 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {course.relations.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-400">
                No prerequisite or replacement courses yet.
              </td>
            </tr>
          )}
          {course.relations.map((r) => {
            const editing = editingId === r.relationId;
            const replacement = r.kind === 'REPLACEMENT';
            return (
              <tr key={r.relationId} data-testid="relation-row">
                <td className="p-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      replacement ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    {replacement ? 'Replacement' : 'Prerequisite'}
                  </span>
                </td>
                <td className="p-2">
                  <span className="font-bold text-gray-900">{r.otherCourseCode}</span>{' '}
                  <span className="text-gray-600">- {r.otherCourseName}</span>
                </td>
                <td className="p-2 text-center">
                  {editing && !replacement ? (
                    <input type="number" min={1} max={20} value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Edit group" className={`${input} w-16 text-center`} />
                  ) : (
                    r.groupNo
                  )}
                </td>
                <td className="p-2 text-center">
                  {editing && !replacement ? (
                    <input type="number" step="0.01" min={0} max={10} value={score} onChange={(e) => setScore(e.target.value)} aria-label="Edit minimum score" className={`${input} w-20 text-center`} />
                  ) : (
                    (r.minimumScore ?? '—')
                  )}
                </td>
                <td className="p-2 text-center">
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
                        className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                      <button type="button" onClick={() => setRemovingId(null)} className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                        Keep
                      </button>
                    </span>
                  ) : editing ? (
                    <span className="inline-flex items-center gap-1">
                      <button type="button" disabled={isSubmitting || (!replacement && (!groupOk || !scoreOk))} onClick={() => save(r)} aria-label="Save relation" className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-40">
                        <Check className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel edit" className="rounded p-1 text-gray-500 hover:bg-gray-100">
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {!replacement && (
                        <button type="button" onClick={() => startEdit(r)} aria-label={`Edit ${r.otherCourseCode}`} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                          <Pencil className="size-3.5" />
                        </button>
                      )}
                      <button type="button" onClick={() => setRemovingId(r.relationId)} aria-label={`Remove ${r.otherCourseCode}`} className="rounded p-1 text-red-500 hover:bg-red-50">
                        <Trash2 className="size-3.5" />
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label: text, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-[10px] font-bold uppercase text-gray-500">{text}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Text({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</h4>
      <p className="whitespace-pre-line leading-relaxed text-gray-700">{text}</p>
    </section>
  );
}
