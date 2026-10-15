import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import { LoginFormValues } from '../validations/auth.schema';

export const useAuthMutations = () => {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loginAdmin = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      await authService.loginAdmin(data);
      window.location.href = '/admin';
    } catch (error: any) {
      setGlobalError(error.message || 'Invalid credentials.');
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGlobalError(null);
      try {
        await authService.loginGoogle(tokenResponse.access_token);
        window.location.href = '/student';
      } catch (error: any) {
        setGlobalError('Google sign-in error.');
      }
    },
    onError: () => setGlobalError('Google sign-in failed.'),
  });

  return {
    loginAdmin,
    loginGoogle,
    globalError,
  };
};