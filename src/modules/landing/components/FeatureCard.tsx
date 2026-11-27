import { Check } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import type { Feature } from './content';

interface FeatureCardProps extends Feature {
  index: number;
  wide?: boolean;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  category,
  title,
  description,
  highlights,
  index,
  wide = false,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white p-7 transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_24px_50px_-28px_rgb(242_111_33/0.45)] sm:p-8',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn(
            'flex size-10 items-center justify-center rounded-md bg-brand-soft text-brand ring-1 ring-brand/15',
            'transition-colors duration-300 group-hover:bg-brand group-hover:text-white',
          )}>
          <Icon className="size-5" aria-hidden />
        </div>
        <span className="text-xs font-medium tabular-nums text-ink-subtle">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{category}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink-primary">{title}</h3>
      <p className={cn('mt-3 text-sm leading-relaxed text-ink-muted', wide && 'max-w-lg')}>{description}</p>

      <ul className={cn('mt-auto grid gap-2.5 pt-7', wide && 'sm:grid-cols-2 sm:gap-x-6')}>
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-secondary">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm bg-brand-soft">
              <Check className="size-2.5 text-brand" weight="bold" aria-hidden />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
