import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** Floating panel of a toolbar dropdown (Import, Example sheet, ...). Sized to its content. */
export const MENU_PANEL_CLASS =
  'absolute right-0 z-20 mt-1.5 w-max min-w-[13rem] rounded-lg border border-line bg-white p-1 ' +
  'shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] animate-in fade-in-0 zoom-in-[0.98] duration-100 motion-reduce:animate-none';

interface MenuItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}

/** One action inside a toolbar dropdown: neutral icon, label, hover tint. */
export function MenuItem({ icon, children, onClick, className }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-2 text-left text-[13px] font-medium',
        'text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-subtle',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export type ToolbarButtonVariant = 'primary' | 'secondary';

/** Page toolbar actions (Import, Export, Example sheet, Create ...). Dropdown triggers use the same class. */
export function toolbarButtonClass(variant: ToolbarButtonVariant = 'secondary', className?: string): string {
  return cn(
    'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
    'disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0',
    variant === 'primary'
      ? 'bg-brand font-semibold text-white hover:bg-brand-hover'
      : 'border border-line bg-white font-medium text-ink-secondary hover:bg-surface-hover hover:text-ink-primary',
    className,
  );
}
