import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import LandingPage from '../pages/landing';
import AdminLayout from '../components/layout/management/AdminLayout';
import StudentLayout from '../components/layout/learning/StudentLayout';
import AdvisorLayout from '../components/layout/advising/AdvisorLayout';
const AdminDashboard = lazy(() => import('../pages/management/Dashboard'));
const UserAccounts = lazy(() => import('../pages/management/UserAccounts'));
const MajorsPage = lazy(() => import('../pages/management/Majors'));
const Appointments = lazy(() => import('../pages/management/Appointments'));
const AiReports = lazy(() => import('../pages/management/AiReports'));
const AiReportDetail = lazy(() => import('../pages/management/AiReportDetail'));
const AssignmentsOverview = lazy(() => import('../pages/management/assignments/AssignmentsOverview'));
const AdvisorDetails = lazy(() => import('../pages/management/assignments/AdvisorDetails'));
const CohortDetails = lazy(() => import('../pages/management/assignments/CohortDetails'));
const StudentHistory = lazy(() => import('../pages/management/assignments/StudentHistory'));
const CohortsPage = lazy(() => import('../pages/management/Cohorts'));
const CurriculumPage = lazy(() => import('../pages/management/Curriculum'));
const CurriculumDetailPage = lazy(() => import('../pages/management/CurriculumDetail'));
const CoursesPage = lazy(() => import('../pages/management/Courses'));
const AcademicRulesPage = lazy(() => import('../pages/management/AcademicRules'));
const AiConfigPage = lazy(() => import('../pages/management/AiConfig'));
const AiPerformancePage = lazy(() => import('../pages/management/AiPerformance'));
const StudentBookAppointment = lazy(() => import('../pages/learning/BookAppointment'));
const StudentPortal = lazy(() => import('../pages/learning/StudentPortal'));
const StudentAdvisingRequests = lazy(() => import('../pages/learning/AdvisingRequests'));
const StudentAiChat = lazy(() => import('../pages/learning/AiChat'));
const StudentAiRoadmap = lazy(() => import('../pages/learning/AiRoadmap'));
const StudentOverview = lazy(() => import('../pages/learning/StudentOverview'));
const StudentProfile = lazy(() => import('../pages/learning/StudentProfile'));
const StudentTranscript = lazy(() => import('../pages/learning/StudentTranscript'));
const StudentCourses = lazy(() => import('../pages/learning/StudentCourses'));
const StudentPlans = lazy(() => import('../pages/learning/StudentPlans'));
const StudentAdvising = lazy(() => import('../pages/learning/StudentAdvising'));
const AdvisorAppointments = lazy(() => import('../pages/advising/AdvisorAppointments'));
const AdvisorPortal = lazy(() => import('../pages/advising/AdvisorPortal'));
const AdvisorAdvisingRequests = lazy(() => import('../pages/advising/AdvisorAdvisingRequests'));
const AdvisorConversationWorkspace = lazy(() => import('../pages/advising/AdvisorConversationWorkspace'));
const suspense = (element: React.ReactNode) => <Suspense fallback={<p className="p-6 text-sm">Loading...</p>}>{element}</Suspense>;

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
          { path: '/admin', element: suspense(<AdminDashboard />) },
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
          { path: '/student/academic-overview', element: <StudentOverview /> },
          { path: '/student/profile', element: <StudentProfile /> },
          { path: '/student/transcript', element: <StudentTranscript /> },
          { path: '/student/courses', element: <StudentCourses /> },
          { path: '/student/plans', element: <StudentPlans /> },
          { path: '/student/advising', element: <StudentAdvising /> },
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
          { path: '/advisor/conversations', element: <AdvisorConversationWorkspace /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
