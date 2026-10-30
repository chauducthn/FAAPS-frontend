import { Navigate, Outlet } from 'react-router';
import { useRegistrationProfile } from '../modules/auth/hooks/queries/useStudentOnboarding';

/**
 * A student who has just signed in with Google has no Student ID or curriculum yet, so the study pages cannot
 * work. Send them to the second step of registration first.
 */
export const RequireStudentProfile = () => {
  const profile = useRegistrationProfile();

  if (profile.isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  // If the profile cannot be read, let the pages show their own errors instead of looping back here.
  if (profile.data && !profile.data.studentCode) return <Navigate to="/register/complete" replace />;

  return <Outlet />;
};
