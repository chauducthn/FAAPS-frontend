import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import LandingPage from '../pages/landing';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserAccounts from '../pages/admin/UserAccounts';

const StudentPortal = () => <div className="bg-white p-6 rounded shadow">Student transcript and study roadmap</div>;
const AdvisorPortal = () => <div className="bg-white p-6 rounded shadow">Advisor ticket management and advising support</div>;

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/users', element: <UserAccounts /> },
        ],
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['STUDENT']} />,
        children: [{ path: '/student', element: <StudentPortal /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={['ADVISOR']} />,
        children: [{ path: '/advisor', element: <AdvisorPortal /> }],
      }
    ]
  }
]);
