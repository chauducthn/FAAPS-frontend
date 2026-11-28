import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** Text input styling shared by every profile form. Invalid state comes from `aria-invalid`. */
export const profileInputClass =
  'mt-1.5 h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink-primary outline-none ' +
  'transition-colors placeholder:text-ink-subtle hover:border-ink-subtle/50 focus:border-brand focus:ring-2 ' +
  'focus:ring-brand/15 aria-[invalid=true]:border-red-400';

/** Read-only value rendered with the same footprint as an input. */
export const profileReadonlyClass =
  'mt-1.5 flex h-9 items-center gap-2 rounded-md border border-line bg-surface-page px-3 text-[13px] text-ink-muted';

export const profileLabelClass = 'block text-[13px] font-medium text-ink-secondary';

export const profileFieldErrorClass = 'mt-1.5 block text-xs font-normal text-red-600';

interface ProfileCardProps {
  title: string;
  description?: string;
  /** Small status element shown next to the title, such as "Unsaved changes". */
  aside?: ReactNode;
  /** Actions shown right-aligned under the content. */
  footer?: ReactNode;
  as?: 'section' | 'aside';
  className?: string;
  children: ReactNode;
}

/**
 * Settings-style card. When the card is wide (container query) the title column sits beside the content,
 * like a settings page; in a narrow column it stacks. Content is padded by the card, not by children.
 */
export function ProfileCard({ title, description, aside, footer, as = 'section', className, children }: ProfileCardProps) {
  const Tag = as;
  return (
    <Tag className={cn('@container rounded-lg border border-line bg-white', className)}>
      <div className="grid gap-x-8 gap-y-4 p-5 @[46rem]:grid-cols-[13.5rem_minmax(0,1fr)] @[46rem]:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
            {aside}
          </div>
          {description && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>}
        </div>
        <div className="min-w-0">
          {children}
          {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </Tag>
  );
}

const META_LABEL_CLASS =
  'flex min-w-0 items-center gap-2 text-[13px] text-ink-muted [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-subtle';

/** One label / value row for read-only facts inside a ProfileCard (icon is optional and neutral). */
export function ProfileMetaRow({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className={META_LABEL_CLASS}>
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-[13px] font-medium tabular-nums text-ink-primary">{children}</dd>
    </div>
  );
}

/** Grid of ProfileMetaRow items: one column when narrow, two when the card is wide. */
export const profileMetaListClass = 'grid gap-x-8 @[34rem]:grid-cols-2 [&>div]:border-b [&>div]:border-line-soft';
