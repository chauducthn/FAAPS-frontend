import { useState } from 'react';
import { useLocation } from 'react-router';

/** React Router gives the entry a page load starts on this key. */
const INITIAL_LOCATION_KEY = 'default';

/**
 * `intro`: the landing page is the first page of the visit, so the full entrance plays.
 * `return`: the visitor came back from another page (usually auth). The hero photo has
 * already morphed into place, so only the header and copy enter, on a shorter schedule.
 */
export type LandingEntrance = 'intro' | 'return';

/** Read once on mount: in-page hash links must not switch the entrance mid-animation. */
export function useLandingEntrance(): LandingEntrance {
  const { key } = useLocation();
  const [entrance] = useState<LandingEntrance>(() => (key === INITIAL_LOCATION_KEY ? 'intro' : 'return'));
  return entrance;
}
