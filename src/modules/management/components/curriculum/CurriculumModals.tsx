// src/modules/management/components/curriculum/CurriculumModals.tsx
// Every modal of the curriculum detail page in one place:
// Add courses · Edit curriculum · Import preview · Archive confirmation.

import AddCoursesModal from './AddCoursesModal';
import CurriculumFormModal from './CurriculumFormModal';
import ImportPreviewModal from './ImportPreviewModal';
import { ConfirmDialog } from '../ConfirmDialog';
import type { CurriculumImportPreview, CurriculumInput, CurriculumItem } from '../../../academic/types/curriculum';

interface Props {
  /** The curriculum being edited (drives the edit form). */
  curriculum: CurriculumItem;

  /* ---- Add courses ---- */
  addOpen: boolean;
  addSemester: number;
  /** course id -> semester it is already placed in. */
  placedCourses: Map<string, number>;
  isAddingCourses: boolean;
  onCloseAdd: () => void;
  onSubmitAdd: (body: { courseIds: string[]; semesterNumber: number }) => Promise<unknown>;

  /* ---- Edit curriculum ---- */
  editOpen: boolean;
  isUpdatingStatus: boolean;
  onCloseEdit: () => void;
  onSubmitEdit: (body: CurriculumInput) => Promise<unknown>;

  /* ---- Import preview ---- */
  importOpen: boolean;
  importFileName: string | null;
  importPreview: CurriculumImportPreview | null;
  isConfirmingImport: boolean;
  onCloseImport: () => void;
  onConfirmImport: () => void;

  /* ---- Archive confirmation ---- */
  archiveOpen: boolean;
  onCancelArchive: () => void;
  onConfirmArchive: () => void;
}

export default function CurriculumModals({
  curriculum,
  addOpen,
  addSemester,
  placedCourses,
  isAddingCourses,
  onCloseAdd,
  onSubmitAdd,
  editOpen,
  isUpdatingStatus,
  onCloseEdit,
  onSubmitEdit,
  importOpen,
  importFileName,
  importPreview,
  isConfirmingImport,
  onCloseImport,
  onConfirmImport,
  archiveOpen,
  onCancelArchive,
  onConfirmArchive,
}: Props) {
  return (
    <>
      <AddCoursesModal
        open={addOpen}
        defaultSemester={addSemester}
        placedCourses={placedCourses}
        isSubmitting={isAddingCourses}
        onClose={onCloseAdd}
        onSubmit={onSubmitAdd}
      />

      <CurriculumFormModal
        open={editOpen}
        noun="Curriculum"
        initial={curriculum}
        isSubmitting={isUpdatingStatus}
        onClose={onCloseEdit}
        onSubmit={onSubmitEdit}
      />

      <ImportPreviewModal
        open={importOpen}
        fileName={importFileName ?? 'spreadsheet.xlsx'}
        preview={importPreview}
        isConfirming={isConfirmingImport}
        onClose={onCloseImport}
        onConfirm={onConfirmImport}
      />

      <ConfirmDialog
        open={archiveOpen}
        title="Archive this curriculum?"
        message={`Archive ${curriculum.name}? It stays in the list for reporting but stops being the active version of ${curriculum.majorCode}.`}
        confirmLabel="Archive"
        isLoading={isUpdatingStatus}
        onCancel={onCancelArchive}
        onConfirm={onConfirmArchive}
      />
    </>
  );
}
