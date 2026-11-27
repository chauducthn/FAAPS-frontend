import { cn } from '@/shared/lib/utils';
import { SectionHeading } from './SectionHeading';
import { WORKFLOW_STEPS } from './content';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-line bg-surface-page">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionHeading
          align="split"
          eyebrow="How It Works"
          title="Get started in four simple steps"
          description="From your first Google sign-in to a complete semester roadmap and advisor check-in."
          className="mb-16"
        />

        <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <span className="absolute left-0 right-0 top-5 hidden h-px bg-line lg:block" aria-hidden />
          {WORKFLOW_STEPS.map((item, index) => (
            <li key={item.step} className="group relative">
              <span
                className={cn(
                  'relative flex size-10 items-center justify-center rounded-md text-sm font-semibold tabular-nums',
                  'ring-4 ring-surface-page transition-colors duration-300',
                  index === 0
                    ? 'bg-brand text-white'
                    : 'border border-line bg-white text-ink-primary group-hover:border-brand group-hover:text-brand',
                )}
              >
                {item.step}
              </span>
              <h3 className="mt-6 text-lg font-semibold tracking-[-0.01em] text-ink-primary">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
