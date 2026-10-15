import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../stores/useAuth';
import { RoleCode } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles: RoleCode[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status !== 'ACTIVE') {
    return <Navigate to="/login" replace state={{ error: 'ACCOUNT_RESTRICTED' }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return <Outlet />;
};