import { Eye } from 'lucide-react';
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
          'inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5',
          'text-[12px] font-semibold text-[#555f6f] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:border-[#f37021]/50 hover:bg-[#fff7ed] hover:text-[#9a3412]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37021]/40',
        )}
      >
        <Eye className="size-3.5" aria-hidden />
        View
      </button>

      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full right-0 z-50 mb-1.5 whitespace-nowrap rounded-md',
          'bg-[#151c27] px-2 py-1 text-[11px] font-medium text-white shadow-lg',
          'opacity-0 transition-opacity duration-150',
          'group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        View details for {label}
      </span>
    </span>
  );
}
