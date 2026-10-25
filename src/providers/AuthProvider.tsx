import { useEffect } from 'react';
import { useAuth } from '../stores/useAuth';
import { authService } from '@/services/authService';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setCheckingAuth, isCheckingAuth } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser(await authService.getMe());
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
          Verifying your session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
