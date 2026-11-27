import { useEffect, useState } from 'react';

/**
 * Reports whether the window has scrolled beyond a threshold.
 * The threshold may be a number of pixels or a function of the viewport height.
 */
export function useScrolledPast(threshold: number | ((viewportHeight: number) => number)): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const limit = () => (typeof threshold === 'function' ? threshold(window.innerHeight) : threshold);
    const onScroll = () => setPast(window.scrollY > limit());
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [threshold]);

  return past;
}
