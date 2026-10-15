import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import LandingPage from '../pages/landing';
import DashboardLayout from '../components/layout/DashboardLayout';

const AdminDashboard = () => <div className="bg-white p-6 rounded shadow">Admin area</div>;
const StudentPortal = () => <div className="bg-white p-6 rounded shadow">Student transcript and study roadmap</div>;
const AdvisorPortal = () => <div className="bg-white p-6 rounded shadow">Advisor ticket management and advising support</div>;

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
  {
    element: <DashboardLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [{ path: '/admin', element: <AdminDashboard /> }],
      },
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