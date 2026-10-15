import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '@/stores/useAuth';
import { authService } from '@/services/authService';
import type { LoginFormValues } from '@/validations/auth.schema';

export const useAuthMutations = () => {
  const { setUser } = useAuth();

  const loginAdminMutation = useMutation({
    mutationFn: (credentials: LoginFormValues) => authService.loginAdmin(credentials),
    onSuccess: (user) => {
      setUser(user);
      window.location.assign(`/${user.role.toLowerCase()}`);
    },
  });

  const loginGoogle = () => window.location.assign('/oauth2/authorization/google');

  const adminError = loginAdminMutation.error;
  const adminErrorMessage = adminError
    ? axios.isAxiosError(adminError) && adminError.response?.status === 401
      ? 'Invalid email or password.'
      : 'Could not sign in. Please try again.'
    : null;

  return {
    loginAdmin: loginAdminMutation.mutateAsync,
    isAdminLoading: loginAdminMutation.isPending,
    adminError: adminErrorMessage,

    loginGoogle,
  };
};
