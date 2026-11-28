import { useState } from 'react';
import { useAuth } from '../../modules/auth/stores/useAuth';
import { authService } from '../../modules/auth/services/authService';

/** Ends the session on the server, clears the local auth store and returns to the landing page. */
export function useSignOut() {
  const clearStore = useAuth((state) => state.logout);
  const [error, setError] = useState(false);

  const signOut = async () => {
    setError(false);
    try {
      await authService.logout();
      clearStore();
      window.location.href = '/';
    } catch (err) {
      console.error('Sign-out error', err);
      setError(true);
    }
  };

  return { signOut, error };
}
