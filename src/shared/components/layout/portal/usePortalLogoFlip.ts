import { useCallback, useLayoutEffect, useRef } from 'react';

/** Matches the sidebar width transition (`duration-200` with Tailwind's default ease). */
const SLIDE_OPTIONS: KeyframeAnimationOptions = {
  duration: 200,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Slides the portal logo between the sidebar header and the page header when the sidebar
 * collapses or expands. Only one logo is mounted at a time; both share `logoRef`.
 * Call `capture` right before toggling so the old position can be measured.
 */
export function usePortalLogoFlip(collapsed: boolean) {
  const logoRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<DOMRect | null>(null);

  const capture = useCallback(() => {
    const rect = logoRef.current?.getBoundingClientRect();
    fromRef.current = rect && rect.width > 0 ? rect : null;
  }, []);

  useLayoutEffect(() => {
    const from = fromRef.current;
    fromRef.current = null;
    const el = logoRef.current;
    if (!from || !el || prefersReducedMotion()) return;
    const to = el.getBoundingClientRect();
    const dx = from.left - to.left;
    // The two wrappers differ in height, so align their vertical centers.
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    if (to.width === 0 || (dx === 0 && dy === 0)) return;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], SLIDE_OPTIONS);
  }, [collapsed]);

  return { logoRef, capture };
}
