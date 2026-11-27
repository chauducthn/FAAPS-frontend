import {
  WarningCircle as CircleAlert,
  ArrowCounterClockwise as RotateCcw,
  MagnifyingGlassMinus as SearchX,
  ShieldCheck,
} from '@phosphor-icons/react';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { RuleFormModal } from '../../components/academic-rules';
import { RuleStatusBadge } from '../../components/academic-rules/RuleTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { AcademicRule } from '../../../academic/types/academic-rule';
import type { CreateAcademicRuleFormValues } from '../../../academic/validations/academic-rule.schema';

export function AcademicRulesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-md bg-red-50 text-red-600">
        <CircleAlert className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-primary">Could not load rules</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The rule list failed to load. Check your connection, then try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-primary px-3.5 text-[13px] font-semibold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-4" /> Retry
      </button>
    </div>
  );
}

export function AcademicRulesEmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
  onClear?: () => void;
  onCreate?: () => void;
}) {
  return (
    <EmptyState
      className="h-full justify-center"
      icon={hasFilters ? <SearchX aria-hidden /> : <ShieldCheck aria-hidden />}
      title={hasFilters ? 'No rules match your filters' : 'No academic rules yet'}
      description={
        hasFilters
          ? 'Try a different keyword, or clear the type / status filters to see the full list.'
          : 'Use Create rule or Load FLM defaults above to start configuring academic policies.'
      }
    />
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
