import type { ReactNode } from 'react';
import { X, type Icon as LucideIcon } from '@phosphor-icons/react';

export const assignmentSelectClass =
  'h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink-primary shadow-2xs transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-surface-page disabled:opacity-60';

export const assignmentTextareaClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink-primary placeholder:text-ink-subtle shadow-2xs transition-colors hover:border-ink-subtle/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15';

export const assignmentCancelBtn =
  'h-9 rounded-lg border border-line bg-white px-4 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-hover';

export const assignmentPrimaryBtn =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-55';

export function AssignmentModalHeader({
  icon: Icon,
  title,
  subtitle,
  tone = 'brand',
  onClose,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: 'brand' | 'danger';
  onClose: () => void;
}) {
  const iconTone =
    tone === 'danger'
      ? 'bg-red-50 text-red-600 ring-1 ring-red-200/70'
      : 'bg-brand-soft text-brand ring-1 ring-brand/25';

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft bg-white px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>
          <Icon className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold tracking-tight text-ink-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-line-soft hover:text-ink-secondary"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function AssignmentModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-2.5 border-t border-line-soft bg-surface-page/70 px-6 py-3.5 sm:flex-row">
      {children}
    </div>
  );
}
