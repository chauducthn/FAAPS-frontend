import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../modules/auth/pages/Login';
import AuthCallback from '../modules/auth/pages/AuthCallback';
import LandingPage from '../modules/landing/pages';
import AdminLayout from '../shared/components/layout/management/AdminLayout';
import StudentLayout from '../shared/components/layout/learning/StudentLayout';
import AdvisorLayout from '../shared/components/layout/advising/AdvisorLayout';
const AdminDashboard = lazy(() => import('../modules/management/pages/Dashboard'));
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
const AcademicRulesPage = lazy(() => import('../modules/management/pages/AcademicRules'));
const AiConfigPage = lazy(() => import('../modules/management/pages/AiConfig'));
const AiPerformancePage = lazy(() => import('../modules/management/pages/AiPerformance'));
const StudentBookAppointment = lazy(() => import('../modules/learning/pages/BookAppointment'));
const StudentPortal = lazy(() => import('../modules/learning/pages/StudentPortal'));
const StudentAdvisingRequests = lazy(() => import('../modules/learning/pages/AdvisingRequests'));
const StudentAiChat = lazy(() => import('../modules/learning/pages/AiChat'));
const StudentAiRoadmap = lazy(() => import('../modules/learning/pages/AiRoadmap'));
const StudentOverview = lazy(() => import('../modules/learning/pages/StudentOverview'));
const StudentProfile = lazy(() => import('../modules/learning/pages/StudentProfile'));
const StudentTranscript = lazy(() => import('../modules/learning/pages/StudentTranscript'));
const StudentCourses = lazy(() => import('../modules/learning/pages/StudentCourses'));
const StudentPlans = lazy(() => import('../modules/learning/pages/StudentPlans'));
const StudentAdvising = lazy(() => import('../modules/learning/pages/StudentAdvising'));
const AdvisorAppointments = lazy(() => import('../modules/advising/pages/AdvisorAppointments'));
const AdvisorPortal = lazy(() => import('../modules/advising/pages/AdvisorPortal'));
const AdvisorAdvisingRequests = lazy(() => import('../modules/advising/pages/AdvisorAdvisingRequests'));
const AdvisorConversationWorkspace = lazy(() => import('../modules/advising/pages/AdvisorConversationWorkspace'));
const AdvisorStudyPlans = lazy(() => import('../modules/advising/pages/AdvisorStudyPlans'));
const AdvisorProfile = lazy(() => import('../modules/advising/pages/AdvisorProfile'));
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
          { path: '/advisor/study-plans', element: <AdvisorStudyPlans /> },
          { path: '/advisor/profile', element: <AdvisorProfile /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
