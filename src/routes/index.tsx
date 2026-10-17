import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import LandingPage from '../pages/landing';
import DashboardLayout from '../components/layout/admin/DashboardLayout';
import AdminLayout from '../components/layout/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserAccounts from '../pages/admin/UserAccounts';
import MajorsPage from '../pages/admin/Majors';
import Appointments from '../pages/admin/Appointments';
import AiReports from '../pages/admin/AiReports';
import AiReportDetail from '../pages/admin/AiReportDetail';
import AssignmentsOverview from '../pages/admin/assignments/AssignmentsOverview';
import AdvisorDetails from '../pages/admin/assignments/AdvisorDetails';
import CohortDetails from '../pages/admin/assignments/CohortDetails';
import StudentHistory from '../pages/admin/assignments/StudentHistory';
import CohortsPage from '../pages/admin/Cohorts';
import CurriculumPage from '../pages/admin/Curriculum';
import CurriculumDetailPage from '../pages/admin/CurriculumDetail';
import CoursesPage from '../pages/admin/Courses';
import ImportHistoryPage from '../pages/admin/ImportHistory';
import ImportDetailModal from '../pages/admin/ImportDetail';
import AcademicRulesPage from '../pages/admin/AcademicRules';
import AiConfigPage from '../pages/admin/AiConfig';
import AiPerformancePage from '../pages/admin/AiPerformance';

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
          { path: '/admin/majors', element: <MajorsPage /> },
          { path: '/admin/cohorts', element: <CohortsPage /> },
          { path: '/admin/curriculum', element: <CurriculumPage /> },
          { path: '/admin/curriculum/:id', element: <CurriculumDetailPage /> },
          { path: '/admin/courses', element: <CoursesPage /> },
          { path: '/admin/import-history', element: <ImportHistoryPage /> },
          { path: '/admin/import-history/new', element: <ImportDetailModal open onClose={() => history.back()} /> },
          { path: '/admin/rules', element: <AcademicRulesPage /> },
          { path: '/admin/ai-config', element: <AiConfigPage /> },
          { path: '/admin/ai-performance', element: <AiPerformancePage /> },
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
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
