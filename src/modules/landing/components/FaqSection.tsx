import { useState } from 'react';
import { CaretDown as ChevronDown } from '@phosphor-icons/react';
import { FAQ_ITEMS } from './content';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-16 border-t border-line bg-surface-page">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Quick answers about accounts, curriculum tracking, AI advising, and appointments.
          </p>
        </div>

        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-ink-primary transition-colors hover:bg-surface-hover sm:text-base"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-ink-muted transition-transform ${
                        isOpen ? 'rotate-180 text-brand' : ''
                      }`}
                      aria-hidden
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-5 text-sm leading-relaxed text-ink-muted"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
