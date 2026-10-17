import { useLocation } from 'react-router';

/** Where a detail page was opened from, so its Back link returns there. Passed through router `state`. */
export interface BackState {
  backTo: string;
  backLabel: string;
}

export const backState = (backTo: string, backLabel: string): BackState => ({ backTo, backLabel });

/** Back target from the navigation that opened this page, or the given default (direct URL, new tab). */
export function useBackTarget(defaultTo: string, defaultLabel: string) {
  const state = useLocation().state as Partial<BackState> | null;
  return { to: state?.backTo ?? defaultTo, label: state?.backLabel ?? defaultLabel };
}
