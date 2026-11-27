import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

const PANEL_CLASS =
  'relative flex max-h-[min(88vh,820px)] w-full max-w-[708px] flex-col overflow-hidden rounded-lg border border-line ' +
  'bg-white shadow-[0_24px_64px_-16px_rgb(0_0_0/0.35)] animate-in fade-in-0 zoom-in-[0.98] duration-150 ' +
  'motion-reduce:animate-none';

/**
 * Dialog shell: overlay, focus scope and the panel. Compose the content with ModalHeader, ModalBody and
 * ModalFooter from `./ModalParts` so every dialog in the product shares one anatomy.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <div role="dialog" aria-modal="true" aria-label={title} className={cn(PANEL_CLASS, className)}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
