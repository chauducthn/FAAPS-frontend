import { Check } from '@phosphor-icons/react';
import type { Feature } from './content';

export function FeatureCard({ icon: Icon, category, title, description, highlights }: Feature) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-white p-6 transition-colors hover:border-brand/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden />
        </div>
        <span className="rounded-full bg-surface-page px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {category}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-ink-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>

      <ul className="mt-4 space-y-2 border-t border-line-soft pt-4">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-ink-secondary">
            <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
