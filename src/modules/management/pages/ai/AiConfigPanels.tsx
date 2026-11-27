import {
  ArrowCounterClockwise as RotateCcw,
  MagnifyingGlassMinus as SearchX,
  Sparkle,
  WarningCircle as CircleAlert,
} from '@phosphor-icons/react';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { Modal } from '../../../../shared/components/ui/Modal';
import { ModalBody, ModalHeader } from '../../../../shared/components/ui/ModalParts';
import type { AiPreset } from '../../../ai/types/ai-config';

export function AiConfigErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-md bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/15">
        <CircleAlert className="size-5" weight="fill" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-primary">Could not load configurations</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
          The list failed to load. Check your connection and try again — your filters are kept.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-primary px-4 text-xs font-semibold text-surface-page transition-colors hover:bg-ink-secondary"
      >
        <RotateCcw className="size-3.5" /> Retry
      </button>
    </div>
  );
}

export function AiConfigEmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
  onClear?: () => void;
  onCreate?: () => void;
}) {
  return (
    <EmptyState
      className="h-full justify-center"
      icon={hasFilters ? <SearchX aria-hidden /> : <Sparkle aria-hidden />}
      title={hasFilters ? 'No configurations match your filters' : 'No configurations yet'}
      description={
        hasFilters
          ? 'Try a different keyword, or clear the provider / purpose filters.'
          : 'Use New configuration or Presets above to get started.'
      }
    />
  );
}

export function PresetsModal({
  open,
  presets,
  isLoading,
  onClose,
  onSelect,
}: {
  open: boolean;
  presets: AiPreset[];
  isLoading: boolean;
  onClose: () => void;
  onSelect: (preset: AiPreset) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="AI presets" className="max-w-2xl">
      <ModalHeader
        icon={<Sparkle aria-hidden />}
        tone="brand"
        title="AI presets"
        description="Ready-made templates — pick one to prefill the creation form."
        onClose={onClose}
      />
      <ModalBody className="bg-surface-page/50">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-line-soft" />
            ))}
          </div>
        ) : presets.length === 0 ? (
          <p className="py-10 text-center text-xs text-ink-muted">No presets available.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className="flex flex-col gap-1.5 rounded-lg border border-line bg-white p-3.5 text-left transition-colors hover:border-brand/40 hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-ink-primary">{p.label}</span>
                  <span className="shrink-0 rounded-sm bg-line-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-muted">
                    {p.purpose}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{p.description}</p>
                <p className="mt-auto truncate pt-1 font-mono text-[11px] font-medium text-ink-subtle">{p.modelName}</p>
              </button>
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
