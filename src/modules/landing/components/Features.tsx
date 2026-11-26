import { FeatureCard } from './FeatureCard';
import { FEATURES } from './content';

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Core Capabilities</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Everything you need for academic planning and advising
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Designed around real university workflows—from tracking graduation credits to AI-guided study plans and
            proactive advisor support.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
