import { Outlet } from 'react-router';
import type { RoleCode } from '../types/auth';

/**
 * DEV MODE — các ràng buộc xác thực/phân quyền đã được tạm comment để mở /admin
 * mà không cần đăng nhập (backend chưa sẵn sàng).
 *
 * Khôi phục lại khi backend hoạt động (bỏ comment và dùng lại các import):
 *
 * import { Navigate, Outlet } from 'react-router';
 * import { useAuth } from '../stores/useAuth';
 *
 * export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: RoleCode[] }) => {
 *   const { user, isAuthenticated, isCheckingAuth } = useAuth();
 *
 *   if (isCheckingAuth) {
 *     return <div className="flex h-screen items-center justify-center">Checking permissions...</div>;
 *   }
 *
 *   if (!isAuthenticated || !user || !user.role) {
 *     return <Navigate to="/login" replace />;
 *   }
 *
 *   if (!allowedRoles.includes(user.role)) {
 *     const redirectPath = user.role ? user.role.toLowerCase() : 'login';
 *     return <Navigate to={`/${redirectPath}`} replace />;
 *   }
 *
 *   return <Outlet />;
 * };
 */
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: RoleCode[] }) => {
  void allowedRoles; // DEV MODE: allowedRoles chưa được dùng.
  return <Outlet />;
};
