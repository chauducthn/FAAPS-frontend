import { useMutation } from '@tanstack/react-query';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/stores/useAuth';
import { authService } from '@/services/authService';
import { LoginFormValues } from '@/validations/auth.schema';

export const useAuthMutations = () => {
  const { setUser } = useAuth();

  const loginAdminMutation = useMutation({
    mutationFn: (data: LoginFormValues) => authService.loginAdmin(data),
    onSuccess: async (res: any) => {
      try {
        const userData = res?.data || res;
        if (userData && userData.role) {
          setUser(userData);
          window.location.href = `/${userData.role.toLowerCase()}`;
        } else {
          const meRes: any = await authService.getMe();
          const meUserData = meRes?.data || meRes;
          setUser(meUserData);
          window.location.href = `/${meUserData.role.toLowerCase()}`;
        }
      } catch (error) {
        console.error('Lỗi sau khi đăng nhập Admin:', error);
      }
    },
  });

  const loginGoogleMutation = useMutation({
    mutationFn: (accessToken: string) => authService.loginGoogle(accessToken),
    onSuccess: async (res: any) => {
      try {
        const userData = res?.data || res;
        if (userData && userData.role) {
          setUser(userData);
          window.location.href = `/${userData.role.toLowerCase()}`;
        } else {
          const meRes: any = await authService.getMe();
          const meUserData = meRes?.data || meRes;
          setUser(meUserData);
          window.location.href = `/${meUserData.role.toLowerCase()}`;
        }
      } catch (error) {
        console.error('Lỗi sau khi đăng nhập Google:', error);
      }
    },
  });

  const loginGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      loginGoogleMutation.mutate(tokenResponse.access_token);
    },
  });

  return {
    loginAdmin: loginAdminMutation.mutate,
    isAdminLoading: loginAdminMutation.isPending,
    adminError: loginAdminMutation.error?.message || null,

    loginGoogle,
    isGoogleLoading: loginGoogleMutation.isPending,
  };
};