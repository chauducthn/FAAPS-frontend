import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { PageSkeleton } from '../shared/components/common/PageSkeleton';
import { RouteErrorElement } from '../shared/components/common/ErrorBoundary';
import { ProtectedRoute } from './ProtectedRoute';
import { RequireStudentProfile } from './RequireStudentProfile';
import Login from '../modules/auth/pages/Login';
import Register from '../modules/auth/pages/Register';
import CompleteRegistration from '../modules/auth/pages/CompleteRegistration';
import AuthCallback from '../modules/auth/pages/AuthCallback';
import LandingPage from '../modules/landing/pages';
import AdminLayout from '../shared/components/layout/management/AdminLayout';
import StudentLayout from '../shared/components/layout/learning/StudentLayout';
import AdvisorLayout from '../shared/components/layout/advising/AdvisorLayout';
const AdminDashboard = lazy(() => import('../modules/management/pages/Dashboard'));
const AdminProfile = lazy(() => import('../modules/management/pages/AdminProfile'));
const AdvisingReports = lazy(() => import('../modules/management/pages/AdvisingReports'));
const UserAccounts = lazy(() => import('../modules/management/pages/UserAccounts'));
const MajorsPage = lazy(() => import('../modules/management/pages/Majors'));
const Appointments = lazy(() => import('../modules/management/pages/Appointments'));
const AiReports = lazy(() => import('../modules/management/pages/AiReports'));
const AiReportDetail = lazy(() => import('../modules/management/pages/AiReportDetail'));
const AssignmentsOverview = lazy(() => import('../modules/management/pages/assignments/AssignmentsOverview'));
const AdvisorDetails = lazy(() => import('../modules/management/pages/assignments/AdvisorDetails'));
const CohortDetails = lazy(() => import('../modules/management/pages/assignments/CohortDetails'));
const StudentHistory = lazy(() => import('../modules/management/pages/assignments/StudentHistory'));
const CohortsPage = lazy(() => import('../modules/management/pages/Cohorts'));
const CurriculumPage = lazy(() => import('../modules/management/pages/Curriculum'));
const CurriculumDetailPage = lazy(() => import('../modules/management/pages/CurriculumDetail'));
const CoursesPage = lazy(() => import('../modules/management/pages/Courses'));
const AttendancePage = lazy(() => import('../modules/management/pages/Attendance'));
const AcademicRulesPage = lazy(() => import('../modules/management/pages/AcademicRules'));
const AiConfigPage = lazy(() => import('../modules/management/pages/AiConfig'));
const AiPerformancePage = lazy(() => import('../modules/management/pages/AiPerformance'));
const StudentBookAppointment = lazy(() => import('../modules/learning/pages/BookAppointment'));
const StudentPortal = lazy(() => import('../modules/learning/pages/StudentPortal'));
const StudentAdvisingRequests = lazy(() => import('../modules/learning/pages/AdvisingRequests'));
const StudentAiChat = lazy(() => import('../modules/learning/pages/AiChat'));
const StudentAiRoadmap = lazy(() => import('../modules/learning/pages/AiRoadmap'));
const StudentProfile = lazy(() => import('../modules/learning/pages/StudentProfile'));
const StudentTranscript = lazy(() => import('../modules/learning/pages/StudentTranscript'));
const StudentCourses = lazy(() => import('../modules/learning/pages/StudentCourses'));
const StudentStudyPlan = lazy(() => import('../modules/learning/pages/StudentStudyPlan'));
const StudentLearningPlan = lazy(() => import('../modules/learning/pages/StudentLearningPlan'));
const AdvisorAppointments = lazy(() => import('../modules/advising/pages/AdvisorAppointments'));
const AdvisorPortal = lazy(() => import('../modules/advising/pages/AdvisorPortal'));
const AdvisorAdvisingRequests = lazy(() => import('../modules/advising/pages/AdvisorAdvisingRequests'));
const AdvisorConversationWorkspace = lazy(() => import('../modules/advising/pages/AdvisorConversationWorkspace'));
const AdvisorStudyPlans = lazy(() => import('../modules/advising/pages/AdvisorStudyPlans'));
const AdvisorStudents = lazy(() => import('../modules/advising/pages/AdvisorStudents'));
const AdvisorAcademicLookup = lazy(() => import('../modules/advising/pages/AdvisorAcademicLookup'));
const AdvisorReports = lazy(() => import('../modules/advising/pages/AdvisorReports'));
const AdvisorProfile = lazy(() => import('../modules/advising/pages/AdvisorProfile'));
const AdvisorNotifications = lazy(() => import('../modules/advising/pages/AdvisorNotifications'));

/** Bọc mọi route lazy bằng Suspense + skeleton để không nháy màn trắng khi tải chunk. */
const suspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <RouteErrorElement /> },
  { path: '/login', element: <Login />, errorElement: <RouteErrorElement /> },
  { path: '/register', element: <Register />, errorElement: <RouteErrorElement /> },
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
          { path: '/admin/profile', element: suspense(<AdminProfile />) },
          { path: '/admin/users', element: suspense(<UserAccounts />) },
          { path: '/admin/majors', element: suspense(<MajorsPage />) },
          { path: '/admin/cohorts', element: suspense(<CohortsPage />) },
          { path: '/admin/curriculum', element: suspense(<CurriculumPage />) },
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
              { path: '/student/profile', element: suspense(<StudentProfile />) },
              { path: '/student/transcript', element: suspense(<StudentTranscript />) },
              { path: '/student/courses', element: suspense(<StudentCourses />) },
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
          { path: '/advisor/students', element: suspense(<AdvisorStudents />) },
          { path: '/advisor/appointments', element: suspense(<AdvisorAppointments />) },
          { path: '/advisor/conversations', element: suspense(<AdvisorConversationWorkspace />) },
          { path: '/advisor/study-plans', element: suspense(<AdvisorStudyPlans />) },
          { path: '/advisor/academic-lookup', element: suspense(<AdvisorAcademicLookup />) },
          { path: '/advisor/reports', element: suspense(<AdvisorReports />) },
          { path: '/advisor/profile', element: suspense(<AdvisorProfile />) },
          { path: '/advisor/notifications', element: suspense(<AdvisorNotifications />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace />, errorElement: <RouteErrorElement /> },
]);
