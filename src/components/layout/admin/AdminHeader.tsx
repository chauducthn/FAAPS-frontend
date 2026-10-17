// src/components/layout/AdminHeader.tsx
import { useState } from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../../stores/useAuth';
import { authService } from '../../../services/authService';

export default function AdminHeader() {
  const { user, logout: clearStore } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearStore();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error', error);
      clearStore();
      window.location.href = '/login';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-8 shrink-0 relative z-20">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <span>Console</span>
        <span className="text-gray-300">›</span>
        <span className="font-bold text-gray-800">Academic Admin Center</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative cursor-pointer">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* User Profile & Menu Đăng xuất */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 cursor-pointer pl-2 border-l border-gray-200 focus:outline-none"
          >
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"}
              alt="Admin Avatar"
              className="w-7 h-7 rounded-full object-cover border border-gray-200"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800 leading-none">{user?.fullName || 'Admin User'}</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">{user?.role || 'ADMIN'}</p>
            </div>
            <ChevronDown className="size-3.5 text-gray-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 shadow-xl rounded-xl p-1.5 z-30 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@fpt.edu.vn'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}