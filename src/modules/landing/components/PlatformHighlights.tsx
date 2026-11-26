import { PLATFORM_PILLARS } from './content';

export function PlatformHighlights() {
  return (
    <section aria-label="Platform highlights" className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {PLATFORM_PILLARS.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-primary">{label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
