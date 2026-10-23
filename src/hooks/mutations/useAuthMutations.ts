import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/stores/useAuth';
import { authService } from '@/services/authService';
import { adminLoginNotice } from '@/lib/authErrors';
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

  const adminNotice = loginAdminMutation.error ? adminLoginNotice(loginAdminMutation.error) : null;

  return {
    loginAdmin: (credentials: LoginFormValues) => loginAdminMutation.mutate(credentials),
    isAdminLoading: loginAdminMutation.isPending,
    adminNotice,
    resetAdminError: loginAdminMutation.reset,

    loginGoogle,
  };
};
