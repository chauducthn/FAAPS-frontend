import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import LandingPage from '../pages/landing';
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
import AcademicRulesPage from '../pages/admin/AcademicRules';
import AiConfigPage from '../pages/admin/AiConfig';
import AiPerformancePage from '../pages/admin/AiPerformance';
import StudentLayout from '../components/layout/student/StudentLayout';
import AdvisorLayout from '../components/layout/advisor/AdvisorLayout';
import StudentBookAppointment from '../pages/student/BookAppointment';
import StudentPortal from '../pages/student/StudentPortal';
import StudentAdvisingRequests from '../pages/student/AdvisingRequests';
import StudentAiChat from '../pages/student/AiChat';
import StudentAiRoadmap from '../pages/student/AiRoadmap';
import AdvisorAppointments from '../pages/advisor/AdvisorAppointments';
import AdvisorPortal from '../pages/advisor/AdvisorPortal';
import AdvisorAdvisingRequests from '../pages/advisor/AdvisorAdvisingRequests';

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
          { path: '/admin/rules', element: <AcademicRulesPage /> },
          { path: '/admin/ai-config', element: <AiConfigPage /> },
          { path: '/admin/ai-performance', element: <AiPerformancePage /> },
          { path: '/admin/appointments', element: <Appointments /> },
          { path: '/admin/ai-reports', element: <AiReports /> },
          { path: '/admin/ai-reports/:id', element: <AiReportDetail /> },
          { path: '/admin/assignments', element: <AssignmentsOverview /> },
          { path: '/admin/assignments/advisors/:advisorId', element: <AdvisorDetails /> },
          { path: '/admin/assignments/cohorts/:cohortId', element: <CohortDetails /> },
          { path: '/admin/assignments/students/:studentId/history', element: <StudentHistory /> },
        ],
      },
    ],
  },
  {
    element: <StudentLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['STUDENT']} />,
        children: [
          { path: '/student', element: <StudentPortal /> },
          { path: '/student/ai-chat', element: <StudentAiChat /> },
          { path: '/student/ai-roadmap', element: <StudentAiRoadmap /> },
          { path: '/student/advising-requests', element: <StudentAdvisingRequests /> },
          { path: '/student/appointments', element: <StudentBookAppointment /> },
        ],
      },
    ],
  },
  {
    element: <AdvisorLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['ADVISOR']} />,
        children: [
          { path: '/advisor', element: <AdvisorPortal /> },
          { path: '/advisor/advising-requests', element: <AdvisorAdvisingRequests /> },
          { path: '/advisor/appointments', element: <AdvisorAppointments /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
