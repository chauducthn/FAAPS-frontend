import { PLATFORM_PILLARS } from './content';

/** Flat hairline-divided strip that sits directly under the hero. */
export function PlatformHighlights() {
  return (
    <section aria-label="Platform highlights" className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
        {PLATFORM_PILLARS.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex items-start gap-4 bg-white px-4 py-8 sm:px-6">
            <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="text-sm font-semibold tracking-tight text-ink-primary">{label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
