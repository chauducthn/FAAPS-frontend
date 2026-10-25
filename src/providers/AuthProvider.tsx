import { useEffect } from 'react';
import { useAuth } from '../stores/useAuth';
// import { authService } from '@/services/authService'; // Tạm thời comment service này

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setCheckingAuth, isCheckingAuth } = useAuth();

  useEffect(() => {
    // DEV MODE — không gọi /auth/me nữa (backend chưa chạy nên luôn fail và đẩy về /login).
    // Khôi phục lại đoạn dưới đây khi backend hoạt động:
    //
    // const fetchUser = async () => {
    //   try {
    //     setUser(await authService.getMe());
    //   } catch (error) {
    //     setUser(null);
    //   } finally {
    //     setCheckingAuth(false);
    //   }
    // };
    //
    // fetchUser();

    // User giả để giao diện admin hiển thị đủ (tên, role) khi chưa đăng nhập.
    setUser({
      id: 'dev-admin',
      email: 'admin@fpt.edu.vn',
      fullName: 'Admin (Dev)',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    setCheckingAuth(false);
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
