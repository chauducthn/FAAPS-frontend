// Course detail plus prerequisite / replacement relations (add, edit, remove).
import { BookOpenText, GraduationCap, Link2, ScrollText, Target, X } from 'lucide-react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { StatusBadge } from '../StatusBadge';
import type { CourseDetail } from '../../../academic/types/course';
import { CourseAddRelationForm, type NewCourseRelation } from './CourseAddRelationForm';
import { CourseRelationsTable } from './CourseRelationsTable';
import {
  CourseDetailSkeleton,
  CourseReferencedBySection,
  CourseStat,
  CourseSyllabusBlock,
} from './CourseDetailSections';

interface Props {
  open: boolean;
  course: CourseDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onNavigate?: (courseId: string) => void;
  readOnly?: boolean;
  onAddRelation: (rel: NewCourseRelation) => Promise<unknown>;
  onUpdateRelation: (relationId: string, body: { groupNo: number; minimumScore: number | null }) => Promise<unknown>;
  onRemoveRelation: (relationId: string) => Promise<unknown>;
}

export default function CourseDetailModal({
  open,
  course,
  isLoading,
  isSubmitting,
  onClose,
  onNavigate,
  readOnly = false,
  onAddRelation,
  onUpdateRelation,
  onRemoveRelation,
}: Props) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={course ? `Course detail: ${course.code}` : 'Course detail'} className="max-w-3xl">
      {!course || isLoading ? (
        <CourseDetailSkeleton onClose={onClose} />
      ) : (
        <>
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
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <CourseStat label="Credits" value={`${course.credits}`} accent />
              <CourseStat label="Prerequisites" value={String(course.relations.filter((r) => r.kind === 'PREREQUISITE').length)} />
              <CourseStat label="Replacements" value={String(course.relations.filter((r) => r.kind === 'REPLACEMENT').length)} />
              <CourseStat label="In curriculums" value={String(course.usedInCurriculumCount)} />
            </div>

            <section className="overflow-hidden rounded-2xl border border-gray-100">
              <header className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
                <ScrollText className="size-4 text-[#F26F21]" />
                <h3 className="text-[13px] font-extrabold tracking-tight text-gray-900">Syllabus</h3>
              </header>
              <div className="space-y-3.5 p-4">
                <CourseSyllabusBlock icon={<BookOpenText className="size-3.5" />} title="Description" text={course.description} fallback="No description provided." />
                <CourseSyllabusBlock icon={<Target className="size-3.5" />} title="Objectives" text={course.objectives} fallback="No objectives provided." />
                <CourseSyllabusBlock icon={<GraduationCap className="size-3.5" />} title="Learning outcomes" text={course.learningOutcomes} fallback="No learning outcomes provided." />
              </div>
            </section>

            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-gray-500">
                <Link2 className="size-3.5 text-[#F26F21]" /> Prerequisites &amp; replacements
              </h3>
              {!readOnly && <CourseAddRelationForm course={course} isSubmitting={isSubmitting} onAdd={onAddRelation} />}
              <CourseRelationsTable
                course={course}
                isSubmitting={isSubmitting}
                onNavigate={onNavigate}
                onUpdate={onUpdateRelation}
                onRemove={onRemoveRelation}
                readOnly={readOnly}
              />
              <p className="mt-2 text-[11px] italic leading-relaxed text-gray-500">
                Prerequisites in the same group are alternatives (any one is enough); different groups must all be satisfied.
                A replacement is a course that can stand in for this one. Click a code to jump to that course.
              </p>
            </section>

            <CourseReferencedBySection course={course} onNavigate={onNavigate} />
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
