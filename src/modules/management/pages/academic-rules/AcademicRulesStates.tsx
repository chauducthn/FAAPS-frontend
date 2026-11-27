import { WarningCircle as CircleAlert, Plus, ArrowCounterClockwise as RotateCcw, MagnifyingGlassMinus as SearchX } from '@phosphor-icons/react';
import { RuleFormModal } from '../../components/academic-rules';
import { RuleStatusBadge } from '../../components/academic-rules/RuleTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import type { CreateAcademicRuleFormValues } from '../../../academic/validations/academic-rule.schema';

export function AcademicRulesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <CircleAlert className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">Could not load rules</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The rule list failed to load. Check your connection, then try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-ink-primary px-4 py-2 text-xs font-bold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function AcademicRulesEmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <SearchX className="size-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-ink-primary">
          {hasFilters ? 'No rules match your filters' : 'No academic rules yet'}
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
          {hasFilters
            ? 'Try a different keyword, or clear the type / status filters to see the full list.'
            : 'Create the first rule (e.g. Semester GPA warning below 5.0) to start enforcing academic policies.'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-ink-muted transition-colors hover:bg-surface-hover"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#D9601A]"
        >
          <Plus className="size-3.5" /> Create rule
        </button>
      </div>
    </div>
  );
}

export function AcademicRulesModals({
  formOpen,
  formMode,
  editing,
  isSaving,
  onCloseForm,
  onSubmitForm,
  deleting,
  isDeleting,
  onCancelDelete,
  onConfirmDelete,
  bulkDeleteTargets = [],
  isBulkDeleting = false,
  onCancelBulkDelete,
  onConfirmBulkDelete,
}: {
  formOpen: boolean;
  formMode: 'create' | 'edit' | 'view';
  editing: AcademicRule | null;
  isSaving: boolean;
  onCloseForm: () => void;
  onSubmitForm: (values: CreateAcademicRuleFormValues) => Promise<void>;
  deleting: AcademicRule | null;
  isDeleting: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  bulkDeleteTargets?: AcademicRule[];
  isBulkDeleting?: boolean;
  onCancelBulkDelete?: () => void;
  onConfirmBulkDelete?: () => Promise<void>;
}) {
  return (
    <>
      <RuleFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        isLoading={isSaving}
        onClose={onCloseForm}
        onSubmit={onSubmitForm}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete rule?"
        message={deleting ? `Delete "${deleting.ruleName}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        isLoading={isDeleting}
        onCancel={onCancelDelete}
        onConfirm={onConfirmDelete}
      />

      {onCancelBulkDelete && onConfirmBulkDelete && (
        <ConfirmDialog
          open={bulkDeleteTargets.length > 0}
          title={`Delete ${bulkDeleteTargets.length} rule${bulkDeleteTargets.length === 1 ? '' : 's'}?`}
          message={`Delete ${bulkDeleteTargets.length} selected academic rule${bulkDeleteTargets.length === 1 ? '' : 's'}? This cannot be undone.`}
          confirmLabel="Delete selected"
          destructive
          isLoading={isBulkDeleting}
          onCancel={onCancelBulkDelete}
          onConfirm={onConfirmBulkDelete}
        />
      )}

      {deleting && (
        <div className="sr-only" aria-live="polite">
          Deleting <RuleStatusBadge status={deleting.status} />
        </div>
      )}
    </>
  );
}
