// Course detail plus prerequisite / replacement relations (add, edit, remove).
import { BookOpenText, ChartBar, ArrowSquareOut as ExternalLink, GraduationCap, Link as Link2, Scroll as ScrollText, Stack, Target, X } from '@phosphor-icons/react';
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

  const prereqCount = course ? course.relations.filter((r) => r.kind === 'PREREQUISITE').length : 0;
  const replaceCount = course ? course.relations.filter((r) => r.kind === 'REPLACEMENT').length : 0;
  const hasSyllabus = !!course && !!(course.description || course.objectives || course.learningOutcomes);

  return (
    <Modal open={open} onClose={onClose} title={course ? `Course detail: ${course.code}` : 'Course detail'} className="max-w-3xl">
      {!course || isLoading ? (
        <CourseDetailSkeleton onClose={onClose} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F26F21] ring-1 ring-orange-200/70">
                <BookOpenText className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-gray-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    {course.code}
                  </span>
                  <StatusBadge status={course.status} />
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                    {course.categoryCode} · {course.categoryName}
                  </span>
                  {course.knowledgeBlock && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200/70">
                      <Stack className="size-3" /> {course.knowledgeBlock}
                    </span>
                  )}
                  {course.specialization && (
                    <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200/70">
                      {course.specialization}
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 text-base font-bold leading-snug text-gray-900" title={`${course.code} - ${course.name}`}>
                  {course.name}
                </h2>
                {course.materialLink && (
                  <a
                    href={course.materialLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#C2410C] hover:underline"
                  >
                    Course materials <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
              <X className="size-4" />
            </button>
          </div>

          <div className="max-h-[65vh] space-y-5 overflow-y-auto bg-gray-50/40 px-6 py-5 text-[13px]">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <CourseStat label="Credits" value={String(course.credits)} accent />
              <CourseStat label="Prerequisites" value={String(prereqCount)} />
              <CourseStat label="Replacements" value={String(replaceCount)} />
              <CourseStat label="In curriculums" value={String(course.usedInCurriculumCount)} />
            </div>

            {hasSyllabus && (
              <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
                <header className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
                  <ScrollText className="size-4 text-[#F26F21]" />
                  <h3 className="text-[13px] font-bold text-gray-900">Syllabus overview</h3>
                </header>
                <div className="space-y-3.5 p-4">
                  {course.description && <CourseSyllabusBlock icon={<BookOpenText className="size-3.5" />} title="Description" text={course.description} fallback="" />}
                  {course.objectives && <CourseSyllabusBlock icon={<Target className="size-3.5" />} title="Objectives & Study Requirements" text={course.objectives} fallback="" />}
                  {course.learningOutcomes && <CourseSyllabusBlock icon={<GraduationCap className="size-3.5" />} title="Learning outcomes (CLOs)" text={course.learningOutcomes} fallback="" />}
                </div>
              </section>
            )}

            {course.gradingStructure && (
              <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
                <header className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
                  <ChartBar className="size-4 text-[#F26F21]" />
                  <h3 className="text-[13px] font-bold text-gray-900">Grading structure &amp; pass criteria</h3>
                </header>
                <div className="space-y-2 p-4">
                  {course.gradingStructure.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    if (trimmed.toLowerCase().startsWith('pass criteria')) {
                      return (
                        <div key={i} className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {trimmed}
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-xs leading-relaxed text-gray-700">
                        {trimmed.replace(/^•\s*/, '')}
                      </p>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs">
              <header className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                <h3 className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                  <Link2 className="size-4 text-[#F26F21]" /> Prerequisites &amp; replacements
                </h3>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-gray-600">
                  {course.relations.length}
                </span>
              </header>
              <div className="space-y-3 p-4">
                {!readOnly && <CourseAddRelationForm course={course} isSubmitting={isSubmitting} onAdd={onAddRelation} />}
                <CourseRelationsTable
                  course={course}
                  isSubmitting={isSubmitting}
                  onNavigate={onNavigate}
                  onUpdate={onUpdateRelation}
                  onRemove={onRemoveRelation}
                  readOnly={readOnly}
                />
                <p className="text-[11px] leading-relaxed text-gray-400">
                  Same group = alternatives (OR); different groups = all required (AND). Click any code to inspect that course.
                </p>
              </div>
            </section>

            <CourseReferencedBySection course={course} onNavigate={onNavigate} />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3.5">
            <p className="text-xs text-gray-400">
              Updated {new Date(course.updatedAt).toLocaleDateString()} · Created {new Date(course.createdAt).toLocaleDateString()}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
