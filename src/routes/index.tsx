import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import AuthCallback from "../pages/auth/AuthCallback";
import LandingPage from "../pages/landing";
import DashboardLayout from "../components/layout/DashboardLayout";
import AdminLayout from "../components/layout/AdminLayout";
import MajorsPage from "../pages/admin/Majors";

const StudentPortal = () => (
  <div className="bg-white p-6 rounded shadow">
    Student transcript and study roadmap
  </div>
);

const AdvisorPortal = () => (
  <div className="bg-white p-6 rounded shadow">
    Advisor ticket management and advising support
  </div>
);

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/auth/callback", element: <AuthCallback /> },

  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/majors" replace /> },
          { path: "majors", element: <MajorsPage /> },
        ],
      },
    ],
  },

  {
    element: <DashboardLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={["STUDENT"]} />,
        children: [{ path: "/student", element: <StudentPortal /> }],
      },
      {
        element: <ProtectedRoute allowedRoles={["ADVISOR"]} />,
        children: [{ path: "/advisor", element: <AdvisorPortal /> }],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);