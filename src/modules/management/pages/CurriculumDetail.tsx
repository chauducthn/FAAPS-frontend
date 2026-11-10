// src/modules/management/pages/CurriculumDetail.tsx
// /admin/curriculum/:id - the Academic Roadmap of one curriculum: one column per semester,
// one card per course.
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import CurriculumHeader from '../components/curriculum/CurriculumHeader';
import CurriculumKanban from '../components/curriculum/CurriculumKanban';
import CurriculumModals from '../components/curriculum/CurriculumModals';
import { CourseDetailModal } from '../components/courses';
import { buildRoadmap } from '../../academic/roadmap/buildRoadmap';
import { resolveMilestone } from '../../academic/roadmap/milestones';
import { useCurriculum, useCurriculumCourses } from '../../academic/hooks/queries/useCurriculumsQuery';
import { useAcademicRulesQuery } from '../../academic/hooks/queries/useAcademicRulesQuery';
import { useRoadmapCourseDetails } from '../../academic/hooks/queries/useRoadmapCourseDetails';
import { useCurriculumMutations } from '../../academic/hooks/mutations/useCurriculumMutations';
import { useCourse } from '../../academic/hooks/queries/useCoursesQuery';
import { useCourseMutations } from '../../academic/hooks/mutations/useCourseMutations';
import type { CurriculumImportPreview, CurriculumInput } from '../../academic/types/curriculum';
import type { RoadmapCourse } from '../../academic/types/roadmap';

export default function CurriculumDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const curriculum = useCurriculum(id);
  const courses = useCurriculumCourses(id);
  const {
    update,
    addCourses,
    isAddingCourses,
    updateCourse,
    removeCourse,
    updateStatus,
    isUpdatingStatus,
    previewImport,
    isPreviewingImport,
    confirmImport,
    isConfirmingImport,
  } = useCurriculumMutations('curriculum');
  const [picker, setPicker] = useState<{ semester: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<CurriculumImportPreview | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // The rules carry the milestone thresholds (how many credits an internship needs).
  const rules = useAcademicRulesQuery({ curriculumVersionId: id, size: 100 });

  const list = courses.data ?? [];
  const placed = useMemo(() => new Map(list.map((c) => [c.courseId, c.semesterNumber])), [list]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewingQuery = useCourse(viewingId);
  const {
    addRelation,
    updateRelation,
    removeRelation,
    isAddingRelation,
    isUpdatingRelation,
    isRemovingRelation,
  } = useCourseMutations();

  // Course details add the category line and the prerequisite codes to each card.
  const details = useRoadmapCourseDetails(list.map((c) => c.courseId));

  const semesters = useMemo(() => {
    const withDetails = list.map((course) => {
      const detail = details.get(course.courseId);
      const prerequisites = (detail?.relations ?? [])
        .filter((relation) => relation.kind === 'PREREQUISITE')
        .map((relation) => ({
          code: relation.otherCourseCode,
          minimumScore: relation.minimumScore,
          courseId: relation.otherCourseId,
        }));

      const categoryLabel = detail
        ? `${detail.categoryCode} | ${detail.categoryName}`
        : course.groupName;

      return {
        ...course,
        categoryLabel,
        specialization: detail?.specialization ?? null,
        prerequisites,
        milestone: resolveMilestone(course, rules.data?.items ?? []),
      };
    });
    return buildRoadmap(withDetails);
  }, [list, details, rules.data?.items]);

  const totalCredits = list.reduce((sum, c) => sum + c.credits, 0);
  const usedSemesters = new Set(list.map((c) => c.semesterNumber)).size;

  if (curriculum.isLoading) return <DetailSkeleton />;
  if (curriculum.isError || !curriculum.data) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <CircleAlert className="size-6" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">Could not load this curriculum</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
            The link may be invalid or the record was deleted. Go back to the list and pick another curriculum.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/curriculum')}
          className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
        >
          Back to curriculum list
        </button>
      </div>
    );
  }
  const data = curriculum.data;
  const isPublished = data.status === 'ACTIVE';

  const handleMove = (course: RoadmapCourse, semesterNumber: number) => {
    if (course.semesterNumber === semesterNumber) return;
    void updateCourse({
      id,
      courseId: course.courseId,
      semesterNumber,
    });
  };

  // A card dropped into another column: move the course to that semester.
  const handleDropCourse = (courseId: string, semesterNumber: number) => {
    const course = list.find((c) => c.id === courseId);
    if (!course || course.semesterNumber === semesterNumber) return;

    void updateCourse({
      id,
      courseId: course.courseId,
      semesterNumber,
    });
  };

  const handleEdit = async (body: CurriculumInput) => {
    await update({ id, body });
    setEditing(false);
  };

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    setImportFile(file);
    setImportPreview(null);
    setImportOpen(true);
    try {
      const preview = (await previewImport({ id, file })) as unknown as CurriculumImportPreview;
      setImportPreview(preview);
      if (preview.errorRows > 0) {
        toast.warning(`${preview.errorRows} invalid row(s) found`, {
          description: 'Review them in the preview — valid rows can still be imported.',
        });
      }
    } catch {
      // Error toast comes from the mutation handler; keep the modal open with empty state.
      setImportOpen(false);
      setImportFile(null);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    try {
      await confirmImport({ id, preview: importPreview });
      setImportOpen(false);
      setImportPreview(null);
      setImportFile(null);
      await courses.refetch();
    } catch {
      // Error toast comes from the mutation handler; keep the modal open.
    }
  };

  return (
    <div className="w-full space-y-5">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
          <li>
            <button
              type="button"
              onClick={() => navigate('/admin/curriculum')}
              className="rounded transition-colors hover:text-[#C2410C]"
            >
              Curriculum List
            </button>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3 text-gray-300" />
          </li>
          <li className="font-bold text-gray-900" aria-current="page">
            {data.majorCode} {data.version}
          </li>
        </ol>
      </nav>

      {/* Header card */}
      <CurriculumHeader
        curriculum={{
          name: data.name,
          majorCode: data.majorCode,
          version: data.version,
          status: data.status,
          effectiveFromSemesterCode: data.effectiveFromSemesterCode,
          isCurrent: data.isCurrent,
        }}
        courseCount={list.length}
        totalCredits={totalCredits}
        usedSemesters={usedSemesters}
        isPublished={isPublished}
        isUpdatingStatus={isUpdatingStatus}
        isPreviewingImport={isPreviewingImport}
        onEdit={() => setEditing(true)}
        onArchive={() => setArchiving(true)}
        onPickFile={handlePickFile}
        onPublish={() => {
          updateStatus({ id, status: 'ACTIVE' }).catch(() => undefined);
        }}
      />

      <CurriculumKanban
        semesters={semesters}
        isLoading={courses.isLoading}
        isError={courses.isError}
        isEmpty={list.length === 0}
        onAdd={(semester) => setPicker({ semester })}
        onMove={handleMove}
        onRemove={(course) => removeCourse({ id, courseId: course.courseId })}
        onDropCourse={handleDropCourse}
        onViewCourse={(courseId) => setViewingId(courseId)}
        onRetry={() => void courses.refetch()}
        onPickFile={handlePickFile}
      />

      <CurriculumModals
        curriculum={data}
        addOpen={!!picker}
        addSemester={picker?.semester ?? 1}
        placedCourses={placed}
        isAddingCourses={isAddingCourses}
        onCloseAdd={() => setPicker(null)}
        onSubmitAdd={(body) => addCourses({ id, body })}
        editOpen={editing}
        isUpdatingStatus={isUpdatingStatus}
        onCloseEdit={() => setEditing(false)}
        onSubmitEdit={handleEdit}
        importOpen={importOpen}
        importFileName={importFile?.name ?? null}
        importPreview={importPreview}
        isConfirmingImport={isConfirmingImport}
        onCloseImport={() => {
          setImportOpen(false);
          setImportPreview(null);
          setImportFile(null);
        }}
        onConfirmImport={handleConfirmImport}
        archiveOpen={archiving}
        onCancelArchive={() => setArchiving(false)}
        onConfirmArchive={async () => {
          try {
            await updateStatus({ id, status: 'INACTIVE' });
          } catch {
            // The error toast is shown by the mutation / global handler.
          }
          setArchiving(false);
        }}
      />

      {/* Cross-navigation: course detail from the roadmap (name click or Requires [code]). */}
      <CourseDetailModal
        open={!!viewingId}
        course={viewingQuery.data ?? null}
        isSubmitting={isAddingRelation || isRemovingRelation || isUpdatingRelation}
        onClose={() => setViewingId(null)}
        onAddRelation={(rel) => addRelation({ courseId: viewingId as string, body: rel })}
        onUpdateRelation={(relationId, body) => updateRelation({ courseId: viewingId as string, relationId, body })}
        onRemoveRelation={(relationId) => removeRelation({ courseId: viewingId as string, relationId })}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="w-full space-y-5" aria-label="Loading curriculum">
      <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5">
        <div className="flex items-start gap-3.5">
          <div className="size-12 animate-pulse rounded-2xl bg-orange-100" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2.5 rounded-2xl border border-gray-200/80 bg-white p-3">
            <div className="h-8 animate-pulse rounded-xl bg-orange-50" style={{ animationDelay: `${i * 70}ms` }} />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-20 animate-pulse rounded-xl bg-gray-100" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
            ))}
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] font-medium text-gray-400">Loading roadmap…</p>
    </div>
  );
}
