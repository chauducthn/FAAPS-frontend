import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/utils';
import { Eyebrow } from './SectionHeading';
import { FAQ_ITEMS } from './content';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink-primary sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Quick answers about accounts, curriculum tracking, AI advising, and appointments.
            </p>
          </div>
        </div>

        <div className="border-t border-line lg:col-span-8">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question} className="border-b border-line">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={cn(
                        'text-base font-medium tracking-[-0.01em] transition-colors sm:text-lg',
                        isOpen ? 'text-ink-primary' : 'text-ink-secondary group-hover:text-ink-primary',
                      )}
                    >
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md border transition-all duration-300',
                        isOpen
                          ? 'border-brand bg-brand text-white'
                          : 'border-line text-ink-muted group-hover:border-ink-subtle',
                      )}
                    >
                      <Plus
                        className={cn('size-3.5 transition-transform duration-300', isOpen && 'rotate-45')}
                        weight="bold"
                        aria-hidden
                      />
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={cn(
                      'animate-in fade-in slide-in-from-top-1 duration-300',
                      'max-w-2xl pb-7 pr-14 text-[15px] leading-relaxed text-ink-muted',
                    )}
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
