import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import AuthCallback from '../pages/auth/AuthCallback';
import LandingPage from '../pages/landing';
import AdminLayout from '../components/layout/admin/AdminLayout';
import StudentLayout from '../components/layout/student/StudentLayout';
import AdvisorLayout from '../components/layout/advisor/AdvisorLayout';
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UserAccounts = lazy(() => import('../pages/admin/UserAccounts'));
const MajorsPage = lazy(() => import('../pages/admin/Majors'));
const Appointments = lazy(() => import('../pages/admin/Appointments'));
const AiReports = lazy(() => import('../pages/admin/AiReports'));
const AiReportDetail = lazy(() => import('../pages/admin/AiReportDetail'));
const AssignmentsOverview = lazy(() => import('../pages/admin/assignments/AssignmentsOverview'));
const AdvisorDetails = lazy(() => import('../pages/admin/assignments/AdvisorDetails'));
const CohortDetails = lazy(() => import('../pages/admin/assignments/CohortDetails'));
const StudentHistory = lazy(() => import('../pages/admin/assignments/StudentHistory'));
const CohortsPage = lazy(() => import('../pages/admin/Cohorts'));
const CurriculumPage = lazy(() => import('../pages/admin/Curriculum'));
const CurriculumDetailPage = lazy(() => import('../pages/admin/CurriculumDetail'));
const CoursesPage = lazy(() => import('../pages/admin/Courses'));
const AcademicRulesPage = lazy(() => import('../pages/admin/AcademicRules'));
const AiConfigPage = lazy(() => import('../pages/admin/AiConfig'));
const AiPerformancePage = lazy(() => import('../pages/admin/AiPerformance'));
const StudentBookAppointment = lazy(() => import('../pages/student/BookAppointment'));
const StudentPortal = lazy(() => import('../pages/student/StudentPortal'));
const StudentAdvisingRequests = lazy(() => import('../pages/student/AdvisingRequests'));
const StudentAiChat = lazy(() => import('../pages/student/AiChat'));
const StudentAiRoadmap = lazy(() => import('../pages/student/AiRoadmap'));
const StudentOverview = lazy(() => import('../pages/student/StudentOverview'));
const StudentProfile = lazy(() => import('../pages/student/StudentProfile'));
const StudentTranscript = lazy(() => import('../pages/student/StudentTranscript'));
const StudentCourses = lazy(() => import('../pages/student/StudentCourses'));
const StudentPlans = lazy(() => import('../pages/student/StudentPlans'));
const StudentAdvising = lazy(() => import('../pages/student/StudentAdvising'));
const AdvisorAppointments = lazy(() => import('../pages/advisor/AdvisorAppointments'));
const AdvisorPortal = lazy(() => import('../pages/advisor/AdvisorPortal'));
const AdvisorAdvisingRequests = lazy(() => import('../pages/advisor/AdvisorAdvisingRequests'));
const AdvisorConversationWorkspace = lazy(() => import('../pages/advisor/AdvisorConversationWorkspace'));
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
