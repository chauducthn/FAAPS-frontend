import { ArrowRight } from '@phosphor-icons/react';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { useAuth } from '@/modules/auth/stores/useAuth';
import campusAerial from '@/assets/hero/campus-4.jpg';
import { cn } from '@/shared/lib/utils';
import { Eyebrow } from './SectionHeading';
import { getPortalLabel, getPortalPath } from './content';

export function CTASection() {
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  return (
    <section id="start" className="scroll-mt-24 bg-white px-4 pb-24 sm:px-6 sm:pb-32">
      <div className={cn(
          'relative isolate mx-auto max-w-6xl overflow-hidden rounded-lg bg-[#0b0b0b]',
          'px-6 py-16 text-white sm:px-14 sm:py-24',
        )}>
        <img
          src={campusAerial}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#0b0b0b] via-[#0b0b0b]/85 to-[#0b0b0b]/40" aria-hidden />

        <div className="max-w-2xl">
          <Eyebrow>Start Your Academic Plan</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            Ready to take control of your study roadmap?
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Sign in with Google or your university email to access your curriculum, AI study roadmap, and assigned
            academic advisor.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {isAuthenticated && user ? (
              <CTAButton to={getPortalPath(user.role)} size="lg" className="rounded-md">
                {getPortalLabel(user.role)}
                <ArrowRight className="size-5" aria-hidden />
              </CTAButton>
            ) : (
              <>
                <CTAButton to="/register" size="lg" className="group rounded-md">
                  Get Started
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </CTAButton>
                <CTAButton to="/login" variant="outlineLight" size="lg" className="rounded-md">
                  Sign in
                </CTAButton>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
