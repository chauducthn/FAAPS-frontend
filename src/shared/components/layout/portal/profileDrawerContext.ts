import { createContext, useContext } from 'react';

/** Lets any page inside a portal open the signed-in user's profile drawer. */
export const ProfileDrawerContext = createContext<() => void>(() => undefined);

/** Returns a function that opens the profile drawer of the current portal. */
export function useOpenProfile(): () => void {
  return useContext(ProfileDrawerContext);
}

/** Router state that asks the portal shell to open the profile drawer on arrival (used by the old profile URLs). */
export const OPEN_PROFILE_STATE = { openProfile: true } as const;

export function wantsProfileOpen(state: unknown): boolean {
  return typeof state === 'object' && state !== null && (state as { openProfile?: unknown }).openProfile === true;
}
