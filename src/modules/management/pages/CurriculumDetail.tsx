import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { apiMessage } from '../../../shared/lib/apiMessage';
import CurriculumHeader from '../components/curriculum/CurriculumHeader';
import CurriculumKanban from '../components/curriculum/CurriculumKanban';
import CurriculumModals from '../components/curriculum/CurriculumModals';
import { CourseDetailModal } from '../components/courses';
import { ImportCheckDialog } from '../components/ImportCheckDialog';
import {
  CurriculumBreadcrumb,
  CurriculumErrorState,
  DetailSkeleton,
} from './curriculum/CurriculumDetailStates';
import { useCurriculumDetailState } from './curriculum/useCurriculumDetailState';

export default function CurriculumDetailPage() {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const state = useCurriculumDetailState(id);
  const { curriculum, courses, list, mutations, courseMutations } = state;

  if (curriculum.isLoading) return <DetailSkeleton />;
  if (curriculum.isError || !curriculum.data) {
    return <CurriculumErrorState onBack={() => navigate('/admin/curriculum')} />;
  }

  const data = curriculum.data;
  const isPublished = data.status === 'ACTIVE';

  return (
    <div className="w-full space-y-5">
      <CurriculumBreadcrumb
        label={`${data.majorCode} ${data.version}`}
        onBack={() => navigate('/admin/curriculum')}
      />

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
        totalCredits={state.totalCredits}
        usedSemesters={state.usedSemesters}
        isPublished={isPublished}
        isUpdatingStatus={mutations.isUpdatingStatus}
        isPreviewingImport={mutations.isPreviewingImport}
        onEdit={() => state.setEditing(true)}
        onArchive={() => state.setArchiving(true)}
        onPickFile={state.handlePickFile}
        onDownloadExample={state.downloadExample}
        onPublish={() => {
          mutations.updateStatus({ id, status: 'ACTIVE' }).catch((error) => {
            toast.error(apiMessage(error), { description: 'The curriculum was not published.' });
          });
        }}
      />

      <CurriculumKanban
        semesters={state.semesters}
        isLoading={courses.isLoading}
        isError={courses.isError}
        isEmpty={list.length === 0}
        onAdd={(semester) => state.setPicker({ semester })}
        onMove={state.handleMove}
        onRemove={(course) => mutations.removeCourse({ id, courseId: course.courseId })}
        onDropCourse={state.handleDropCourse}
        onViewCourse={(courseId) => state.setViewingId(courseId)}
        onRetry={() => void courses.refetch()}
        onPickFile={state.handlePickFile}
        onDownloadExample={state.downloadExample}
      />

      <ImportCheckDialog
        open={!!state.importProblems}
        fileName={state.importProblems?.fileName ?? ''}
        problems={state.importProblems?.problems ?? []}
        examples={[{ label: 'Example sheet', download: state.downloadExample }]}
        onClose={() => state.setImportProblems(null)}
      />

      <CurriculumModals
        curriculum={data}
        addOpen={!!state.picker}
        addSemester={state.picker?.semester ?? 1}
        placedCourses={state.placed}
        isAddingCourses={mutations.isAddingCourses}
        onCloseAdd={() => state.setPicker(null)}
        onSubmitAdd={(body) => mutations.addCourses({ id, body })}
        editOpen={state.editing}
        isUpdatingStatus={mutations.isUpdatingStatus}
        onCloseEdit={() => state.setEditing(false)}
        onSubmitEdit={state.handleEdit}
        importOpen={state.importOpen}
        importFileName={state.importFile?.name ?? null}
        importPreview={state.importPreview}
        isConfirmingImport={mutations.isConfirmingImport}
        onCloseImport={() => {
          state.setImportOpen(false);
          state.setImportPreview(null);
          state.setImportFile(null);
        }}
        onConfirmImport={state.handleConfirmImport}
        archiveOpen={state.archiving}
        onCancelArchive={() => state.setArchiving(false)}
        onConfirmArchive={async () => {
          try {
            await mutations.updateStatus({ id, status: 'INACTIVE' });
          } catch {
            // The error toast is shown by the mutation / global handler.
            state.setArchiving(false);
            return;
          }
          state.setArchiving(false);
        }}
      />

      <CourseDetailModal
        open={!!state.viewingId}
        course={state.viewingQuery.data ?? null}
        isSubmitting={
          courseMutations.isAddingRelation ||
          courseMutations.isRemovingRelation ||
          courseMutations.isUpdatingRelation
        }
        onClose={() => state.setViewingId(null)}
        onAddRelation={(rel) => courseMutations.addRelation({ courseId: state.viewingId as string, body: rel })}
        onUpdateRelation={(relationId, body) =>
          courseMutations.updateRelation({ courseId: state.viewingId as string, relationId, body })
        }
        onRemoveRelation={(relationId) =>
          courseMutations.removeRelation({ courseId: state.viewingId as string, relationId })
        }
      />
    </div>
  );
}
