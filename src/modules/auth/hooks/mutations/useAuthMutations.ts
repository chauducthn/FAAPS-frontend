import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/stores/useAuth';
import { authService } from '@/modules/auth/services/authService';
import { loginErrorNotice } from '@/shared/lib/authErrors';
import type { LoginFormValues } from '@/modules/auth/validations/auth.schema';

export const useAuthMutations = () => {
  const { setUser } = useAuth();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormValues) => authService.login(credentials),
    onSuccess: (user) => {
      setUser(user);
      window.location.assign(`/${user.role.toLowerCase()}`);
    },
  });

  const loginGoogle = () => window.location.assign('/oauth2/authorization/google');

  const loginNotice = loginMutation.error ? loginErrorNotice(loginMutation.error) : null;

  return {
    login: (credentials: LoginFormValues) => loginMutation.mutate(credentials),
    isLoginLoading: loginMutation.isPending,
    loginNotice,
    resetLoginError: loginMutation.reset,

    loginGoogle,
  };
};
