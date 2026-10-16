import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import LandingPage from '../pages/landing';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserAccounts from '../pages/admin/UserAccounts';
import Appointments from '../pages/admin/Appointments';
import AiReports from '../pages/admin/AiReports';
import AiReportDetail from '../pages/admin/AiReportDetail';
import AssignmentsOverview from '../pages/admin/assignments/AssignmentsOverview';
import AdvisorDetails from '../pages/admin/assignments/AdvisorDetails';
import CohortDetails from '../pages/admin/assignments/CohortDetails';
import StudentHistory from '../pages/admin/assignments/StudentHistory';

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
          { path: '/admin/appointments', element: <Appointments /> },
          { path: '/admin/ai-reports', element: <AiReports /> },
          { path: '/admin/ai-reports/:id', element: <AiReportDetail /> },
          { path: '/admin/assignments', element: <AssignmentsOverview /> },
          { path: '/admin/assignments/advisors/:advisorId', element: <AdvisorDetails /> },
          { path: '/admin/assignments/cohorts/:cohort', element: <CohortDetails /> },
          { path: '/admin/assignments/students/:studentId/history', element: <StudentHistory /> },
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
