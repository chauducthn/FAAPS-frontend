import { useState } from 'react';
import { ArrowRight, CheckCircle as CheckCircle2 } from '@phosphor-icons/react';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { useAuth } from '@/modules/auth/stores/useAuth';
import type { RoleCode } from '@/modules/auth/types/auth';
import { ROLE_SHOWCASES } from './content';

export function RoleShowcase() {
  const [activeRole, setActiveRole] = useState<RoleCode>('STUDENT');
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const active = ROLE_SHOWCASES.find((r) => r.id === activeRole) ?? ROLE_SHOWCASES[0];
  const ctaTarget = isAuthenticated && user?.role === active.id ? active.portalPath : '/login';
  const ctaText =
    isAuthenticated && user?.role === active.id ? `Open ${active.label} Portal` : active.ctaLabel;

  return (
    <section id="roles" className="scroll-mt-16 border-y border-line bg-surface-page">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Built for Every Role</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-primary sm:text-3xl">
            Three dedicated portals, one shared academic truth
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Switch between roles below to explore how Students, Advisors, and Administrators collaborate on FAAPS.
          </p>
        </div>

        {/* Role tab buttons */}
        <div
          role="tablist"
          aria-label="FAAPS user roles"
          className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2 rounded-xl border border-line bg-white p-1.5"
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
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink-primary'
                }`}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Active role panel */}
        <div
          role="tabpanel"
          id={`role-panel-${active.id}`}
          aria-labelledby={`role-tab-${active.id}`}
          className="mt-8 grid items-stretch gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-12"
        >
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <span className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-ink">
                {active.label} Workspace
              </span>
              <h3 className="mt-4 text-xl font-bold text-ink-primary sm:text-2xl">{active.tagline}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted sm:text-base">{active.summary}</p>

              <ul className="mt-6 space-y-3">
                {active.capabilities.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <CTAButton to={ctaTarget} size="md">
                {ctaText}
                <ArrowRight className="size-4" aria-hidden />
              </CTAButton>
            </div>
          </div>

          {/* Mini portal preview */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-surface-sunken p-5 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-line pb-3.5">
                <p className="text-sm font-semibold text-ink-primary">{active.previewTitle}</p>
                <span className="rounded-md bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                  {active.previewBadge}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {active.previewMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-line-soft bg-white p-3 text-center"
                  >
                    <p className="text-[11px] text-ink-muted">{metric.label}</p>
                    <p className="mt-1 text-sm font-bold text-ink-primary">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2.5">
                {active.previewItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line-soft bg-white px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-primary">{item.title}</p>
                      <p className="truncate text-xs text-ink-muted">{item.meta}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-surface-page px-2.5 py-1 text-xs font-medium text-ink-secondary">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
