import { ArrowRight } from '@phosphor-icons/react';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { getPortalLabel, getPortalPath } from './content';

export function CTASection() {
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  return (
    <section id="start" className="scroll-mt-16 bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl rounded-2xl bg-brand px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Start Your Academic Plan
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to take control of your study roadmap?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
          Sign in with Google or your university email to access your curriculum, AI study roadmap, and
          assigned academic advisor.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {isAuthenticated && user ? (
            <CTAButton to={getPortalPath(user.role)} variant="light" size="lg">
              {getPortalLabel(user.role)}
              <ArrowRight className="size-5" aria-hidden />
            </CTAButton>
          ) : (
            <>
              <CTAButton to="/register" variant="light" size="lg">
                Get Started
                <ArrowRight className="size-5" aria-hidden />
              </CTAButton>
              <CTAButton to="/login" variant="outlineLight" size="lg">
                Sign in
              </CTAButton>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
