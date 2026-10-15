import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../../stores/useAuth";
import { authService } from "../../services/authService";

export default function DashboardLayout() {
  const { user, logout: clearStore } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Sign-out error", error);
    } finally {
      clearStore();
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white text-xl">
            F
          </div>
          FAAPS{" "}
          <span className="text-sm font-normal text-gray-500">
            | {user?.role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700 font-medium">
            {user?.fullName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
