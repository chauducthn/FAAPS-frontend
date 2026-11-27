import { cn } from '@/shared/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'center' | 'split';
  className?: string;
}

export function Eyebrow({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand',
        className,
      )}
    >
      <span className="h-px w-6 bg-brand" aria-hidden />
      {children}
    </p>
  );
}

/** Shared editorial heading used by every landing section. */
export function SectionHeading({ eyebrow, title, description, align = 'center', className }: SectionHeadingProps) {
  if (align === 'split') {
    return (
      <div className={cn('grid gap-6 lg:grid-cols-12 lg:items-end', className)}>
        <div className="lg:col-span-7">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-primary sm:text-[2.75rem]">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-base leading-relaxed text-ink-muted lg:col-span-5 lg:pb-1.5">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('mx-auto max-w-2xl text-center', className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-primary sm:text-[2.75rem]">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-ink-muted">{description}</p>}
    </div>
  );
}
