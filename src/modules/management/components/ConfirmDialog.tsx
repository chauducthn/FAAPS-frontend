import type { ReactNode } from 'react';
import { CheckCircle, SpinnerGap, Warning } from '@phosphor-icons/react';
import { Modal } from '../../../shared/components/ui/Modal';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  modalButtonClass,
  type ModalTone,
} from '../../../shared/components/ui/ModalParts';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  tone?: ModalTone;
  icon?: ReactNode;
  targetLabel?: string;
  targetHeading?: string;
  metaHeading?: string;
  metaValue?: ReactNode;
  note?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive,
  tone,
  icon,
  targetLabel,
  targetHeading = 'Target',
  metaHeading,
  metaValue,
  note,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const resolvedTone: ModalTone = tone ?? (destructive ? 'danger' : 'brand');
  const resolvedIcon = icon ?? (destructive ? <Warning /> : <CheckCircle />);
  const hasSummary = !!targetLabel || !!metaValue;
  const hasBody = hasSummary || !!note;

  return (
    <Modal open={open} onClose={isLoading ? () => {} : onCancel} title={title} className="max-w-md">
      <ModalHeader
        title={title}
        description={message}
        icon={resolvedIcon}
        tone={resolvedTone}
        onClose={onCancel}
        closeDisabled={isLoading}
        divided={hasBody}
      />
      {hasBody && (
        <ModalBody className="flex flex-col gap-3">
          {hasSummary && (
            <div className="divide-y divide-line-soft overflow-hidden rounded-lg bg-surface-page ring-1 ring-inset ring-line-soft">
              {targetLabel && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                    {targetHeading}
                  </span>
                  <span className="min-w-0 truncate text-[13px] font-semibold text-ink-primary">
                    {targetLabel}
                  </span>
                </div>
              )}
              {metaValue && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                    {metaHeading}
                  </span>
                  <span className="text-[12.5px] font-semibold text-ink-primary">{metaValue}</span>
                </div>
              )}
            </div>
          )}
          {note && <p className="text-xs leading-relaxed text-ink-muted">{note}</p>}
        </ModalBody>
      )}
      <ModalFooter>
        <button type="button" onClick={onCancel} disabled={isLoading} className={modalButtonClass('secondary')}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={modalButtonClass(destructive ? 'danger' : 'primary')}
        >
          {isLoading && <SpinnerGap className="size-4 animate-spin" aria-hidden />}
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
}
