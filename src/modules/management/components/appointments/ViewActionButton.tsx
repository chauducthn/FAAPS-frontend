import { Eye } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';

/**
 * A compact, bordered "View" action for the table rows.
 *
 * The tooltip is revealed on hover and on keyboard focus, so it is available
 * to both pointer and keyboard users.
 */
export function ViewActionButton({
  onClick,
  label,
}: {
  onClick: () => void;
  /** Names the appointment the action opens, e.g. "Nguyen Van An". */
  label: string;
}) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={`View details for ${label}`}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5',
          'text-[12px] font-semibold text-ink-muted transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:border-brand/50 hover:bg-brand-soft hover:text-brand-ink',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        )}
      >
        <Eye className="size-3.5" aria-hidden />
        View
      </button>

      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full right-0 z-50 mb-1.5 whitespace-nowrap rounded-md',
          'bg-ink-primary px-2 py-1 text-[11px] font-medium text-white shadow-lg',
          'opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        View details for {label}
      </span>
    </span>
  );
}
