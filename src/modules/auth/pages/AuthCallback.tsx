import { Navigate } from 'react-router';
import { useAuth } from '../stores/useAuth';
import { AuthStatusScreen } from '../components/AuthStatusScreen';

/** Landing page of the Google redirect. The backend already set the session cookie; this routes by role. */
export default function AuthCallback() {
  const { user, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <AuthStatusScreen message="Finishing sign-in..." busy />;
  }

  if (!user) {
    return <Navigate to="/login?error=google-sign-in-failed" replace />;
  }

  if (user.status !== 'ACTIVE') {
    return <Navigate to="/login?error=account-disabled" replace />;
  }

  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}
