import { useEffect } from 'react';
import { useAuth } from '../stores/useAuth';
import { authService } from '@/services/authService';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setCheckingAuth, isCheckingAuth } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res: any = await authService.getMe();
        const userData = res?.data || res;
        if (userData && userData.role) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchUser();
  }, [setUser, setCheckingAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600 animate-pulse">
          Đang xác thực phiên đăng nhập...
        </div>
      </div>
    );
  }

  return <>{children}</>;
};