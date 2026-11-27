import { useState } from 'react';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { useAuth } from '@/modules/auth/stores/useAuth';
import type { RoleCode } from '@/modules/auth/types/auth';
import { cn } from '@/shared/lib/utils';
import { RolePreview } from './RolePreview';
import { SectionHeading } from './SectionHeading';
import { ROLE_SHOWCASES } from './content';

export function RoleShowcase() {
  const [activeRole, setActiveRole] = useState<RoleCode>('STUDENT');
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const active = ROLE_SHOWCASES.find((r) => r.id === activeRole) ?? ROLE_SHOWCASES[0];
  const ownsActivePortal = isAuthenticated && user?.role === active.id;
  const ctaTarget = ownsActivePortal ? active.portalPath : '/login';
  const ctaText = ownsActivePortal ? `Open ${active.label} Portal` : active.ctaLabel;

  return (
    <section id="roles" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <SectionHeading
          eyebrow="Built for Every Role"
          title="Three dedicated portals, one shared academic truth"
          description="Switch between roles below to explore how Students, Advisors, and Administrators collaborate on FAAPS."
        />

        <div
          role="tablist"
          aria-label="FAAPS user roles"
          className="mx-auto mt-10 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-lg border border-line bg-surface-page p-1"
        >
          {ROLE_SHOWCASES.map(({ id, label, icon: Icon }) => {
            const isSelected = id === active.id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`role-tab-${id}`}
                aria-selected={isSelected}
                aria-controls={`role-panel-${id}`}
                onClick={() => setActiveRole(id)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-5',
                  isSelected
                    ? 'bg-white text-ink-primary shadow-[0_2px_8px_-2px_rgb(0_0_0/0.15)] ring-1 ring-line'
                    : 'text-ink-muted hover:text-ink-primary',
                )}
              >
                <Icon className={cn('size-4 shrink-0', isSelected && 'text-brand')} aria-hidden />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div
          key={active.id}
          role="tabpanel"
          id={`role-panel-${active.id}`}
          aria-labelledby={`role-tab-${active.id}`}
          className="mt-12 grid animate-in items-center gap-10 fade-in duration-500 lg:grid-cols-12 lg:gap-14"
        >
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{active.label} Workspace</p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em] text-ink-primary sm:text-3xl">
              {active.tagline}
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{active.summary}</p>

            <ul className="mt-7 space-y-3.5">
              {active.capabilities.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-secondary">
                  <CheckCircle className="mt-0.5 size-[18px] shrink-0 text-brand" weight="fill" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <CTAButton to={ctaTarget} size="md" className="group mt-9 rounded-md">
              {ctaText}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </CTAButton>
          </div>

          <div className="lg:col-span-7">
            <RolePreview
              previewTitle={active.previewTitle}
              previewBadge={active.previewBadge}
              previewMetrics={active.previewMetrics}
              previewItems={active.previewItems}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
