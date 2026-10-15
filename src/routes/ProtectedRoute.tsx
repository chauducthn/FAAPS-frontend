import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../stores/useAuth';
import { RoleCode } from '../types/auth';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: RoleCode[] }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <div className="flex h-screen items-center justify-center">Đang kiểm tra quyền...</div>;
  }

  if (!isAuthenticated || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectPath = user.role ? user.role.toLowerCase() : 'login';
    return <Navigate to={`/${redirectPath}`} replace />;
  }

  return <Outlet />;
};