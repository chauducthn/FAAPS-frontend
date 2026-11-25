import { FileSpreadsheet } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';
import { ExampleSheetButton, ImportCheckDialog } from '../ImportCheckDialog';
import { Modal } from '../../../../shared/components/ui/Modal';
import CurriculumFormModal from './CurriculumFormModal';
import ImportPreviewModal from './ImportPreviewModal';
import type { ImportProblem } from '../../utils/importChecks';
import type { CurriculumBulkAction } from '../../utils/curriculumBulk';
import type { CurriculumImportPreview, CurriculumInput, CurriculumItem } from '../../../academic/types/curriculum';

interface Props {
  noun: 'Cohort' | 'Curriculum';
  items: CurriculumItem[];
  formOpen: boolean;
  editing: CurriculumItem | null;
  deleting: CurriculumItem | null;
  bulkAction: CurriculumBulkAction | null;
  selectedCount: number;
  isSubmittingForm: boolean;
  isRemoving: boolean;
  bulkSaving: boolean;
  importChooserOpen: boolean;
  importTargetId: string;
  importFile: File | null;
  importPreview: CurriculumImportPreview | null;
  importProblems: { fileName: string; problems: ImportProblem[] } | null;
  isPreviewingImport: boolean;
  isConfirmingImport: boolean;
  onCloseForm: () => void;
  onSubmitForm: (body: CurriculumInput) => Promise<void>;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  onCancelBulk: () => void;
  onConfirmBulk: () => void;
  onCloseImportChooser: () => void;
  onChangeImportTarget: (id: string) => void;
  onDownloadExample: () => void;
  onPickImportFile: (file: File | undefined) => void;
  onCloseImportPreview: () => void;
  onConfirmImport: () => void;
  onCloseImportProblems: () => void;
}

export function CurriculumManagerModals({
  noun,
  items,
  formOpen,
  editing,
  deleting,
  bulkAction,
  selectedCount,
  isSubmittingForm,
  isRemoving,
  bulkSaving,
  importChooserOpen,
  importTargetId,
  importFile,
  importPreview,
  importProblems,
  isPreviewingImport,
  isConfirmingImport,
  onCloseForm,
  onSubmitForm,
  onCancelDelete,
  onConfirmDelete,
  onCancelBulk,
  onConfirmBulk,
  onCloseImportChooser,
  onChangeImportTarget,
  onDownloadExample,
  onPickImportFile,
  onCloseImportPreview,
  onConfirmImport,
  onCloseImportProblems,
}: Props) {
  return (
    <>
      <CurriculumFormModal
        open={formOpen}
        noun={noun}
        initial={editing}
        isSubmitting={isSubmittingForm}
        onClose={onCloseForm}
        onSubmit={onSubmitForm}
      />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${noun.toLowerCase()}?`}
        message={
          deleting
            ? `Delete ${deleting.majorCode} ${deleting.version} — ${deleting.name}? It cannot be deleted while students, courses or advisor assignments still use it.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isLoading={isRemoving}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      <ConfirmDialog
        open={!!bulkAction}
        title={bulkAction === 'DELETE' ? 'Delete selected curriculums?' : `Set selected curriculums ${bulkAction === 'ACTIVE' ? 'active' : 'inactive'}?`}
        message={`${selectedCount} selected curriculum${selectedCount === 1 ? '' : 's'} will be ${bulkAction === 'DELETE' ? 'deleted if no students or courses use them' : bulkAction === 'ACTIVE' ? 'activated' : 'deactivated'}. Each record is processed separately; failures remain selected.`}
        confirmLabel={bulkAction === 'DELETE' ? 'Delete selected' : 'Apply to selected'}
        destructive={bulkAction === 'DELETE'}
        isLoading={bulkSaving}
        onCancel={onCancelBulk}
        onConfirm={onConfirmBulk}
      />

      <Modal open={importChooserOpen} onClose={onCloseImportChooser} title="Import curriculum from Excel" className="max-w-lg">
        <div className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Import courses into a curriculum</h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose a curriculum on this page. The Excel file maps course codes to semesters; the system checks every row before import.
            </p>
          </div>
          <label className="block text-sm font-semibold text-gray-800">
            Target curriculum
            <select
              value={importTargetId}
              onChange={(event) => onChangeImportTarget(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.majorCode}_{item.version} · {item.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <ExampleSheetButton examples={[{ label: 'Example sheet', download: onDownloadExample }]} />
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#F26F21] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#dc6018]">
              <FileSpreadsheet className="size-4" /> Choose Excel file
              <input
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                disabled={!importTargetId || isPreviewingImport}
                onChange={(event) => {
                  onPickImportFile(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            {isPreviewingImport && <span className="text-xs text-gray-500">Checking file…</span>}
          </div>
          <p className="text-xs text-gray-500">For a new curriculum, create it first, then import its course list.</p>
        </div>
      </Modal>

      <ImportPreviewModal
        open={!!importFile}
        fileName={importFile?.name ?? ''}
        preview={importPreview}
        isConfirming={isConfirmingImport}
        onClose={onCloseImportPreview}
        onConfirm={onConfirmImport}
      />

      <ImportCheckDialog
        open={!!importProblems}
        fileName={importProblems?.fileName ?? ''}
        problems={importProblems?.problems ?? []}
        examples={[{ label: 'Example sheet', download: onDownloadExample }]}
        onClose={onCloseImportProblems}
      />
    </>
  );
}
