import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../modules/auth/stores/useAuth';
import { RoleCode } from '../modules/auth/types/auth';
import { Suspense } from 'react';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: RoleCode[] }) => {
  const { user, isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <div className="flex h-screen items-center justify-center">Checking permissions...</div>;
  }

  if (!isAuthenticated || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectPath = user.role ? user.role.toLowerCase() : 'login';
    return <Navigate to={`/${redirectPath}`} replace />;
  }

  return <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}><Outlet /></Suspense>;
};
