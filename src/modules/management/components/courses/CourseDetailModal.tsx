// Course detail plus prerequisite / replacement relations (add, edit, remove).
// Synced with the Curriculum ecosystem: gradient header, stat pills, skeleton
// loading, clickable prerequisite / referenced-by codes for cross-navigation.
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpenText,
  Check,
  GraduationCap,
  Link2,
  ListTree,
  Loader2,
  Pencil,
  Plus,
  ScrollText,
  Search,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { StatusBadge } from '../StatusBadge';
import { useCoursesQuery } from '../../../academic/hooks/queries/useCoursesQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/utils';
import type { CourseDetail, CourseRelation, RelationKind } from '../../../academic/types/course';

interface NewRelation {
  kind: RelationKind;
  groupNo: number;
  otherCourseId: string;
  minimumScore: number | null;
}

interface Props {
  open: boolean;
  course: CourseDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  /** Cross-navigation: jump to another course without closing the modal. */
  onNavigate?: (courseId: string) => void;
  onAddRelation: (rel: NewRelation) => Promise<unknown>;
  onUpdateRelation: (relationId: string, body: { groupNo: number; minimumScore: number | null }) => Promise<unknown>;
  onRemoveRelation: (relationId: string) => Promise<unknown>;
}

const input = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-900 transition-all focus:border-[#F26F21] focus:outline-none focus:ring-2 focus:ring-[#F26F21]/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60';
const label = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500';

export default function CourseDetailModal({
  open,
  course,
  isLoading,
  isSubmitting,
  onClose,
  onNavigate,
  onAddRelation,
  onUpdateRelation,
  onRemoveRelation,
}: Props) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={course ? `Course detail: ${course.code}` : 'Course detail'} className="max-w-3xl">
      {!course || isLoading ? (
        <DetailSkeleton onClose={onClose} />
      ) : (
        <>
          {/* Header */}
          <div className="overflow-hidden rounded-t-2xl">
            <div className="h-1.5 bg-gradient-to-r from-[#F26F21] via-[#f97316] to-[#C2410C]" />
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-[#fff7ed] to-white px-6 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F26F21] to-[#C2410C] text-white shadow-[0_4px_12px_rgba(242,111,33,0.35)]">
                  <BookOpenText className="size-5.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-gray-900 px-2.5 py-1 font-mono text-[12px] font-bold text-white">
                      {course.code}
                    </span>
                    <StatusBadge status={course.status} />
                    {course.specialization && (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-extrabold text-violet-800 ring-1 ring-violet-200">
                        {course.specialization}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1.5 truncate text-base font-extrabold tracking-tight text-gray-900" title={`${course.code} - ${course.name}`}>
                    {course.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-gray-500">
                    {course.categoryCode} | {course.categoryName} · {course.credits} credits · {course.relations.length} relation{course.relations.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[62vh] space-y-5 overflow-y-auto px-6 py-5 text-[13px]">
            {/* Stat pills */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <Stat label="Credits" value={`${course.credits}`} accent />
              <Stat label="Prerequisites" value={String(course.relations.filter((r) => r.kind === 'PREREQUISITE').length)} />
              <Stat label="Replacements" value={String(course.relations.filter((r) => r.kind === 'REPLACEMENT').length)} />
              <Stat label="In curriculums" value={String(course.usedInCurriculumCount)} />
            </div>

            {/* Syllabus */}
            <section className="overflow-hidden rounded-2xl border border-gray-100">
              <header className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
                <ScrollText className="size-4 text-[#F26F21]" />
                <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">Syllabus — Đề cương</h3>
              </header>
              <div className="space-y-3.5 p-4">
                <SyllabusBlock icon={<BookOpenText className="size-3.5" />} title="Description" text={course.description} fallback="No description yet — edit the course to add one." />
                <SyllabusBlock icon={<Target className="size-3.5" />} title="Objectives" text={course.objectives} fallback="No objectives yet." />
                <SyllabusBlock icon={<GraduationCap className="size-3.5" />} title="Learning outcomes" text={course.learningOutcomes} fallback="No learning outcomes yet." />
              </div>
            </section>

            {/* Prerequisites */}
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
                <Link2 className="size-3.5 text-[#F26F21]" /> Prerequisites & replacements
              </h3>
              <AddRelationForm course={course} isSubmitting={isSubmitting} onAdd={onAddRelation} />
              <RelationsTable
                course={course}
                isSubmitting={isSubmitting}
                onNavigate={onNavigate}
                onUpdate={onUpdateRelation}
                onRemove={onRemoveRelation}
              />
              <p className="mt-2 text-[11px] italic leading-relaxed text-gray-500">
                Prerequisites in the same group are alternatives (any one is enough); different groups must all be satisfied.
                A replacement is a course that can stand in for this one. Click a code to jump to that course.
              </p>
            </section>

            {/* Referenced by */}
            <section className="overflow-hidden rounded-2xl border border-gray-100">
              <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
                <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-tight text-gray-900">
                  <ListTree className="size-4 text-[#F26F21]" /> Referenced by
                </h3>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold tabular-nums text-gray-600">
                  {course.referencedBy.length}
                </span>
              </header>
              {course.referencedBy.length === 0 ? (
                <p className="px-4 py-5 text-center text-xs text-gray-400">
                  No other course lists {course.code} as a prerequisite yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {course.referencedBy.map((r) => (
                    <li key={r.courseId}>
                      {onNavigate ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(r.courseId)}
                          title={`View detail of ${r.courseCode}`}
                          className="group flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#fff7ed]/60"
                        >
                          <span className="min-w-0">
                            <span className="rounded-md bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white transition-colors group-hover:bg-[#F26F21]">
                              {r.courseCode}
                            </span>
                            <span className="ml-2 truncate text-xs font-semibold text-gray-700 group-hover:text-[#9a3412]">{r.courseName}</span>
                          </span>
                          <ArrowUpRight className="size-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-[#F26F21]" />
                        </button>
                      ) : (
                        <p className="px-4 py-2.5 text-xs text-gray-700">
                          <span className="font-bold text-gray-900">{r.courseCode}</span> - {r.courseName}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <p className="text-[11px] text-gray-500">
              Updated {new Date(course.updatedAt).toLocaleDateString()} · Created {new Date(course.createdAt).toLocaleDateString()}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

function DetailSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div aria-label="Loading course detail">
      <div className="h-1.5 animate-pulse bg-orange-100" />
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="size-11 animate-pulse rounded-2xl bg-orange-100" />
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
          <X className="size-4" />
        </button>
      </div>
      <div className="space-y-3 px-6 py-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
        <p className="flex items-center justify-center gap-2 text-center text-[11px] font-medium text-gray-400">
          <Loader2 className="size-3.5 animate-spin" /> Loading course… (mock delay 500ms)
        </p>
      </div>
    </div>
  );
}

/** Search-as-you-click course picker backed by the course list API (the catalogue is too big to preload). */
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
      <div className="flex items-center justify-between gap-2 rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2">
        <span className="truncate text-[13px]">
          <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{value.code}</span>
          <span className="ml-1.5 font-semibold text-gray-700">- {value.name}</span>
        </span>
        <button type="button" onClick={() => onChange(null)} aria-label="Clear course" className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-700">
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search by code or name..."
        aria-label="Search course"
        className={cn(input, 'pl-9')}
      />
      {focused && (
        <ul role="listbox" className="absolute left-0 right-0 top-full z-10 mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {results.length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-500">{isFetching ? 'Searching...' : 'No matching course'}</li>
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
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-orange-50"
              >
                <span className="font-mono font-bold text-gray-900">{c.code}</span> <span className="text-gray-600">- {c.name}</span>
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

  useEffect(() => {
    setOther(null);
    setGroupNo('1');
    setMinScore('');
  }, [course.id]);

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
    <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-3.5">
      <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-12">
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
            className={cn(input, groupInvalid && 'border-red-400 ring-1 ring-red-200')}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Min score</label>
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
            className={cn(input, scoreInvalid && 'border-red-400 ring-1 ring-red-200')}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-h-4 text-[11px] font-medium text-red-600" role="status">
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#F26F21] px-3.5 py-2 text-xs font-bold text-white shadow-[0_1px_2px_rgba(242,111,33,0.4)] transition-colors hover:bg-[#e05f14] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" strokeWidth={2.5} />}
          {isSubmitting ? 'Adding…' : 'Add relation'}
        </button>
      </div>
    </div>
  );
}

function RelationsTable({
  course,
  isSubmitting,
  onNavigate,
  onUpdate,
  onRemove,
}: {
  course: CourseDetail;
  isSubmitting?: boolean;
  onNavigate?: (courseId: string) => void;
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
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500">
            <th className="p-2.5">Type</th>
            <th className="p-2.5">Course</th>
            <th className="p-2.5 text-center">Group</th>
            <th className="p-2.5 text-center">Min score</th>
            <th className="w-24 p-2.5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {course.relations.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-xs text-gray-400">
                No prerequisite or replacement courses yet — add the first one above.
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
                    <button
                      type="button"
                      onClick={() => onNavigate(r.otherCourseId)}
                      title={`View detail of ${r.otherCourseCode}`}
                      className="group text-left"
                    >
                      <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white transition-colors group-hover:bg-[#F26F21]">
                        {r.otherCourseCode}
                      </span>{' '}
                      <span className="font-semibold text-gray-700 group-hover:text-[#C2410C] group-hover:underline">- {r.otherCourseName}</span>
                    </button>
                  ) : (
                    <span className="text-gray-700">
                      <span className="font-mono font-bold text-gray-900">{r.otherCourseCode}</span>{' '}
                      <span>- {r.otherCourseName}</span>
                    </span>
                  )}
                </td>
                <td className="p-2.5 text-center tabular-nums">
                  {editing && !replacement ? (
                    <input type="number" min={1} max={20} value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Edit group" className={cn(input, 'w-16 py-1.5 text-center')} />
                  ) : (
                    <span className="font-bold text-gray-900">{r.groupNo}</span>
                  )}
                </td>
                <td className="p-2.5 text-center tabular-nums">
                  {editing && !replacement ? (
                    <input type="number" step="0.1" min={0} max={10} value={score} onChange={(e) => setScore(e.target.value)} aria-label="Edit minimum score" className={cn(input, 'w-20 py-1.5 text-center')} />
                  ) : (
                    <span className="font-semibold text-gray-700">{r.minimumScore ?? '—'}</span>
                  )}
                </td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-2xl border p-3', accent ? 'border-orange-200 bg-orange-50/70' : 'border-gray-200 bg-gray-50/60')}>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-gray-500">{label}</p>
      <p className={cn('mt-1 text-base font-extrabold tabular-nums', accent ? 'text-[#9a3412]' : 'text-gray-900')}>{value}</p>
    </div>
  );
}

function SyllabusBlock({ icon, title, text, fallback }: { icon: React.ReactNode; title: string; text: string | null; fallback: string }) {
  return (
    <div>
      <h4 className="mb-1 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
        <span className="text-[#F26F21]">{icon}</span> {title}
      </h4>
      {text ? (
        <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{text}</p>
      ) : (
        <p className="text-[13px] italic text-gray-400">{fallback}</p>
      )}
    </div>
  );
}
