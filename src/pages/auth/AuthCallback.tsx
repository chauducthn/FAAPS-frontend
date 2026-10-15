import { Navigate } from 'react-router';
import { useAuth } from '../../stores/useAuth';

export default function AuthCallback() {
  const user = useAuth((state) => state.user);

  if (!user || user.status !== 'ACTIVE') {
    return <Navigate to="/login?error=google-sign-in-failed" replace />;
  }

  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}
