import { FeatureCard } from './FeatureCard';
import { SectionHeading } from './SectionHeading';
import { FEATURES } from './content';

/** Bento layout on a 6-column grid: rows of 4+2, 2+4, and 3+3. */
const BENTO_SPANS = ['lg:col-span-4', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-4', 'lg:col-span-3', 'lg:col-span-3'];
const WIDE_SPANS = new Set(['lg:col-span-4']);
const DESCRIPTION =
  'Designed around real university workflows—from tracking graduation credits to AI-guided study plans and ' +
  'proactive advisor support.';

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-surface-page">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32">
        <SectionHeading
          align="split"
          eyebrow="Core Capabilities"
          title="Everything you need for academic planning and advising"
          description={DESCRIPTION}
          className="mb-14"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURES.map((feature, index) => {
            const span = BENTO_SPANS[index] ?? 'lg:col-span-2';
            return (
              <FeatureCard
                key={feature.title}
                {...feature}
                index={index}
                wide={WIDE_SPANS.has(span)}
                className={span}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
