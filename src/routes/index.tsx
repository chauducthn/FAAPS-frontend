import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/auth/Login';
import LandingPage from '../pages/landing';
import DashboardLayout from '../components/layout/DashboardLayout';

const AdminDashboard = () => <div className="bg-white p-6 rounded shadow">Khu vực dành riêng cho Admin</div>;
const StudentPortal = () => <div className="bg-white p-6 rounded shadow">Bảng điểm và Lộ trình của Sinh viên</div>;
const AdvisorPortal = () => <div className="bg-white p-6 rounded shadow">Quản lý Ticket và Hỗ trợ Tư vấn</div>;

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