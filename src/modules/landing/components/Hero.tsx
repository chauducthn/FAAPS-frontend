import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CTAButton } from '@/shared/components/common/CTAButton';
import { useAuth } from '@/modules/auth/stores/useAuth';
import campus1 from '@/assets/hero/campus-1.jpg';
import campus2 from '@/assets/hero/campus-2.jpg';
import campus3 from '@/assets/hero/campus-3.jpg';
import campus4 from '@/assets/hero/campus-4.jpg';
import { getPortalLabel, getPortalPath } from './content';

const HERO_BACKGROUNDS = [
  { src: campus1, label: 'FPT University Campus Courtyard at Sunset' },
  { src: campus2, label: 'FPT University Hoa Lac Campus & Lake' },
  { src: campus3, label: 'FPT University Green Campus Courtyard' },
  { src: campus4, label: 'FPT University Campus Aerial View' },
];

const SLIDE_INTERVAL_MS = 6000;

export function Hero() {
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="about"
      className="relative scroll-mt-16 overflow-hidden border-b border-line bg-ink-primary"
    >
      {/* Cross-fading campus background images with high-contrast dark scrim */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {HERO_BACKGROUNDS.map((bg, index) => (
          <img
            key={bg.label}
            src={bg.src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ${
              index === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-ink-primary/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
          FPT University · Academic Advising &amp; Planning
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.12]">
          Plan every semester with <span className="text-brand">clarity</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          Track graduation progress, build AI-guided study roadmaps, and connect directly with your
          academic advisor in one place.
        </p>

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {isAuthenticated && user ? (
            <CTAButton to={getPortalPath(user.role)} size="lg">
              {getPortalLabel(user.role)}
              <ArrowRight className="size-5" aria-hidden />
            </CTAButton>
          ) : (
            <>
              <CTAButton to="/register" size="lg">
                Get Started
                <ArrowRight className="size-5" aria-hidden />
              </CTAButton>
              <CTAButton size="lg" variant="outlineLight">
                Sign in
              </CTAButton>
            </>
          )}
        </div>

        {/* Minimal background slide indicator */}
        <div
          className="mt-12 flex items-center justify-center gap-2"
          role="group"
          aria-label="Campus background switcher"
        >
          {HERO_BACKGROUNDS.map((bg, index) => {
            const isActive = index === activeSlide;
            return (
              <button
                key={bg.label}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show background ${index + 1}: ${bg.label}`}
                aria-pressed={isActive}
                className={`h-1.5 rounded-full transition-all ${
                  isActive ? 'w-7 bg-brand' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
