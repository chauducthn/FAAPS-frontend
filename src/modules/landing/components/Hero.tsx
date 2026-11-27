import { useEffect, useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { cn } from '@/shared/lib/utils';
import { useScrolledPast } from '../hooks/useScrolledPast';
import { HERO_BACKGROUNDS, HeroSlideControls, introDelay } from './HeroSlideControls';
import { Eyebrow } from './SectionHeading';
import { getPortalLabel, getPortalPath } from './content';

const SLIDE_INTERVAL_MS = 6000;
const HEADLINE_LINES = ['Plan every ', 'semester with '];
/** The hero photo and copy only take part in the route morph while the hero is still mostly on screen. */
const morphLimit = (viewportHeight: number) => viewportHeight * 0.5;

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface HeroBackdropProps {
  activeSlide: number;
  intro: boolean;
  morphs: boolean;
}

function HeroBackdrop({ activeSlide, intro, morphs }: HeroBackdropProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        intro && 'landing-intro-media',
        morphs && '[view-transition-name:campus-frame] [view-transition-class:hero-photo]',
      )}
      aria-hidden="true"
    >
      {HERO_BACKGROUNDS.map((bg, index) => (
        <div
          key={bg.label}
          className={cn(
            'absolute inset-0 transition-opacity duration-[1400ms] ease-out',
            index === activeSlide ? 'opacity-100' : 'opacity-0',
          )}
        >
          <img
            src={bg.src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            className={cn(
              'size-full object-cover object-center transition-transform duration-[7000ms] ease-out',
              index === activeSlide ? 'scale-100' : 'scale-105',
            )}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[78%] bg-linear-to-t from-[#0b0b0b] via-[#0b0b0b]/75 to-transparent" />
    </div>
  );
}

function HeadlineLine({ children, delay, intro }: { children: React.ReactNode; delay: number; intro: boolean }) {
  return (
    <span className={cn('block', intro && 'landing-intro-line')}>
      <span className="block" style={introDelay(delay)}>
        {children}
      </span>
    </span>
  );
}

export function Hero({ intro = false }: { intro?: boolean }) {
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const [activeSlide, setActiveSlide] = useState(0);
  const morphs = !useScrolledPast(morphLimit);
  const fade = intro ? 'landing-intro-fade' : undefined;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [activeSlide]);

  return (
    <section id="about" className="relative isolate scroll-mt-20 overflow-hidden bg-[#0b0b0b] text-white">
      <HeroBackdrop activeSlide={activeSlide} intro={intro} morphs={morphs} />

      <div
        className={cn(
          'mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-8 pt-32 sm:px-6',
          morphs && '[view-transition-name:hero-copy]',
        )}
      >
        <div className={fade} style={introDelay(250)}>
          <Eyebrow className="text-white/70">FPT University · Academic Advising &amp; Planning</Eyebrow>
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1
            className={cn(
              'text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.045em]',
              'sm:text-7xl lg:col-span-8 lg:text-[5.75rem]',
            )}
          >
            {HEADLINE_LINES.map((line, index) => (
              <HeadlineLine key={line} delay={350 + index * 120} intro={intro}>
                {line}
              </HeadlineLine>
            ))}
            <HeadlineLine delay={590} intro={intro}>
              <span className="text-brand">clarity</span>.
            </HeadlineLine>
          </h1>

          <div className={cn('lg:col-span-4 lg:pb-2', fade)} style={introDelay(800)}>
            <p className="text-base leading-relaxed text-white/75">
              Track graduation progress, build AI-guided study roadmaps, and connect directly with your academic
              advisor in one place.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
                  <CTAButton size="lg" variant="outlineLight" className="rounded-md">
                    Sign in
                  </CTAButton>
                </>
              )}
            </div>
          </div>
        </div>

        <HeroSlideControls activeSlide={activeSlide} onSelect={setActiveSlide} intro={intro} />
      </div>
    </section>
  );
}
