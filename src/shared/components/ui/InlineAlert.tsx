import type { ReactNode } from 'react';
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

type InlineAlertTone = 'error' | 'info' | 'success';

interface InlineAlertProps {
  tone: InlineAlertTone;
  title?: string;
  children: ReactNode;
  role?: 'alert' | 'status';
  testId?: string;
  onDismiss?: () => void;
}

const TONE_STYLES: Record<InlineAlertTone, { box: string; icon: string }> = {
  error: { box: 'border-red-200 bg-red-50 text-red-800', icon: 'text-red-600' },
  info: { box: 'border-brand/20 bg-brand-soft text-ink-primary', icon: 'text-brand' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: 'text-emerald-600' },
};

const TONE_ICONS = { error: WarningCircle, info: Info, success: CheckCircle };

/** Inline status message (error, info, success) for forms and dialogs. */
export function InlineAlert({ tone, title, children, role, testId, onDismiss }: InlineAlertProps) {
  const Icon = TONE_ICONS[tone];
  const styles = TONE_STYLES[tone];

  return (
    <div
      role={role}
      data-testid={testId}
      className={cn('flex items-start gap-3 rounded-md border px-3.5 py-3 text-left text-sm', styles.box)}
    >
      <Icon className={cn('mt-0.5 size-[18px] shrink-0', styles.icon)} weight="fill" aria-hidden />
      <div className="min-w-0 flex-1 leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded-sm p-0.5 opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
