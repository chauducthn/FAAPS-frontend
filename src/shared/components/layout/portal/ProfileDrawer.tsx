import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const PANEL_CLASS =
  'absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col border-l border-line bg-surface-page ' +
  'shadow-[-24px_0_64px_-24px_rgb(0_0_0/0.35)] animate-in slide-in-from-right duration-200 ease-out ' +
  'motion-reduce:animate-none';

const CLOSE_CLASS =
  '-mr-1.5 inline-flex size-8 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-line-soft ' +
  'hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

/** Right-hand hub that shows the signed-in user's profile without leaving the current page. */
export function ProfileDrawer({ open, onClose, children }: ProfileDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 animate-in fade-in-0 duration-200 motion-reduce:animate-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside role="dialog" aria-modal="true" aria-label="My profile" className={PANEL_CLASS}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-5">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-primary">My profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className={CLOSE_CLASS}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
