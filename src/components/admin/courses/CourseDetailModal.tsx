// src/components/admin/courses/CourseDetailModal.tsx
// Read-only detail + edit relations (prereq / co-req / replacement)
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import type { CourseDetail, CourseRelation, RelationKind } from '../../../types/course';

interface Props {
  open: boolean;
  course: CourseDetail | null;
  availableCourses: { id: string; code: string; name: string }[];
  isSubmitting?: boolean;
  onClose: () => void;
  onAddRelation: (rel: {
    kind: RelationKind;
    groupNo: number;
    otherCourseId: string;
    minimumScore: number | null;
  }) => void;
  onRemoveRelation: (relationId: string) => void;
}

export default function CourseDetailModal({
  open,
  course,
  availableCourses,
  isSubmitting,
  onClose,
  onAddRelation,
  onRemoveRelation,
}: Props) {
  const [kind, setKind] = useState<RelationKind>('PREREQUISITE');
  const [groupNo, setGroupNo] = useState(1);
  const [otherCourseId, setOtherCourseId] = useState('');
  const [minScore, setMinScore] = useState<string>('');

  if (!course) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Course Detail: ${course.code} - ${course.name}`}
      className="max-w-3xl"
    >
      <div className="p-6 space-y-5 text-xs">
        <section className="grid grid-cols-3 gap-4">
          <Stat label="Code" value={course.code} />
          <Stat label="Credits" value={String(course.credits)} />
          <Stat label="Category" value={course.categoryCode} />
        </section>

        {course.description && (
          <Section title="Description">
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </Section>
        )}
        {course.objectives && (
          <Section title="Objectives">
            <p className="text-gray-700 leading-relaxed">{course.objectives}</p>
          </Section>
        )}
        {course.learningOutcomes && (
          <Section title="Learning Outcomes">
            <p className="text-gray-700 leading-relaxed">{course.learningOutcomes}</p>
          </Section>
        )}

        <Section title="Relations (prerequisite / co-requisite / replacement)">
          <div className="grid grid-cols-5 gap-2 items-end mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Kind</label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as RelationKind)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-md"
              >
                <option value="PREREQUISITE">Prerequisite</option>
                <option value="CO_REQUISITE">Co-requisite</option>
                <option value="REPLACEMENT">Replacement</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Group</label>
              <input
                type="number"
                min={1}
                max={20}
                value={groupNo}
                onChange={(e) => setGroupNo(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-md"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-gray-700 uppercase mb-1">Course</label>
              <select
                value={otherCourseId}
                onChange={(e) => setOtherCourseId(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-md"
              >
                <option value="">Select course...</option>
                {availableCourses
                  .filter((c) => c.id !== course.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Min Score</label>
              <button
                type="button"
                disabled={!otherCourseId || isSubmitting}
                onClick={() =>
                  onAddRelation({
                    kind,
                    groupNo,
                    otherCourseId,
                    minimumScore: minScore === '' ? null : Number(minScore),
                  })
                }
                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-md disabled:opacity-60"
              >
                <Plus className="size-3.5" /> Add
              </button>
            </div>
            <div className="col-span-5">
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Minimum Score (optional)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="e.g. 5.00"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-md"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
                  <th className="p-2">Kind</th>
                  <th className="p-2">Group</th>
                  <th className="p-2">Course</th>
                  <th className="p-2 text-center">Min Score</th>
                  <th className="p-2 w-12 text-center">-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {course.relations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No relations yet.
                    </td>
                  </tr>
                )}
                {course.relations.map((r: CourseRelation) => (
                  <tr key={r.relationId}>
                    <td className="p-2">{r.kind}</td>
                    <td className="p-2 text-center">{r.groupNo}</td>
                    <td className="p-2">
                      <span className="font-bold text-gray-900">{r.otherCourseCode}</span>{' '}
                      <span className="text-gray-600">- {r.otherCourseName}</span>
                    </td>
                    <td className="p-2 text-center">{r.minimumScore ?? '—'}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => onRemoveRelation(r.relationId)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Remove"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-gray-500 italic">
            Rows sharing the same Group are alternatives (OR). Different Groups are all required (AND).
          </p>
        </Section>

        {course.referencedBy.length > 0 && (
          <Section title="Used as prerequisite by">
            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
              {course.referencedBy.map((r) => (
                <li key={r.courseId}>
                  <span className="font-bold">{r.courseCode}</span> - {r.courseName}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-[10px] font-bold uppercase text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </h4>
      {children}
    </section>
  );
}