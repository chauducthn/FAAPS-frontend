import type { ReactNode } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import {
  CheckCircle,
  Info,
  SpinnerGap,
  Warning,
  XCircle,
} from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { useTheme } from '@/shared/stores/useTheme';

function ToastIconTile({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset',
        tone,
      )}
    >
      {children}
    </span>
  );
}

const TOAST_CLASS = cn(
  'group toast pointer-events-auto relative flex w-full items-start justify-between gap-3',
  'overflow-visible !rounded-lg !border !border-line !bg-popover !py-3 !pl-3.5 !pr-11',
  'font-sans text-sm !text-ink-primary',
  '!shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:!shadow-[0_12px_32px_rgba(0,0,0,0.45)]',
  'transition-all',
  'data-[swipe=cancel]:translate-x-0',
  'data-[swipe=end]:translate-x-[var(--toast-swipe-end-x)]',
  'data-[swipe=move]:translate-x-[var(--toast-swipe-movement-x)]',
  'data-[swipe=move]:transition-none',
  'data-[type=success]:!border-emerald-200 dark:data-[type=success]:!border-emerald-500/35',
  'data-[type=error]:!border-red-200/90 dark:data-[type=error]:!border-red-500/35',
  'data-[type=warning]:!border-amber-200/90 dark:data-[type=warning]:!border-amber-500/35',
  'data-[type=loading]:!border-brand/30',
);

const ACTION_BTN_CLASS = cn(
  'inline-flex items-center justify-center !rounded-md !bg-brand !px-2.5 !py-1.5',
  '!text-xs !font-semibold !text-white transition-colors hover:!bg-brand-hover',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
);

const CANCEL_BTN_CLASS = cn(
  'inline-flex items-center justify-center !rounded-md !border !border-line !bg-popover',
  '!px-2.5 !py-1.5 !text-xs !font-semibold !text-ink-secondary transition-colors',
  'hover:!bg-surface-hover focus-visible:outline-none',
);

const CLOSE_BTN_CLASS = cn(
  '!absolute !right-2.5 !top-3 !left-auto !h-7 !w-7 !translate-x-0 !translate-y-0 !transform-none',
  'inline-flex items-center justify-center !rounded-md !border-0 !bg-transparent !shadow-none',
  '!text-ink-subtle transition-colors hover:!bg-line-soft hover:!text-ink-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
);

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useTheme((s) => s.theme);

  return (
    <Sonner
      theme={theme}
      position="top-right"
      duration={4000}
      visibleToasts={4}
      closeButton={true}
      richColors={false}
      expand={true}
      gap={10}
      icons={{
        success: (
          <ToastIconTile tone="bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:ring-emerald-400/25">
            <CheckCircle className="size-4" weight="fill" aria-hidden />
          </ToastIconTile>
        ),
        info: (
          <ToastIconTile tone="bg-surface-page text-ink-secondary ring-line">
            <Info className="size-4" weight="fill" aria-hidden />
          </ToastIconTile>
        ),
        warning: (
          <ToastIconTile tone="bg-amber-50 text-amber-700 ring-amber-600/15 dark:ring-amber-400/25">
            <Warning className="size-4" weight="fill" aria-hidden />
          </ToastIconTile>
        ),
        error: (
          <ToastIconTile tone="bg-red-50 text-red-700 ring-red-600/15 dark:ring-red-400/25">
            <XCircle className="size-4" weight="fill" aria-hidden />
          </ToastIconTile>
        ),
        loading: (
          <ToastIconTile tone="bg-brand-soft text-brand ring-brand/20">
            <SpinnerGap className="size-4 animate-spin" aria-hidden />
          </ToastIconTile>
        ),
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: TOAST_CLASS,
          icon: '!m-0 !h-7 !w-7 shrink-0 flex items-center justify-center',
          content: 'min-w-0 flex-1 py-0.5',
          title: '!text-[13px] !font-semibold !leading-snug !tracking-[-0.01em] !text-ink-primary',
          description: '!mt-0.5 !text-[12px] !leading-relaxed !text-ink-muted',
          actionButton: ACTION_BTN_CLASS,
          cancelButton: CANCEL_BTN_CLASS,
          closeButton: CLOSE_BTN_CLASS,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
