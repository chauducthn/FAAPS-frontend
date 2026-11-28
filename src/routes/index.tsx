import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { PageSkeleton } from '../shared/components/common/PageSkeleton';
import { RouteErrorElement } from '../shared/components/common/ErrorBoundary';
import { ProtectedRoute } from './ProtectedRoute';
import { RequireStudentProfile } from './RequireStudentProfile';
import Login from '../modules/auth/pages/Login';
import Register from '../modules/auth/pages/Register';
import ForgotPassword from '../modules/auth/pages/ForgotPassword';
import ResetPassword from '../modules/auth/pages/ResetPassword';
import CompleteRegistration from '../modules/auth/pages/CompleteRegistration';
import AuthCallback from '../modules/auth/pages/AuthCallback';
import LandingPage from '../modules/landing/pages';
import AdminLayout from '../shared/components/layout/management/AdminLayout';
import StudentLayout from '../shared/components/layout/learning/StudentLayout';
import AdvisorLayout from '../shared/components/layout/advising/AdvisorLayout';
import { OPEN_PROFILE_STATE } from '../shared/components/layout/portal/profileDrawerContext';
const AdminDashboard = lazy(() => import('../modules/management/pages/Dashboard'));
const AdvisingReports = lazy(() => import('../modules/management/pages/AdvisingReports'));
const UserAccounts = lazy(() => import('../modules/management/pages/UserAccounts'));
const Appointments = lazy(() => import('../modules/management/pages/Appointments'));
const AiReports = lazy(() => import('../modules/management/pages/AiReports'));
const AiReportDetail = lazy(() => import('../modules/management/pages/AiReportDetail'));
const AssignmentsOverview = lazy(() => import('../modules/management/pages/assignments/AssignmentsOverview'));
const AdvisorDetails = lazy(() => import('../modules/management/pages/assignments/AdvisorDetails'));
const CohortDetails = lazy(() => import('../modules/management/pages/assignments/CohortDetails'));
const StudentHistory = lazy(() => import('../modules/management/pages/assignments/StudentHistory'));
const CohortsPage = lazy(() => import('../modules/management/pages/Cohorts'));
const CurriculumDetailPage = lazy(() => import('../modules/management/pages/CurriculumDetail'));
const CoursesPage = lazy(() => import('../modules/management/pages/Courses'));
const AttendancePage = lazy(() => import('../modules/management/pages/Attendance'));
const AcademicRulesPage = lazy(() => import('../modules/management/pages/AcademicRules'));
const AiConfigPage = lazy(() => import('../modules/management/pages/AiConfig'));
const AiPerformancePage = lazy(() => import('../modules/management/pages/AiPerformance'));
const DatabaseManagementPage = lazy(() => import('../modules/management/pages/DatabaseManagement'));
const StudentBookAppointment = lazy(() => import('../modules/learning/pages/BookAppointment'));
const StudentPortal = lazy(() => import('../modules/learning/pages/StudentPortal'));
const StudentAdvisingRequests = lazy(() => import('../modules/learning/pages/AdvisingRequests'));
const StudentAiChat = lazy(() => import('../modules/learning/pages/AiChat'));
const StudentAiRoadmap = lazy(() => import('../modules/learning/pages/AiRoadmap'));
const StudentTranscript = lazy(() => import('../modules/learning/pages/StudentTranscript'));
const StudentCurriculum = lazy(() => import('../modules/learning/pages/StudentCurriculum'));
const StudentCurriculumGoals = lazy(() => import('../modules/learning/pages/StudentCurriculumGoals'));
const StudentStudyPlan = lazy(() => import('../modules/learning/pages/StudentStudyPlan'));
const StudentLearningPlan = lazy(() => import('../modules/learning/pages/StudentLearningPlan'));
const AdvisorAppointments = lazy(() => import('../modules/advising/pages/AdvisorAppointments'));
const AdvisorPortal = lazy(() => import('../modules/advising/pages/AdvisorPortal'));
const AdvisorAdvisingRequests = lazy(() => import('../modules/advising/pages/AdvisorAdvisingRequests'));
const AdvisorStudyPlans = lazy(() => import('../modules/advising/pages/AdvisorStudyPlans'));
const AdvisorAcademicLookup = lazy(() => import('../modules/advising/pages/AdvisorAcademicLookup'));
const AdvisorReports = lazy(() => import('../modules/advising/pages/AdvisorReports'));
const AdvisorNotifications = lazy(() => import('../modules/advising/pages/AdvisorNotifications'));

/** Wraps every lazy route in Suspense with a skeleton so loading a chunk never flashes a blank screen. */
const suspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <RouteErrorElement /> },
  { path: '/login', element: <Login />, errorElement: <RouteErrorElement /> },
  { path: '/register', element: <Register />, errorElement: <RouteErrorElement /> },
  { path: '/forgot-password', element: <ForgotPassword />, errorElement: <RouteErrorElement /> },
  { path: '/reset-password', element: <ResetPassword />, errorElement: <RouteErrorElement /> },
  {
    element: <ProtectedRoute allowedRoles={['STUDENT']} />,
    errorElement: <RouteErrorElement />,
    children: [{ path: '/register/complete', element: <CompleteRegistration /> }],
  },
  { path: '/auth/callback', element: <AuthCallback />, errorElement: <RouteErrorElement /> },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: suspense(<AdminDashboard />) },
          { path: '/admin/profile', element: <Navigate to="/admin" replace state={OPEN_PROFILE_STATE} /> },
          { path: '/admin/users', element: suspense(<UserAccounts />) },
          { path: '/admin/majors', element: suspense(<CohortsPage />) },
          { path: '/admin/cohorts', element: <Navigate to="/admin/majors?tab=cohorts" replace /> },
          { path: '/admin/curriculum', element: <Navigate to="/admin/majors?tab=cohorts" replace /> },
          { path: '/admin/curriculum/:id', element: suspense(<CurriculumDetailPage />) },
          { path: '/admin/courses', element: suspense(<CoursesPage />) },
          { path: '/admin/attendance', element: suspense(<AttendancePage />) },
          { path: '/admin/rules', element: suspense(<AcademicRulesPage />) },
          { path: '/admin/ai-config', element: suspense(<AiConfigPage />) },
          { path: '/admin/ai-performance', element: suspense(<AiPerformancePage />) },
          { path: '/admin/appointments', element: suspense(<Appointments />) },
          { path: '/admin/reports', element: suspense(<AdvisingReports />) },
          { path: '/admin/ai-reports', element: suspense(<AiReports />) },
          { path: '/admin/ai-reports/:id', element: suspense(<AiReportDetail />) },
          { path: '/admin/database', element: suspense(<DatabaseManagementPage />) },
          { path: '/admin/assignments', element: suspense(<AssignmentsOverview />) },
          { path: '/admin/assignments/advisors/:advisorId', element: suspense(<AdvisorDetails />) },
          { path: '/admin/assignments/cohorts/:cohortId', element: suspense(<CohortDetails />) },
          { path: '/admin/assignments/students/:studentId/history', element: suspense(<StudentHistory />) },
        ],
      },
    ],
  },
  {
    element: <StudentLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['STUDENT']} />,
        errorElement: <RouteErrorElement />,
        children: [
          {
            element: <RequireStudentProfile />,
            errorElement: <RouteErrorElement />,
            children: [
              { path: '/student', element: suspense(<StudentPortal />) },
              { path: '/student/ai-chat', element: suspense(<StudentAiChat />) },
              { path: '/student/ai-roadmap', element: suspense(<StudentAiRoadmap />) },
              { path: '/student/advising-requests', element: suspense(<StudentAdvisingRequests />) },
              { path: '/student/appointments', element: suspense(<StudentBookAppointment />) },
              { path: '/student/profile', element: <Navigate to="/student" replace state={OPEN_PROFILE_STATE} /> },
              { path: '/student/transcript', element: suspense(<StudentTranscript />) },
              { path: '/student/curriculum', element: suspense(<StudentCurriculum />) },
              { path: '/student/study-journey', element: suspense(<StudentCurriculumGoals />) },
              { path: '/student/study-goals', element: <Navigate to="/student/study-journey" replace /> },
              { path: '/student/curriculum-goals', element: <Navigate to="/student/study-journey" replace /> },
              { path: '/student/courses', element: <Navigate to="/student/curriculum" replace /> },
              { path: '/student/study-plan', element: suspense(<StudentStudyPlan />) },
              { path: '/student/learning-plan', element: suspense(<StudentLearningPlan />) },
              // The conversation with the advisor now lives in the detail of an advising request.
              { path: '/student/advising', element: <Navigate to="/student/advising-requests" replace /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AdvisorLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['ADVISOR']} />,
        errorElement: <RouteErrorElement />,
        children: [
          { path: '/advisor', element: suspense(<AdvisorPortal />) },
          { path: '/advisor/advising-requests', element: suspense(<AdvisorAdvisingRequests />) },
          { path: '/advisor/appointments', element: suspense(<AdvisorAppointments />) },
          // My Students was retired with the shared multi-advisor queue.
          { path: '/advisor/students', element: <Navigate to="/advisor/advising-requests" replace /> },
          // Advising Requests is a ticket queue (list, chat and closing in one page), so Conversations redirects there.
          { path: '/advisor/conversations', element: <Navigate to="/advisor/advising-requests" replace /> },
          { path: '/advisor/study-plans', element: suspense(<AdvisorStudyPlans />) },
          { path: '/advisor/academic-lookup', element: suspense(<AdvisorAcademicLookup />) },
          { path: '/advisor/reports', element: suspense(<AdvisorReports />) },
          { path: '/advisor/profile', element: <Navigate to="/advisor" replace state={OPEN_PROFILE_STATE} /> },
          { path: '/advisor/notifications', element: suspense(<AdvisorNotifications />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace />, errorElement: <RouteErrorElement /> },
]);
