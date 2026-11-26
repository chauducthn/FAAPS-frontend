import type { CreateMajorDto, Major } from '../../../academic/types/major';
import type { MajorItem } from './MajorTable';
import CreateMajorModal from './CreateMajorModal';
import { ConfirmDialog } from '../ConfirmDialog';
import { ImportCheckDialog, type ExampleSheet } from '../ImportCheckDialog';
import type { ImportProblem } from '../../utils/importChecks';

interface Props {
  isModalOpen: boolean;
  editingMajor: Major | null;
  codeOptions: string[];
  isSaving: boolean;
  deletingMajor: MajorItem | null;
  isBulkDeleteOpen: boolean;
  selectedCount: number;
  isDeleting: boolean;
  importProblems: { fileName: string; problems: ImportProblem[] } | null;
  examples: ExampleSheet[];
  onCloseModal: () => void;
  onSubmitMajor: (data: CreateMajorDto) => void;
  onCancelDeleteSingle: () => void;
  onConfirmDeleteSingle: () => void;
  onCancelBulkDelete: () => void;
  onConfirmBulkDelete: () => void;
  onCloseImportProblems: () => void;
}

export function MajorsDialogs(p: Props) {
  return (
    <>
      <CreateMajorModal
        isOpen={p.isModalOpen}
        onClose={p.onCloseModal}
        onSubmit={p.onSubmitMajor}
        existingCodes={p.codeOptions}
        initialData={
          p.editingMajor
            ? {
                code: p.editingMajor.code,
                name: p.editingMajor.name,
                description: p.editingMajor.description,
                totalCredits: p.editingMajor.totalCredits,
                durationYears: p.editingMajor.durationYears,
                cohort: p.editingMajor.cohort,
                status: p.editingMajor.status,
              }
            : undefined
        }
        isSaving={p.isSaving}
      />

      <ConfirmDialog
        open={!!p.deletingMajor}
        title="Delete major?"
        destructive
        isLoading={p.isDeleting}
        message={
          p.deletingMajor
            ? `Delete ${p.deletingMajor.code} - ${p.deletingMajor.name}? Majors referenced by a curriculum or cohort cannot be deleted.`
            : ''
        }
        confirmLabel="Delete major"
        onCancel={p.onCancelDeleteSingle}
        onConfirm={p.onConfirmDeleteSingle}
      />

      <ConfirmDialog
        open={p.isBulkDeleteOpen}
        title="Delete selected majors?"
        destructive
        isLoading={p.isDeleting}
        message={`Delete ${p.selectedCount} selected major${p.selectedCount === 1 ? '' : 's'}? Majors referenced by a curriculum or cohort cannot be deleted.`}
        confirmLabel={`Delete ${p.selectedCount} major${p.selectedCount === 1 ? '' : 's'}`}
        onCancel={p.onCancelBulkDelete}
        onConfirm={p.onConfirmBulkDelete}
      />

      <ImportCheckDialog
        open={!!p.importProblems}
        fileName={p.importProblems?.fileName ?? ''}
        problems={p.importProblems?.problems ?? []}
        examples={p.examples}
        onClose={p.onCloseImportProblems}
      />
    </>
  );
}
