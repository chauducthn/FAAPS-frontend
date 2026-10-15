import { useState } from 'react';
import axios from 'axios';
import { authService } from '../services/authService';
import type { LoginFormValues } from '../validations/auth.schema';

export const useAuthMutations = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loginAdmin = async (credentials: LoginFormValues) => {
    setGlobalError(null);
    try {
      const user = await authService.loginAdmin(credentials);
      window.location.assign(`/${user.role.toLowerCase()}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setGlobalError('Invalid email or password.');
      } else {
        setGlobalError('Could not sign in. Please try again.');
      }
    }
  };

  const loginGoogle = () => {
    window.location.assign('/oauth2/authorization/google');
  };

  return {
    loginAdmin,
    loginGoogle,
    globalError,
  };
};
