import { WORKFLOW_STEPS } from './content';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">How It Works</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Get started in four simple steps
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            From your first Google sign-in to a complete semester roadmap and advisor check-in.
          </p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((item) => (
            <li
              key={item.step}
              className="relative flex flex-col rounded-xl border border-line bg-surface-sunken p-6"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand-ink">
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
