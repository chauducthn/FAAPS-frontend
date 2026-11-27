import { CourseDetailModal, CourseFormModal, CourseImportPreviewModal } from '../../components/courses';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ImportCheckDialog, type ExampleSheet } from '../../components/ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';
import type {
  CourseCategory,
  CourseDetail,
  CourseImportPreview,
  CourseStatus,
  CourseSummary,
  WorkloadLevel,
  AddCourseRelationDto,
  UpdateCourseRelationDto,
} from '../../../academic/types/course';
import type { CreateCourseFormValues } from '../../../academic/validations/course.schema';

export function CoursesModals({
  formOpen,
  editing,
  editingInitial,
  isLoadingInitial,
  categories,
  isSavingCourse,
  onCloseForm,
  onSubmitForm,
  viewingId,
  viewingCourse,
  isLoadingViewing,
  isSubmittingRelation,
  onCloseViewing,
  onNavigateViewing,
  onOverrideWorkload,
  onAddRelation,
  onUpdateRelation,
  onRemoveRelation,
  importOpen,
  importFileName,
  importPreview,
  importing,
  onCloseImport,
  onConfirmImport,
  onDownloadErrors,
  deleting,
  isRemoving,
  onCancelDelete,
  onConfirmDelete,
  importProblems,
  examples,
  onCloseImportProblems,
  bulkStatus,
  bulkStatusSaving,
  onCancelBulkStatus,
  onConfirmBulkStatus,
  bulkDeleting,
  bulkTargets,
  isBulkRemoving,
  onCancelBulkDelete,
  onConfirmBulkDelete,
}: {
  formOpen: boolean;
  editing: CourseSummary | null;
  editingInitial: CourseDetail | null;
  isLoadingInitial: boolean;
  categories: CourseCategory[];
  isSavingCourse: boolean;
  onCloseForm: () => void;
  onSubmitForm: (values: CreateCourseFormValues) => Promise<void>;
  viewingId: string | null;
  viewingCourse: CourseDetail | null;
  isLoadingViewing: boolean;
  isSubmittingRelation: boolean;
  onCloseViewing: () => void;
  onNavigateViewing: (id: string) => void;
  onOverrideWorkload?: (level: WorkloadLevel | 'AUTO') => Promise<unknown>;
  onAddRelation: (rel: AddCourseRelationDto) => Promise<unknown>;
  onUpdateRelation: (relationId: string, body: UpdateCourseRelationDto) => Promise<unknown>;
  onRemoveRelation: (relationId: string) => Promise<unknown>;
  importOpen: boolean;
  importFileName: string;
  importPreview: CourseImportPreview | null;
  importing: boolean;
  onCloseImport: () => void;
  onConfirmImport: () => void;
  onDownloadErrors: () => void;
  deleting: CourseSummary | null;
  isRemoving: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  importProblems: ImportProblem[];
  examples: ExampleSheet[];
  onCloseImportProblems: () => void;
  bulkStatus: { rows: CourseSummary[]; status: CourseStatus } | null;
  bulkStatusSaving: boolean;
  onCancelBulkStatus: () => void;
  onConfirmBulkStatus: () => void;
  bulkDeleting: boolean;
  bulkTargets: CourseSummary[];
  isBulkRemoving: boolean;
  onCancelBulkDelete: () => void;
  onConfirmBulkDelete: () => Promise<void>;
}) {
  return (
    <>
      <CourseFormModal
        open={formOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editingInitial}
        isLoadingInitial={isLoadingInitial}
        categories={categories}
        isLoading={isSavingCourse}
        onClose={onCloseForm}
        onSubmit={onSubmitForm}
      />

      <CourseDetailModal
        open={!!viewingId}
        course={viewingCourse}
        isLoading={isLoadingViewing}
        isSubmitting={isSubmittingRelation}
        onClose={onCloseViewing}
        onNavigate={onNavigateViewing}
        onOverrideWorkload={onOverrideWorkload}
        onAddRelation={onAddRelation}
        onUpdateRelation={onUpdateRelation}
        onRemoveRelation={onRemoveRelation}
      />

      <CourseImportPreviewModal
        open={importOpen}
        fileName={importFileName}
        preview={importPreview}
        isConfirming={importing && !!importPreview}
        isReading={importing && !importPreview}
        onClose={onCloseImport}
        onConfirm={onConfirmImport}
      />
      {importPreview?.errorRows ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="text-[11px] font-semibold text-red-600 underline hover:text-red-700"
            onClick={onDownloadErrors}
          >
            Download error report (CSV)
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={!!deleting}
        title="Delete course?"
        message={deleting ? `Delete ${deleting.code} - ${deleting.name}? Courses in curricula must be detached first.` : ''}
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      <ImportCheckDialog
        open={importProblems.length > 0}
        fileName={importFileName}
        problems={importProblems}
        examples={examples}
        onClose={onCloseImportProblems}
      />

      <ConfirmDialog
        open={!!bulkStatus}
        title={bulkStatus?.status === 'ACTIVE' ? 'Set selected courses active?' : 'Set selected courses inactive?'}
        message={
          bulkStatus
            ? `Change ${bulkStatus.rows.length} selected course${bulkStatus.rows.length === 1 ? '' : 's'} to ${
                bulkStatus.status === 'ACTIVE' ? 'Active' : 'Inactive'
              }: ${bulkStatus.rows.map((c) => c.code).join(', ')}.`
            : ''
        }
        confirmLabel={bulkStatus?.status === 'ACTIVE' ? 'Set active' : 'Set inactive'}
        isLoading={bulkStatusSaving}
        onCancel={onCancelBulkStatus}
        onConfirm={onConfirmBulkStatus}
      />

      <ConfirmDialog
        open={bulkDeleting}
        title="Delete selected courses?"
        message={`Delete ${bulkTargets.length} selected course${bulkTargets.length === 1 ? '' : 's'}? Courses used in a curriculum or required by another course cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isLoading={isBulkRemoving}
        onCancel={onCancelBulkDelete}
        onConfirm={onConfirmBulkDelete}
      />
    </>
  );
}
