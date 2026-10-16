// src/components/layout/AdminLayout.tsx
import { Outlet } from 'react-router';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-800 overflow-hidden">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Khung nội dung bên phải (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />

        {/* Nội dung thay đổi theo Route */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}