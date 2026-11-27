// Course detail modal organized into clean tabs: Overview, Syllabus, Relations, Referenced by.
import { useEffect, useState } from 'react';
import {
  ArrowSquareOut as ExternalLink,
  BookOpenText,
  ChartBar,
  Gauge,
  Link as Link2,
  Scroll as ScrollText,
  Stack,
  TreeStructure as ListTree,
} from '@phosphor-icons/react';
import { Modal } from '../../../../shared/components/ui/Modal';
import { ModalBody, ModalFooter, ModalHeader, modalButtonClass } from '../../../../shared/components/ui/ModalParts';
import { AdminTabBar } from '../AdminTabBar';
import { StatusBadge } from '../StatusBadge';
import { CourseWorkloadCard } from '../../../academic/components/CourseWorkloadCard';
import type { CourseDetail, WorkloadLevel } from '../../../academic/types/course';
import { CourseAddRelationForm, type NewCourseRelation } from './CourseAddRelationForm';
import { CourseRelationsTable } from './CourseRelationsTable';
import {
  CourseDetailSkeleton,
  CourseReferencedBySection,
  CourseStat,
  CourseSyllabusTab,
} from './CourseDetailSections';
import { CourseGradingTab } from './CourseGradingTab';

type DetailTab = 'overview' | 'syllabus' | 'grading' | 'relations' | 'referenced';

interface Props {
  open: boolean;
  course: CourseDetail | null;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onNavigate?: (courseId: string) => void;
  readOnly?: boolean;
  onOverrideWorkload?: (level: WorkloadLevel | 'AUTO') => Promise<unknown>;
  onAddRelation: (rel: NewCourseRelation) => Promise<unknown>;
  onUpdateRelation: (relationId: string, body: { groupNo: number; minimumScore: number | null }) => Promise<unknown>;
  onRemoveRelation: (relationId: string) => Promise<unknown>;
}

const META_CHIP =
  'inline-flex items-center gap-1 rounded-sm bg-surface-page px-2 py-0.5 text-[11px] font-medium text-ink-secondary ring-1 ring-inset ring-line';

export default function CourseDetailModal({
  open,
  course,
  isLoading,
  isSubmitting,
  onClose,
  onNavigate,
  readOnly = false,
  onOverrideWorkload,
  onAddRelation,
  onUpdateRelation,
  onRemoveRelation,
}: Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  useEffect(() => {
    if (open) setActiveTab('overview');
  }, [open, course?.id]);

  if (!open) return null;

  const prereqCount = course ? course.relations.filter((r) => r.kind === 'PREREQUISITE').length : 0;
  const replaceCount = course ? course.relations.filter((r) => r.kind === 'REPLACEMENT').length : 0;

  return (
    <Modal open={open} onClose={onClose} title={course ? `Course detail: ${course.code}` : 'Course detail'} className="max-w-3xl">
      {!course || isLoading ? (
        <CourseDetailSkeleton onClose={onClose} />
      ) : (
        <>
          <ModalHeader
            icon={<BookOpenText aria-hidden />}
            tone="brand"
            title={course.name}
            onClose={onClose}
          >
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-sm bg-ink-primary px-2 py-0.5 font-mono text-xs font-semibold text-surface-page">
                {course.code}
              </span>
              <StatusBadge status={course.status} />
              <span className={META_CHIP}>
                {course.categoryCode} · {course.categoryName}
              </span>
              {course.knowledgeBlock && (
                <span className={META_CHIP}>
                  <Stack className="size-3 text-ink-subtle" /> {course.knowledgeBlock}
                </span>
              )}
              {course.specialization && <span className={META_CHIP}>{course.specialization}</span>}
              {course.materialLink && (
                <a
                  href={course.materialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
                >
                  Course materials <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </ModalHeader>

          <div className="shrink-0 border-b border-line bg-white px-6 py-2.5">
            <AdminTabBar<DetailTab>
              ariaLabel="Course detail sections"
              activeKey={activeTab}
              onChange={setActiveTab}
              tabs={[
                { key: 'overview', label: 'Overview', icon: Gauge },
                { key: 'syllabus', label: 'Syllabus', icon: ScrollText },
                { key: 'grading', label: 'Grading', icon: ChartBar },
                { key: 'relations', label: 'Relations', icon: Link2, count: course.relations.length },
                { key: 'referenced', label: 'Referenced by', icon: ListTree, count: course.referencedBy.length },
              ]}
            />
          </div>

          <ModalBody className="h-[560px] max-h-[68vh] flex-none space-y-4 bg-surface-page/50 text-[13px]">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                  <CourseStat label="Credits" value={String(course.credits)} accent />
                  <CourseStat label="Prerequisites" value={String(prereqCount)} />
                  <CourseStat label="Replacements" value={String(replaceCount)} />
                  <CourseStat label="In curriculums" value={String(course.usedInCurriculumCount)} />
                </div>

                <CourseWorkloadCard
                  workload={course.workload}
                  onOverride={!readOnly ? onOverrideWorkload : undefined}
                  isSaving={isSubmitting}
                />
              </>
            )}

            {activeTab === 'syllabus' && <CourseSyllabusTab course={course} />}

            {activeTab === 'grading' && <CourseGradingTab course={course} />}

            {activeTab === 'relations' && (
              <section className="overflow-hidden rounded-lg border border-line bg-white">
                <header className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
                  <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink-primary">
                    <Link2 className="size-4 text-brand" /> Prerequisites &amp; replacements
                  </h3>
                  <span className="rounded-sm bg-line-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-muted">
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
                  <p className="text-[11px] leading-relaxed text-ink-subtle">
                    Same group = alternatives (OR); different groups = all required (AND). Click any code to inspect that course.
                  </p>
                </div>
              </section>
            )}

            {activeTab === 'referenced' && (
              <CourseReferencedBySection course={course} onNavigate={onNavigate} />
            )}
          </ModalBody>

          <ModalFooter
            start={
              <span className="text-[11px] tabular-nums text-ink-subtle">
                Updated {new Date(course.updatedAt).toLocaleDateString()} · Created{' '}
                {new Date(course.createdAt).toLocaleDateString()}
              </span>
            }
          >
            <button type="button" onClick={onClose} className={modalButtonClass('secondary')}>
              Close
            </button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
