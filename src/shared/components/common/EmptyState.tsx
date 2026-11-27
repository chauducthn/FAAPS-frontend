import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** Shared "nothing to show" block: brand icon tile, title, and a short hint. Text and icon only. */
export function EmptyState({
  icon,
  title,
  description,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      {icon ? (
        <span
          className={
            'flex size-10 items-center justify-center rounded-md bg-brand-soft text-brand ' +
            'ring-1 ring-inset ring-brand/20 [&_svg]:size-5'
          }
        >
          {icon}
        </span>
      ) : null}
      <div>
        <p className="text-sm font-semibold text-ink-primary">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
