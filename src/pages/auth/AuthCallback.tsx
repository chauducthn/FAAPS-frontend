import { Navigate } from 'react-router';
import { useAuth } from '../../stores/useAuth';

/** Landing page of the Google redirect. The backend already set the session cookie; this routes by role. */
export default function AuthCallback() {
  const { user, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Finishing sign-in...</div>;
  }

  if (!user) {
    return <Navigate to="/login?error=google-sign-in-failed" replace />;
  }

  if (user.status !== 'ACTIVE') {
    return <Navigate to="/login?error=account-disabled" replace />;
  }

  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}
