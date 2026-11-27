import type { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

export type ModalTone = 'brand' | 'neutral' | 'danger' | 'warning' | 'success';

const ICON_TONE: Record<ModalTone, string> = {
  brand: 'bg-brand-soft text-brand ring-brand/20',
  neutral: 'bg-surface-page text-ink-secondary ring-line',
  danger: 'bg-red-50 text-red-600 ring-red-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
};

interface ModalHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Custom leading visual (for example an avatar) used instead of the icon tile. */
  media?: ReactNode;
  tone?: ModalTone;
  /** Extra content under the title, such as badges. */
  children?: ReactNode;
  /** Compact controls placed before the close button (for example a type picker). */
  actions?: ReactNode;
  onClose?: () => void;
  closeDisabled?: boolean;
  /** Draw the rule under the header. Turn off for header + footer only dialogs. */
  divided?: boolean;
  /** Accessible name and tooltip of the close button when closing has a consequence. */
  closeLabel?: string;
  closeTitle?: string;
}

/** Title row of a dialog: semantic icon tile, title, description and the close button. */
export function ModalHeader({
  title,
  description,
  icon,
  media,
  tone = 'brand',
  children,
  actions,
  onClose,
  closeDisabled = false,
  divided = true,
  closeLabel = 'Close',
  closeTitle,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-start justify-between gap-4 px-6',
        divided ? 'border-b border-line py-4' : 'pb-5 pt-5',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {media}
        {!media && icon && (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset [&_svg]:size-[18px]',
              ICON_TONE[tone],
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 pt-px">
          <h2 className="truncate text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink-primary">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{description}</p>}
          {children}
        </div>
      </div>
      {(actions || onClose) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label={closeLabel}
              title={closeTitle}
              className={cn(
                '-mr-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-subtle',
                'transition-colors hover:bg-line-soft hover:text-ink-primary focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-40',
              )}
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Scrollable content area between the header and the footer. */
export function ModalBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5', className)}>{children}</div>;
}

/** Action row. `start` holds secondary information or actions aligned to the left. */
export function ModalFooter({ children, start, className }: { children: ReactNode; start?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-surface-page px-6 py-3.5 sm:flex-row sm:items-center',
        start ? 'sm:justify-between' : 'sm:justify-end',
        className,
      )}
    >
      {start && <div className="flex min-w-0 flex-wrap items-center gap-2">{start}</div>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}

export type ModalButtonVariant = 'primary' | 'secondary' | 'danger';

const BUTTON_VARIANTS: Record<ModalButtonVariant, string> = {
  primary: 'bg-brand font-semibold text-white hover:bg-brand-hover focus-visible:ring-brand/40',
  secondary: 'border border-line bg-white font-medium text-ink-secondary hover:bg-surface-hover focus-visible:ring-brand/30',
  danger: 'bg-red-600 font-semibold text-white hover:bg-red-700 focus-visible:ring-red-500/40',
};

/** Shared button styling for every dialog action. */
export function modalButtonClass(variant: ModalButtonVariant, className?: string): string {
  return cn(
    'inline-flex h-9 min-w-[5.5rem] items-center justify-center gap-2 rounded-md px-4 text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-55',
    BUTTON_VARIANTS[variant],
    className,
  );
}
