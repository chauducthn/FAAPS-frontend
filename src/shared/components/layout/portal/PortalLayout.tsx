// src/components/layout/portal/PortalLayout.tsx
// Layout dùng chung cho Student Portal và Advisor Portal.
// Cấu trúc giống hệt AdminLayout: sidebar trượt dọc (desktop) / overlay (mobile),
// header sticky 1 hàng, dropdown đăng xuất — nhưng header/nav là riêng cho từng vai trò.

import { Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { ChevronDown, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { Logo } from '@/shared/components/common/Logo';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '../../../../modules/auth/stores/useAuth';
import { authService } from '../../../../modules/auth/services/authService';

export interface PortalNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Đánh dấu trang chủ — dùng `end` cho NavLink để không sáng ở các sub-route. */
  end?: boolean;
}

export interface PortalNavSection {
  title?: string;
  items: PortalNavItem[];
}

interface PortalLayoutProps {
  navSections: PortalNavSection[];
  /** Đường dẫn logo trỏ tới. */
  homePath: string;
  /** Nhãn vai trò hiển thị dưới tên người dùng. */
  roleLabel: string;
  /** Nội dung bên phải header (vd: chuông thông báo, nút demo data). */
  headerExtra?: React.ReactNode;
}

export function PortalSidebar({
  navSections,
  homePath,
  onNavigate,
}: {
  navSections: PortalNavSection[];
  homePath: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-2" aria-label="Portal navigation">
      {navSections.map((section, i) => (
        <div key={section.title ?? i} className="flex flex-col gap-2">
          {section.title && (
            <p className="px-2 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#555f6f]">
              {section.title}
            </p>
          )}
          {section.items.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg border-l-[3px] border-transparent p-2 text-sm font-medium text-[#555f6f] hover:bg-gray-50',
                  isActive &&
                    'border-[#f37021] bg-[#fff7ed] font-semibold text-[#f37021] hover:bg-[#fff7ed]',
                )
              }
            >
              <Icon className="size-[18px]" />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function PortalLayout({
  navSections,
  homePath,
  roleLabel,
  headerExtra,
}: PortalLayoutProps) {
  const { user, logout: clearStore } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) =>
      profileRef.current && !profileRef.current.contains(e.target as Node) && setProfileOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    setLogoutError(false);
    try {
      await authService.logout();
      clearStore();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign-out error', error);
      setLogoutError(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] font-sans">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-[#e5e7eb] px-4">
          <Logo to={homePath} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <PortalSidebar navSections={navSections} homePath={homePath} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-4 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <div className="hidden lg:block" />

          <div className="relative flex items-center gap-2 sm:gap-4">
            {headerExtra}
            {logoutError && (
              <span className="text-sm text-red-600">Unable to sign out. Please try again.</span>
            )}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                aria-expanded={profileOpen}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 ring-1 ring-[#e5e7eb]">
                  {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-[19px] text-[#151c27]">
                    {user?.fullName}
                  </span>
                  <span className="block text-[11px] uppercase leading-4 tracking-[0.05em] text-[#555f6f]">
                    {roleLabel}
                  </span>
                </span>
                <ChevronDown className="size-3 text-[#555f6f]" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-[#e5e7eb] bg-white p-1 shadow-md">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[260px] overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Logo to={homePath} />
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <PortalSidebar
                navSections={navSections}
                homePath={homePath}
                onNavigate={() => setMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Suspense fallback={<p className="text-sm text-gray-500">Loading page...</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
