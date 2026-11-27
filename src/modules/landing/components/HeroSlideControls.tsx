import type { CSSProperties } from 'react';
import { cn } from '@/shared/lib/utils';
import campus1 from '@/assets/hero/campus-1.jpg';
import campus2 from '@/assets/hero/campus-2.jpg';
import campus3 from '@/assets/hero/campus-3.jpg';
import campus4 from '@/assets/hero/campus-4.jpg';

/** The first slide is the auth page photo, so the hero and the auth photo morph into the same picture. */
export const HERO_BACKGROUNDS = [
  { src: campus2, label: 'FPT University Hoa Lac Campus & Lake' },
  { src: campus1, label: 'FPT University Campus Courtyard at Sunset' },
  { src: campus3, label: 'FPT University Green Campus Courtyard' },
  { src: campus4, label: 'FPT University Campus Aerial View' },
];

interface HeroSlideControlsProps {
  activeSlide: number;
  onSelect: (index: number) => void;
  intro: boolean;
}

const introDelay = (ms: number) => ({ '--intro-delay': `${ms}ms` }) as CSSProperties;

export function HeroSlideControls({ activeSlide, onSelect, intro }: HeroSlideControlsProps) {
  const current = HERO_BACKGROUNDS[activeSlide];
  return (
    <div className="relative mt-16 pt-5">
      <span
        aria-hidden
        className={cn('absolute inset-x-0 top-0 h-px origin-left bg-white/15', intro && 'landing-intro-rule')}
        style={introDelay(900)}
      />
      <div
        className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', intro && 'landing-intro-fade')}
        style={introDelay(1200)}
      >
        <p className="text-xs text-white/55">
          <span className="font-semibold text-white tabular-nums">{String(activeSlide + 1).padStart(2, '0')}</span>
          <span className="mx-1.5">/</span>
          <span className="tabular-nums">{String(HERO_BACKGROUNDS.length).padStart(2, '0')}</span>
          <span className="ml-3 hidden sm:inline">{current.label}</span>
        </p>
        <div className="flex items-center gap-2" role="group" aria-label="Campus background switcher">
          {HERO_BACKGROUNDS.map((bg, index) => {
            const isActive = index === activeSlide;
            return (
              <button
                key={bg.label}
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`Show background ${index + 1}: ${bg.label}`}
                aria-pressed={isActive}
                className="group relative h-6 w-12 sm:w-16"
              >
                <span
                  className={cn(
                    'absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden bg-white/25',
                    'transition-colors group-hover:bg-white/45',
                  )}
                >
                  {isActive && <span key={activeSlide} className="landing-progress absolute inset-0 bg-brand" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { introDelay };
